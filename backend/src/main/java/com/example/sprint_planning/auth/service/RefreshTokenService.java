package com.example.sprint_planning.auth.service;

import java.util.UUID;

public interface RefreshTokenService {

    /** The raw (client-facing) refresh token plus the context needed to re-mint an access token. */
    record IssuedRefreshToken(String rawToken, UUID userId, UUID tenantId) {
    }

    /** Issue a brand-new refresh token for a user/tenant. */
    String issue(UUID userId, UUID tenantId, String userAgent, String ip);

    /** Validate + rotate a refresh token (single-use). Detects reuse and revokes the chain. */
    IssuedRefreshToken rotate(String rawToken, String userAgent, String ip);

    /** Revoke a single refresh token (e.g. on logout). No-op if unknown. */
    void revoke(String rawToken);

    /** Revoke every active refresh token for a user. */
    void revokeAllForUser(UUID userId);
}
