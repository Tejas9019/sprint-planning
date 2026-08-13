package com.example.sprint_planning.security;

import java.util.UUID;

/**
 * The principal stored in the SecurityContext for an authenticated request.
 * Built from the access-token claims — no database lookup on the hot path.
 *
 * @param id       the user id ({@code sub})
 * @param email    the user's email
 * @param tenantId the active tenant for this request (may be null if the user has no tenant)
 */
public record AuthenticatedUser(UUID id, String email, UUID tenantId) {
}
