package com.example.sprint_planning.tenant.service;

import com.example.sprint_planning.tenant.dto.InviteMemberRequest;
import com.example.sprint_planning.tenant.dto.InviteResponse;
import com.example.sprint_planning.tenant.dto.MembershipResponse;
import com.example.sprint_planning.tenant.dto.UpdateMemberRoleRequest;

import java.util.List;
import java.util.UUID;

public interface TenantMembershipService {

    List<MembershipResponse> listMembers(UUID tenantId);

    MembershipResponse invite(UUID tenantId, InviteMemberRequest request);

    MembershipResponse updateRole(UUID tenantId, UUID membershipId, UpdateMemberRoleRequest request);

    void revoke(UUID tenantId, UUID membershipId);

    /** Links the invited membership to the accepting user and activates it. */
    MembershipResponse acceptInvite(String inviteToken, UUID userId);

    InviteResponse getInviteByToken(String token);
}
