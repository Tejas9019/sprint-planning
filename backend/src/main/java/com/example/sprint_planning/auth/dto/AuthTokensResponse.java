package com.example.sprint_planning.auth.dto;

import com.example.sprint_planning.tenant.dto.TenantResponse;
import com.example.sprint_planning.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

/** The full authenticated session payload returned after OTP verification / refresh / OAuth. */
public record AuthTokensResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UUID activeTenantId,
        UserResponse user,
        List<TenantResponse> tenants) {

    public static AuthTokensResponse bearer(String accessToken,
                                            String refreshToken,
                                            long expiresIn,
                                            UUID activeTenantId,
                                            UserResponse user,
                                            List<TenantResponse> tenants) {
        return new AuthTokensResponse(accessToken, refreshToken, "Bearer", expiresIn, activeTenantId, user, tenants);
    }
}
