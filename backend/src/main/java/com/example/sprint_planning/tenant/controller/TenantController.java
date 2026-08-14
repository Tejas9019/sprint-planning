package com.example.sprint_planning.tenant.controller;

import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.security.SecurityUtils;
import com.example.sprint_planning.tenant.dto.CreateTenantRequest;
import com.example.sprint_planning.tenant.dto.MembershipResponse;
import com.example.sprint_planning.tenant.dto.TenantResponse;
import com.example.sprint_planning.tenant.service.TenantMembershipService;
import com.example.sprint_planning.tenant.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.TENANTS)
public class TenantController {

    private final TenantService tenantService;
    private final TenantMembershipService tenantMembershipService;

    public TenantController(TenantService tenantService, TenantMembershipService tenantMembershipService) {
        this.tenantService = tenantService;
        this.tenantMembershipService = tenantMembershipService;
    }

    /** Tenants the authenticated user belongs to. */
    @GetMapping
    public List<TenantResponse> myTenants() {
        return tenantService.getTenantsForUser(SecurityUtils.currentUserId());
    }

    /** Create a new tenant owned by the authenticated user. */
    @PostMapping
    public ResponseEntity<TenantResponse> create(@Valid @RequestBody CreateTenantRequest request) {
        TenantResponse created = tenantService.createTenant(SecurityUtils.currentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<MembershipResponse> acceptInvite(@RequestParam String token) {
        MembershipResponse response = tenantMembershipService.acceptInvite(token, SecurityUtils.currentUserId());
        return ResponseEntity.ok(response);
    }
}
