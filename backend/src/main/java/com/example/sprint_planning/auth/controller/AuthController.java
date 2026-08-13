package com.example.sprint_planning.auth.controller;

import com.example.sprint_planning.auth.dto.AuthTokensResponse;
import com.example.sprint_planning.auth.dto.CurrentUserResponse;
import com.example.sprint_planning.auth.dto.LogoutRequest;
import com.example.sprint_planning.auth.dto.OtpChallengeResponse;
import com.example.sprint_planning.auth.dto.RefreshRequest;
import com.example.sprint_planning.auth.dto.ResendOtpRequest;
import com.example.sprint_planning.auth.dto.SigninRequest;
import com.example.sprint_planning.auth.dto.SignupRequest;
import com.example.sprint_planning.auth.dto.SwitchTenantRequest;
import com.example.sprint_planning.auth.dto.VerifyOtpRequest;
import com.example.sprint_planning.auth.service.AuthService;
import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.AUTH)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public OtpChallengeResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/signin")
    public OtpChallengeResponse signin(@Valid @RequestBody SigninRequest request) {
        return authService.signin(request);
    }

    @PostMapping("/verify-otp")
    public AuthTokensResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request, HttpServletRequest http) {
        return authService.verifyOtp(request, userAgent(http), clientIp(http));
    }

    @PostMapping("/resend-otp")
    public OtpChallengeResponse resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        return authService.resendOtp(request.challengeId());
    }

    @PostMapping("/refresh")
    public AuthTokensResponse refresh(@Valid @RequestBody RefreshRequest request, HttpServletRequest http) {
        return authService.refresh(request.refreshToken(), userAgent(http), clientIp(http));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/switch-tenant")
    public AuthTokensResponse switchTenant(@Valid @RequestBody SwitchTenantRequest request, HttpServletRequest http) {
        return authService.switchTenant(SecurityUtils.currentUserId(), request.tenantId(),
                userAgent(http), clientIp(http));
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        return authService.getCurrentUser(SecurityUtils.requireCurrentUser());
    }

    private String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
