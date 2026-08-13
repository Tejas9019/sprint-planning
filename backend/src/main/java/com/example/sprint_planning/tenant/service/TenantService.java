package com.example.sprint_planning.tenant.service;

import com.example.sprint_planning.tenant.dto.CreateTenantRequest;
import com.example.sprint_planning.tenant.dto.TenantResponse;
import com.example.sprint_planning.tenant.model.TenantMembership;
import com.example.sprint_planning.user.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantService {

    /** Creates a workspace owned by {@code owner} and an ACTIVE ADMIN membership for them. */
    TenantMembership createTenantWithOwner(User owner, String name);

    /** Creates a default personal workspace for a brand-new user. */
    TenantMembership createPersonalTenant(User owner);

    TenantResponse createTenant(UUID ownerUserId, CreateTenantRequest request);

    List<TenantResponse> getTenantsForUser(UUID userId);

    /** The membership used to scope a freshly issued token (default = first ACTIVE membership). */
    Optional<TenantMembership> resolveDefaultMembership(UUID userId);

    /** The ACTIVE membership for a specific tenant, if the user is a member. */
    Optional<TenantMembership> resolveActiveMembership(UUID userId, UUID tenantId);
}
