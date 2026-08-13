package com.example.sprint_planning.rbac;

/**
 * Fine-grained permissions, named {@code DOMAIN_ACTION}. Each value maps 1:1 to a
 * {@code permissions.name} row and is used as a bare Spring Security authority in
 * {@code @PreAuthorize("hasAuthority('TASK_CREATE')")} checks.
 */
public enum PermissionName {
    TASK_CREATE,
    TASK_READ,
    TASK_UPDATE,
    TASK_DELETE,
    BOARD_READ,
    MEMBER_INVITE,
    MEMBER_READ,
    MEMBER_UPDATE_ROLE,
    MEMBER_REMOVE,
    TENANT_MANAGE,
    USER_READ,
    USER_MANAGE
}
