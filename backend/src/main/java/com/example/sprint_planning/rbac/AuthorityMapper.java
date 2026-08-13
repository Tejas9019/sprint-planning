package com.example.sprint_planning.rbac;

import com.example.sprint_planning.rbac.model.Permission;
import com.example.sprint_planning.rbac.model.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Maps roles/permissions to Spring Security authorities and back.
 * <ul>
 *   <li>Role {@code ADMIN} -> authority {@code ROLE_ADMIN} (so {@code hasRole('ADMIN')} works)</li>
 *   <li>Permission {@code TASK_CREATE} -> authority {@code TASK_CREATE} (so {@code hasAuthority('TASK_CREATE')} works)</li>
 * </ul>
 */
@Component
public class AuthorityMapper {

    public static final String ROLE_PREFIX = "ROLE_";

    /** The role name as it appears in JWT {@code roles} claim, e.g. {@code ROLE_ADMIN}. */
    public String roleAuthorityName(Role role) {
        return ROLE_PREFIX + role.getName();
    }

    /** Permission names for the given role, e.g. {@code [TASK_CREATE, TASK_READ]}. */
    public List<String> permissionNames(Role role) {
        return role.getPermissions().stream().map(Permission::getName).sorted().toList();
    }

    /** Build authorities from the role + permission name claims carried by an access token. */
    public Collection<GrantedAuthority> toAuthorities(Collection<String> roleNames,
                                                      Collection<String> permissionNames) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();
        if (roleNames != null) {
            roleNames.forEach(r -> authorities.add(new SimpleGrantedAuthority(r)));
        }
        if (permissionNames != null) {
            permissionNames.forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));
        }
        return authorities;
    }
}
