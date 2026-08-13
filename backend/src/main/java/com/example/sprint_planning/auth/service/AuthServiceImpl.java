package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;
import com.example.sprint_planning.auth.dto.AuthTokensResponse;
import com.example.sprint_planning.auth.dto.CurrentUserResponse;
import com.example.sprint_planning.auth.dto.OtpChallengeResponse;
import com.example.sprint_planning.auth.dto.SigninRequest;
import com.example.sprint_planning.auth.dto.SignupRequest;
import com.example.sprint_planning.auth.dto.VerifyOtpRequest;
import com.example.sprint_planning.auth.model.OtpCode;
import com.example.sprint_planning.common.exception.EmailAlreadyExistsException;
import com.example.sprint_planning.common.exception.InvalidCredentialsException;
import com.example.sprint_planning.common.exception.InvalidOtpException;
import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.common.exception.TenantAccessDeniedException;
import com.example.sprint_planning.config.JwtProperties;
import com.example.sprint_planning.rbac.AuthorityMapper;
import com.example.sprint_planning.security.AuthenticatedUser;
import com.example.sprint_planning.security.jwt.JwtTokenProvider;
import com.example.sprint_planning.tenant.dto.TenantResponse;
import com.example.sprint_planning.tenant.model.TenantMembership;
import com.example.sprint_planning.tenant.service.TenantService;
import com.example.sprint_planning.user.AuthProvider;
import com.example.sprint_planning.user.dto.UserResponse;
import com.example.sprint_planning.user.mapper.UserMapper;
import com.example.sprint_planning.user.model.User;
import com.example.sprint_planning.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;
    private final TenantService tenantService;
    private final JwtTokenProvider tokenProvider;
    private final AuthorityMapper authorityMapper;
    private final UserMapper userMapper;
    private final JwtProperties jwtProperties;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           OtpService otpService,
                           RefreshTokenService refreshTokenService,
                           TenantService tenantService,
                           JwtTokenProvider tokenProvider,
                           AuthorityMapper authorityMapper,
                           UserMapper userMapper,
                           JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.refreshTokenService = refreshTokenService;
        this.tenantService = tenantService;
        this.tokenProvider = tokenProvider;
        this.authorityMapper = authorityMapper;
        this.userMapper = userMapper;
        this.jwtProperties = jwtProperties;
    }

    @Override
    public OtpChallengeResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }
        User user = new User();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEmailVerified(false);
        user = userRepository.save(user);

        tenantService.createPersonalTenant(user);

        OtpCode challenge = otpService.createChallenge(user.getId(), email, OtpPurpose.SIGNUP_VERIFY);
        return toChallengeResponse(challenge);
    }

    @Override
    public OtpChallengeResponse signin(SigninRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);

        if (user.getAuthProvider() != AuthProvider.LOCAL || user.getPassword() == null) {
            throw new InvalidCredentialsException("This account uses Google sign-in");
        }
        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("This account is disabled");
        }
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        OtpCode challenge = otpService.createChallenge(user.getId(), email, OtpPurpose.SIGNIN);
        return toChallengeResponse(challenge);
    }

    @Override
    public AuthTokensResponse verifyOtp(VerifyOtpRequest request, String userAgent, String ip) {
        OtpCode otp = otpService.verify(request.challengeId(), request.code());
        User user = resolveOtpUser(otp);

        if (otp.getPurpose() == OtpPurpose.SIGNUP_VERIFY && !user.isEmailVerified()) {
            user.setEmailVerified(true);
            user = userRepository.save(user);
        }

        TenantMembership membership = tenantService.resolveDefaultMembership(user.getId()).orElse(null);
        return buildSession(user, membership, userAgent, ip);
    }

    @Override
    public OtpChallengeResponse resendOtp(UUID challengeId) {
        return toChallengeResponse(otpService.resend(challengeId));
    }

    @Override
    public AuthTokensResponse refresh(String refreshToken, String userAgent, String ip) {
        RefreshTokenService.IssuedRefreshToken rotated = refreshTokenService.rotate(refreshToken, userAgent, ip);
        User user = userRepository.findById(rotated.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TenantMembership membership = rotated.tenantId() != null
                ? tenantService.resolveActiveMembership(user.getId(), rotated.tenantId()).orElse(null)
                : tenantService.resolveDefaultMembership(user.getId()).orElse(null);
        return buildSession(user, membership, rotated.rawToken());
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    @Override
    public AuthTokensResponse switchTenant(UUID userId, UUID tenantId, String userAgent, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TenantMembership membership = tenantService.resolveActiveMembership(userId, tenantId)
                .orElseThrow(() -> new TenantAccessDeniedException("You are not an active member of this tenant"));
        return buildSession(user, membership, userAgent, ip);
    }

    @Override
    public AuthTokensResponse issueOAuthSession(User user, String userAgent, String ip) {
        TenantMembership membership = tenantService.resolveDefaultMembership(user.getId()).orElse(null);
        return buildSession(user, membership, userAgent, ip);
    }

    @Override
    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(AuthenticatedUser principal) {
        User user = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();
        if (principal.tenantId() != null) {
            tenantService.resolveActiveMembership(user.getId(), principal.tenantId()).ifPresent(m -> {
                roles.add(authorityMapper.roleAuthorityName(m.getRole()));
                permissions.addAll(authorityMapper.permissionNames(m.getRole()));
            });
        }
        return new CurrentUserResponse(
                userMapper.toResponse(user),
                principal.tenantId(),
                roles,
                permissions,
                tenantService.getTenantsForUser(user.getId()));
    }

    // --- helpers ---

    /** Issue a brand-new refresh token alongside the access token. */
    private AuthTokensResponse buildSession(User user, TenantMembership membership, String userAgent, String ip) {
        UUID tenantId = membership != null ? membership.getTenant().getId() : null;
        String refreshToken = refreshTokenService.issue(user.getId(), tenantId, userAgent, ip);
        return assemble(user, membership, refreshToken);
    }

    /** Reuse an already-rotated refresh token (refresh flow) with a fresh access token. */
    private AuthTokensResponse buildSession(User user, TenantMembership membership, String rotatedRefreshToken) {
        return assemble(user, membership, rotatedRefreshToken);
    }

    private AuthTokensResponse assemble(User user, TenantMembership membership, String refreshToken) {
        UUID tenantId = membership != null ? membership.getTenant().getId() : null;
        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();
        if (membership != null) {
            roles.add(authorityMapper.roleAuthorityName(membership.getRole()));
            permissions.addAll(authorityMapper.permissionNames(membership.getRole()));
        }
        String accessToken = tokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), tenantId, roles, permissions);

        UserResponse userResponse = userMapper.toResponse(user);
        List<TenantResponse> tenants = tenantService.getTenantsForUser(user.getId());
        return AuthTokensResponse.bearer(accessToken, refreshToken,
                jwtProperties.accessTokenTtl().toSeconds(), tenantId, userResponse, tenants);
    }

    private User resolveOtpUser(OtpCode otp) {
        Optional<User> byId = otp.getUserId() != null
                ? userRepository.findById(otp.getUserId())
                : Optional.empty();
        return byId.or(() -> userRepository.findByEmail(otp.getEmail()))
                .orElseThrow(() -> new InvalidOtpException("No account for this challenge"));
    }

    private OtpChallengeResponse toChallengeResponse(OtpCode otp) {
        long ttlSeconds = java.time.Duration.between(java.time.Instant.now(), otp.getExpiresAt()).getSeconds();
        return new OtpChallengeResponse(
                otp.getChallengeId(),
                maskEmail(otp.getEmail()),
                otp.getPurpose(),
                Math.max(ttlSeconds, 0));
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 2) {
            return email;
        }
        return email.substring(0, 2) + "***" + email.substring(at);
    }
}
