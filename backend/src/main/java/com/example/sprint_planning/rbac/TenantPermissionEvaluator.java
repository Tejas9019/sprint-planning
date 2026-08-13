package com.example.sprint_planning.rbac;

import com.example.sprint_planning.security.AuthenticatedUser;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.UUID;

/**
 * Backs {@code @PreAuthorize("hasPermission(#tenantId, 'Tenant', 'MEMBER_INVITE')")}.
 * Asserts BOTH that the principal holds the named permission AND that the targeted
 * tenant matches the principal's active (token) tenant — blocking a user from using a
 * permission held in tenant A against tenant B.
 */
@Component
public class TenantPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        // Object-based checks are not used; prefer the id-based overload.
        return false;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId,
                                 String targetType, Object permission) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return false;
        }
        if (!"Tenant".equals(targetType) || permission == null) {
            return false;
        }
        if (!hasAuthority(authentication, permission.toString())) {
            return false;
        }
        return targetId == null || sameTenant(targetId, user.tenantId());
    }

    private boolean hasAuthority(Authentication authentication, String permission) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (authority.getAuthority().equals(permission)) {
                return true;
            }
        }
        return false;
    }

    private boolean sameTenant(Serializable targetId, UUID activeTenant) {
        if (activeTenant == null) {
            return false;
        }
        try {
            UUID target = targetId instanceof UUID uuid ? uuid : UUID.fromString(targetId.toString());
            return target.equals(activeTenant);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
