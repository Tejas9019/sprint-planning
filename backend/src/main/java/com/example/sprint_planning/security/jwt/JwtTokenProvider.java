package com.example.sprint_planning.security.jwt;

import com.example.sprint_planning.common.exception.InvalidTokenException;
import com.example.sprint_planning.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/** Mints and validates our own HS256 access tokens (jjwt). */
@Component
public class JwtTokenProvider {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtTokenProvider(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(properties.secret()));
    }

    /** Build a short-lived access token carrying tenant-scoped roles + permissions. */
    public String generateAccessToken(UUID userId,
                                      String email,
                                      UUID tenantId,
                                      Collection<String> roles,
                                      Collection<String> permissions) {
        Instant now = Instant.now();
        Instant expiry = now.plus(properties.accessTokenTtl());
        return Jwts.builder()
                .issuer(properties.issuer())
                .subject(userId.toString())
                .claim(JwtClaims.EMAIL, email)
                .claim(JwtClaims.ROLES, roles)
                .claim(JwtClaims.PERMISSIONS, permissions)
                .claim(JwtClaims.TENANT_ID, tenantId != null ? tenantId.toString() : null)
                .claim(JwtClaims.TYPE, JwtClaims.TYPE_ACCESS)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    public long accessTokenTtlSeconds() {
        return properties.accessTokenTtl().toSeconds();
    }

    /** Parse + verify an access token. Throws {@link InvalidTokenException} when invalid/expired/wrong type. */
    public Claims parseAccessToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(properties.issuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            if (!JwtClaims.TYPE_ACCESS.equals(claims.get(JwtClaims.TYPE, String.class))) {
                throw new InvalidTokenException("Not an access token");
            }
            return claims;
        } catch (JwtException | IllegalArgumentException ex) {
            throw new InvalidTokenException("Invalid or expired access token");
        }
    }

    public UUID getUserId(Claims claims) {
        return UUID.fromString(claims.getSubject());
    }

    public String getEmail(Claims claims) {
        return claims.get(JwtClaims.EMAIL, String.class);
    }

    public UUID getTenantId(Claims claims) {
        String tenantId = claims.get(JwtClaims.TENANT_ID, String.class);
        return tenantId != null ? UUID.fromString(tenantId) : null;
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(Claims claims) {
        Object roles = claims.get(JwtClaims.ROLES);
        return roles instanceof List<?> list ? (List<String>) list : List.of();
    }

    @SuppressWarnings("unchecked")
    public List<String> getPermissions(Claims claims) {
        Object permissions = claims.get(JwtClaims.PERMISSIONS);
        return permissions instanceof List<?> list ? (List<String>) list : List.of();
    }
}
