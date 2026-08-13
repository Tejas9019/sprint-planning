package com.example.sprint_planning.tenant.repository;

import com.example.sprint_planning.tenant.MembershipStatus;
import com.example.sprint_planning.tenant.model.TenantMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantMembershipRepository extends JpaRepository<TenantMembership, UUID> {

    List<TenantMembership> findByUserId(UUID userId);

    List<TenantMembership> findByUserIdAndStatus(UUID userId, MembershipStatus status);

    List<TenantMembership> findByTenantId(UUID tenantId);

    Optional<TenantMembership> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    Optional<TenantMembership> findByInviteToken(String inviteToken);

    boolean existsByTenantIdAndUserIdAndStatus(UUID tenantId, UUID userId, MembershipStatus status);
}
