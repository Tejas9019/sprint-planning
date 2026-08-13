package com.example.sprint_planning.security.jwt;

import com.example.sprint_planning.common.exception.InvalidTokenException;
import com.example.sprint_planning.config.JwtProperties;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private static final String SECRET = "dGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtMzJieXRlcw==";

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider(
                new JwtProperties(SECRET, "sprint-planning-test", Duration.ofMinutes(15), Duration.ofDays(7)));
    }

    @Test
    void generatesAndParsesAccessTokenRoundTrip() {
        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();

        String token = provider.generateAccessToken(
                userId, "jane@example.com", tenantId,
                List.of("ROLE_ADMIN"), List.of("TASK_CREATE", "TASK_READ"));

        Claims claims = provider.parseAccessToken(token);
        assertThat(provider.getUserId(claims)).isEqualTo(userId);
        assertThat(provider.getEmail(claims)).isEqualTo("jane@example.com");
        assertThat(provider.getTenantId(claims)).isEqualTo(tenantId);
        assertThat(provider.getRoles(claims)).containsExactly("ROLE_ADMIN");
        assertThat(provider.getPermissions(claims)).containsExactlyInAnyOrder("TASK_CREATE", "TASK_READ");
    }

    @Test
    void handlesNullTenant() {
        String token = provider.generateAccessToken(
                UUID.randomUUID(), "jane@example.com", null, List.of(), List.of());
        assertThat(provider.getTenantId(provider.parseAccessToken(token))).isNull();
    }

    @Test
    void rejectsTamperedToken() {
        String token = provider.generateAccessToken(
                UUID.randomUUID(), "jane@example.com", null, List.of(), List.of());
        String tampered = token.substring(0, token.length() - 2) + "xx";
        assertThatThrownBy(() -> provider.parseAccessToken(tampered))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void rejectsGarbageToken() {
        assertThatThrownBy(() -> provider.parseAccessToken("not-a-jwt"))
                .isInstanceOf(InvalidTokenException.class);
    }
}
