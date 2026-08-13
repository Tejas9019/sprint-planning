package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.model.RefreshToken;
import com.example.sprint_planning.auth.repository.RefreshTokenRepository;
import com.example.sprint_planning.common.exception.InvalidTokenException;
import com.example.sprint_planning.common.util.HashUtil;
import com.example.sprint_planning.config.JwtProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final int TOKEN_BYTES = 48;

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;
    private final SecureRandom random = new SecureRandom();
    private final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    @Override
    public String issue(UUID userId, UUID tenantId, String userAgent, String ip) {
        String raw = generateRawToken();
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTenantId(tenantId);
        token.setTokenHash(HashUtil.sha256Hex(raw));
        token.setExpiresAt(Instant.now().plus(jwtProperties.refreshTokenTtl()));
        token.setUserAgent(truncate(userAgent, 255));
        token.setIp(truncate(ip, 45));
        refreshTokenRepository.save(token);
        return raw;
    }

    @Override
    public IssuedRefreshToken rotate(String rawToken, String userAgent, String ip) {
        RefreshToken current = refreshTokenRepository.findByTokenHash(HashUtil.sha256Hex(rawToken))
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (current.isRevoked()) {
            // A revoked-but-rotated token being presented again => theft. Burn the whole chain.
            if (current.getReplacedById() != null) {
                refreshTokenRepository.revokeAllForUser(current.getUserId());
            }
            throw new InvalidTokenException("Refresh token is no longer valid");
        }
        if (current.isExpired()) {
            throw new InvalidTokenException("Refresh token has expired");
        }

        String newRaw = generateRawToken();
        RefreshToken next = new RefreshToken();
        next.setUserId(current.getUserId());
        next.setTenantId(current.getTenantId());
        next.setTokenHash(HashUtil.sha256Hex(newRaw));
        next.setExpiresAt(Instant.now().plus(jwtProperties.refreshTokenTtl()));
        next.setUserAgent(truncate(userAgent, 255));
        next.setIp(truncate(ip, 45));
        next = refreshTokenRepository.save(next);

        current.setRevoked(true);
        current.setReplacedById(next.getId());
        refreshTokenRepository.save(current);

        return new IssuedRefreshToken(newRaw, next.getUserId(), next.getTenantId());
    }

    @Override
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(HashUtil.sha256Hex(rawToken)).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    public void revokeAllForUser(UUID userId) {
        refreshTokenRepository.revokeAllForUser(userId);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return encoder.encodeToString(bytes);
    }

    private String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
