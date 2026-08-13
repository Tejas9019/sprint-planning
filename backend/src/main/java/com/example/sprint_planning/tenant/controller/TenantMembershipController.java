package com.example.sprint_planning.tenant.controller;

import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.tenant.dto.InviteMemberRequest;
import com.example.sprint_planning.tenant.dto.MembershipResponse;
import com.example.sprint_planning.tenant.dto.UpdateMemberRoleRequest;
import com.example.sprint_planning.tenant.service.TenantMembershipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Members of a tenant. Every method is guarded by a tenant-scoped permission check:
 * the caller must hold the permission AND their active tenant must equal {@code tenantId}.
 */
@RestController
@RequestMapping(ApiPaths.TENANTS + "/{tenantId}/members")
public class TenantMembershipController {

    private final TenantMembershipService membershipService;

    public TenantMembershipController(TenantMembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping
    @PreAuthorize("hasPermission(#tenantId, 'Tenant', 'MEMBER_READ')")
    public List<MembershipResponse> list(@PathVariable UUID tenantId) {
        return membershipService.listMembers(tenantId);
    }

    @PostMapping
    @PreAuthorize("hasPermission(#tenantId, 'Tenant', 'MEMBER_INVITE')")
    public ResponseEntity<MembershipResponse> invite(@PathVariable UUID tenantId,
                                                     @Valid @RequestBody InviteMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membershipService.invite(tenantId, request));
    }

    @PutMapping("/{membershipId}/role")
    @PreAuthorize("hasPermission(#tenantId, 'Tenant', 'MEMBER_UPDATE_ROLE')")
    public MembershipResponse updateRole(@PathVariable UUID tenantId,
                                         @PathVariable UUID membershipId,
                                         @Valid @RequestBody UpdateMemberRoleRequest request) {
        return membershipService.updateRole(tenantId, membershipId, request);
    }

    @DeleteMapping("/{membershipId}")
    @PreAuthorize("hasPermission(#tenantId, 'Tenant', 'MEMBER_REMOVE')")
    public ResponseEntity<Void> revoke(@PathVariable UUID tenantId, @PathVariable UUID membershipId) {
        membershipService.revoke(tenantId, membershipId);
        return ResponseEntity.noContent().build();
    }
}
