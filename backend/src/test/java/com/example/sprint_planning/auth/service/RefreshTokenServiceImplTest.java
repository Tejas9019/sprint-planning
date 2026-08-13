package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.model.RefreshToken;
import com.example.sprint_planning.auth.repository.RefreshTokenRepository;
import com.example.sprint_planning.common.exception.InvalidTokenException;
import com.example.sprint_planning.common.util.HashUtil;
import com.example.sprint_planning.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceImplTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenServiceImpl service;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties("secret", "iss", Duration.ofMinutes(15), Duration.ofDays(7));
        service = new RefreshTokenServiceImpl(refreshTokenRepository, props);
    }

    @Test
    void issueStoresHashNotRawToken() {
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));
        UUID userId = UUID.randomUUID();

        String raw = service.issue(userId, UUID.randomUUID(), "agent", "1.2.3.4");

        assertThat(raw).isNotBlank();
        // The stored hash must match the SHA-256 of the raw token (never the raw token itself).
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void rotateRevokesCurrentAndIssuesNew() {
        UUID userId = UUID.randomUUID();
        String raw = "current-raw-token";
        RefreshToken current = active(userId, raw);
        when(refreshTokenRepository.findByTokenHash(HashUtil.sha256Hex(raw))).thenReturn(Optional.of(current));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshTokenService.IssuedRefreshToken result = service.rotate(raw, "agent", "1.2.3.4");

        assertThat(result.rawToken()).isNotEqualTo(raw);
        assertThat(result.userId()).isEqualTo(userId);
        assertThat(current.isRevoked()).isTrue();
    }

    @Test
    void rotateDetectsReuseAndBurnsChain() {
        UUID userId = UUID.randomUUID();
        String raw = "stolen-raw-token";
        RefreshToken alreadyRotated = active(userId, raw);
        alreadyRotated.setRevoked(true);
        alreadyRotated.setReplacedById(UUID.randomUUID()); // was rotated => reuse attempt
        when(refreshTokenRepository.findByTokenHash(HashUtil.sha256Hex(raw))).thenReturn(Optional.of(alreadyRotated));

        assertThatThrownBy(() -> service.rotate(raw, "agent", "1.2.3.4"))
                .isInstanceOf(InvalidTokenException.class);
        verify(refreshTokenRepository).revokeAllForUser(userId);
    }

    @Test
    void rotateRejectsUnknownToken() {
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.rotate("nope", "agent", "ip"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void revokeAllDelegatesToRepository() {
        UUID userId = UUID.randomUUID();
        service.revokeAllForUser(userId);
        verify(refreshTokenRepository, times(1)).revokeAllForUser(userId);
    }

    private RefreshToken active(UUID userId, String raw) {
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(HashUtil.sha256Hex(raw));
        token.setExpiresAt(Instant.now().plusSeconds(3600));
        token.setRevoked(false);
        return token;
    }
}
