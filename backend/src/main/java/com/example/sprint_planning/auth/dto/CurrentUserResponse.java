package com.example.sprint_planning.auth.dto;

import com.example.sprint_planning.tenant.dto.TenantResponse;
import com.example.sprint_planning.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

/** Snapshot of the authenticated principal for {@code GET /auth/me}. */
public record CurrentUserResponse(
        UserResponse user,
        UUID activeTenantId,
        List<String> roles,
        List<String> permissions,
        List<TenantResponse> tenants) {
}
