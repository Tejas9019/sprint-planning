package com.example.sprint_planning.tenant.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.common.exception.TenantAccessDeniedException;
import com.example.sprint_planning.rbac.model.Role;
import com.example.sprint_planning.rbac.repository.RoleRepository;
import com.example.sprint_planning.tenant.MembershipStatus;
import com.example.sprint_planning.tenant.dto.InviteMemberRequest;
import com.example.sprint_planning.tenant.dto.InviteResponse;
import com.example.sprint_planning.tenant.dto.MembershipResponse;
import com.example.sprint_planning.tenant.dto.UpdateMemberRoleRequest;
import com.example.sprint_planning.tenant.mapper.TenantMapper;
import com.example.sprint_planning.tenant.model.Tenant;
import com.example.sprint_planning.tenant.model.TenantMembership;
import com.example.sprint_planning.tenant.repository.TenantMembershipRepository;
import com.example.sprint_planning.tenant.repository.TenantRepository;
import com.example.sprint_planning.user.model.User;
import com.example.sprint_planning.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TenantMembershipServiceImpl implements TenantMembershipService {

    private final TenantMembershipRepository membershipRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;

    public TenantMembershipServiceImpl(TenantMembershipRepository membershipRepository,
                                       TenantRepository tenantRepository,
                                       RoleRepository roleRepository,
                                       UserRepository userRepository,
                                       TenantMapper tenantMapper) {
        this.membershipRepository = membershipRepository;
        this.tenantRepository = tenantRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.tenantMapper = tenantMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipResponse> listMembers(UUID tenantId) {
        return membershipRepository.findByTenantId(tenantId).stream()
                .map(tenantMapper::toMembershipResponse)
                .toList();
    }

    @Override
    public MembershipResponse invite(UUID tenantId, InviteMemberRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));
        Role role = requireRole(request.role());
        String email = request.email().trim().toLowerCase();

        TenantMembership membership = new TenantMembership();
        membership.setTenant(tenant);
        membership.setRole(role);
        membership.setStatus(MembershipStatus.INVITED);
        membership.setDepartment(request.department());
        membership.setInvitedEmail(email);
        membership.setInviteToken(UUID.randomUUID().toString().replace("-", ""));
        membership.setInvitedAt(Instant.now());
        // If the invitee already has an account, link it immediately (still INVITED until accepted).
        userRepository.findByEmail(email).ifPresent(membership::setUser);
        return tenantMapper.toMembershipResponse(membershipRepository.save(membership));
    }

    @Override
    public MembershipResponse updateRole(UUID tenantId, UUID membershipId, UpdateMemberRoleRequest request) {
        TenantMembership membership = requireMembershipInTenant(tenantId, membershipId);
        membership.setRole(requireRole(request.role()));
        return tenantMapper.toMembershipResponse(membershipRepository.save(membership));
    }

    @Override
    public void revoke(UUID tenantId, UUID membershipId) {
        TenantMembership membership = requireMembershipInTenant(tenantId, membershipId);
        membership.setStatus(MembershipStatus.REVOKED);
        membershipRepository.save(membership);
    }

    @Override
    public MembershipResponse acceptInvite(String inviteToken, UUID userId) {
        TenantMembership membership = membershipRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
        if (membership.getStatus() == MembershipStatus.REVOKED) {
            throw new TenantAccessDeniedException("This invite is no longer valid");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        membership.setUser(user);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setJoinedAt(Instant.now());
        return tenantMapper.toMembershipResponse(membershipRepository.save(membership));
    }

    private TenantMembership requireMembershipInTenant(UUID tenantId, UUID membershipId) {
        TenantMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found: " + membershipId));
        if (!membership.getTenant().getId().equals(tenantId)) {
            throw new TenantAccessDeniedException("Membership does not belong to this tenant");
        }
        return membership;
    }

    private Role requireRole(String roleName) {
        return roleRepository.findByName(roleName.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Unknown role: " + roleName));
    }

    @Override
    @Transactional(readOnly = true)
    public InviteResponse getInviteByToken(String token) {
        TenantMembership membership = membershipRepository.findByInviteToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
        return tenantMapper.toInviteResponse(membership);
    }
}
