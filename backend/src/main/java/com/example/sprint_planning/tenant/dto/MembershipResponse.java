package com.example.sprint_planning.tenant.dto;

import com.example.sprint_planning.tenant.MembershipStatus;

import java.time.Instant;
import java.util.UUID;

/** A member of a tenant. Mirrors the frontend contactsStore Member shape. */
public record MembershipResponse(
        UUID id,
        UUID userId,
        String name,
        String email,
        String role,
        String department,
        MembershipStatus status,
        Instant invitedAt) {
}
