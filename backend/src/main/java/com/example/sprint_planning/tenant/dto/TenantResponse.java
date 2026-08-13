package com.example.sprint_planning.tenant.dto;

import java.util.UUID;

/** A tenant the current user belongs to, with their role in it. */
public record TenantResponse(
        UUID id,
        String name,
        String slug,
        String role,
        String status) {
}
