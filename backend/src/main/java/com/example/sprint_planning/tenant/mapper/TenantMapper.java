package com.example.sprint_planning.tenant.mapper;

import com.example.sprint_planning.tenant.dto.MembershipResponse;
import com.example.sprint_planning.tenant.dto.TenantResponse;
import com.example.sprint_planning.tenant.model.TenantMembership;
import com.example.sprint_planning.user.model.User;
import org.springframework.stereotype.Component;

/** Maps tenant/membership entities to DTOs. */
@Component
public class TenantMapper {

    /** A membership rendered as the tenant the user belongs to (with their role). */
    public TenantResponse toTenantResponse(TenantMembership membership) {
        return new TenantResponse(
                membership.getTenant().getId(),
                membership.getTenant().getName(),
                membership.getTenant().getSlug(),
                membership.getRole().getName(),
                membership.getStatus().name());
    }

    /** A membership rendered as a member row within a tenant. */
    public MembershipResponse toMembershipResponse(TenantMembership membership) {
        User user = membership.getUser();
        String name = user != null ? user.getFullName() : membership.getInvitedEmail();
        return new MembershipResponse(
                membership.getId(),
                user != null ? user.getId() : null,
                name,
                membership.getInvitedEmail(),
                membership.getRole().getName(),
                membership.getDepartment(),
                membership.getStatus(),
                membership.getInvitedAt());
    }
}
