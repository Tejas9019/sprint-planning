package com.example.sprint_planning.tenant.dto;

import java.time.Instant;
import java.util.UUID;

public record InviteResponse(
        UUID id,
        String tenantName,
        String email,
        String role,
        String department,
        String status,
        String inviteToken,
        Instant invitedAt
) {
}
