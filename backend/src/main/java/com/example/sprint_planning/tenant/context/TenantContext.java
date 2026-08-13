package com.example.sprint_planning.tenant.context;

import com.example.sprint_planning.common.exception.TenantAccessDeniedException;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Holds the active tenant for the current request. Populated by
 * {@link TenantResolutionFilter} from the access-token's {@code tenantId} claim, so
 * it is the single source of truth tenant-scoped services filter their queries by.
 */
@Component
@RequestScope
public class TenantContext {

    private UUID tenantId;

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    public boolean hasTenant() {
        return tenantId != null;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    /** Returns the active tenant id or throws 403 if the request has no tenant scope. */
    public UUID requireTenantId() {
        if (tenantId == null) {
            throw new TenantAccessDeniedException("No active tenant for this request");
        }
        return tenantId;
    }
}
