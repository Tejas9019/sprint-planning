package com.example.sprint_planning.tenant.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.rbac.RoleName;
import com.example.sprint_planning.rbac.model.Role;
import com.example.sprint_planning.rbac.repository.RoleRepository;
import com.example.sprint_planning.tenant.MembershipStatus;
import com.example.sprint_planning.tenant.dto.CreateTenantRequest;
import com.example.sprint_planning.tenant.dto.TenantResponse;
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
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final TenantMembershipRepository membershipRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;

    public TenantServiceImpl(TenantRepository tenantRepository,
                             TenantMembershipRepository membershipRepository,
                             RoleRepository roleRepository,
                             UserRepository userRepository,
                             TenantMapper tenantMapper) {
        this.tenantRepository = tenantRepository;
        this.membershipRepository = membershipRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.tenantMapper = tenantMapper;
    }

    @Override
    public TenantMembership createTenantWithOwner(User owner, String name) {
        Tenant tenant = new Tenant();
        tenant.setName(name);
        tenant.setSlug(uniqueSlug(name));
        tenant.setOwnerUserId(owner.getId());
        tenant = tenantRepository.save(tenant);

        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("ADMIN role not seeded"));

        TenantMembership membership = new TenantMembership();
        membership.setTenant(tenant);
        membership.setUser(owner);
        membership.setRole(adminRole);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setInvitedEmail(owner.getEmail());
        membership.setInvitedAt(Instant.now());
        membership.setJoinedAt(Instant.now());
        return membershipRepository.save(membership);
    }

    @Override
    public TenantMembership createPersonalTenant(User owner) {
        return createTenantWithOwner(owner, owner.getFirstName() + "'s Workspace");
    }

    @Override
    public TenantResponse createTenant(UUID ownerUserId, CreateTenantRequest request) {
        User owner = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + ownerUserId));
        return tenantMapper.toTenantResponse(createTenantWithOwner(owner, request.name().trim()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getTenantsForUser(UUID userId) {
        return membershipRepository.findByUserId(userId).stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE || m.getStatus() == MembershipStatus.INVITED)
                .map(tenantMapper::toTenantResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TenantMembership> resolveDefaultMembership(UUID userId) {
        return membershipRepository.findByUserIdAndStatus(userId, MembershipStatus.ACTIVE).stream().findFirst();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TenantMembership> resolveActiveMembership(UUID userId, UUID tenantId) {
        return membershipRepository.findByTenantIdAndUserId(tenantId, userId)
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE);
    }

    private String uniqueSlug(String name) {
        String base = name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (base.isBlank()) {
            base = "workspace";
        }
        String slug = base;
        while (tenantRepository.existsBySlug(slug)) {
            slug = base + "-" + UUID.randomUUID().toString().substring(0, 6);
        }
        return slug;
    }
}
