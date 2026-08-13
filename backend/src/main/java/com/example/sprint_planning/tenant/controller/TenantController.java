package com.example.sprint_planning.tenant.controller;

import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.security.SecurityUtils;
import com.example.sprint_planning.tenant.dto.CreateTenantRequest;
import com.example.sprint_planning.tenant.dto.TenantResponse;
import com.example.sprint_planning.tenant.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.TENANTS)
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
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
}
