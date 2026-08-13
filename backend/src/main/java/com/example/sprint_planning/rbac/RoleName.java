package com.example.sprint_planning.rbac;

/**
 * Canonical role names. Stored in the {@code roles.name} column and surfaced as
 * {@code ROLE_<NAME>} Spring Security authorities.
 */
public enum RoleName {
    ADMIN,
    MANAGER,
    MEMBER,
    VIEWER
}
