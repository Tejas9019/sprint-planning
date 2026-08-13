package com.example.sprint_planning.security.jwt;

/** Custom JWT claim names. */
public final class JwtClaims {

    public static final String EMAIL = "email";
    public static final String ROLES = "roles";
    public static final String PERMISSIONS = "permissions";
    public static final String TENANT_ID = "tenantId";
    public static final String TYPE = "type";

    public static final String TYPE_ACCESS = "ACCESS";

    private JwtClaims() {
    }
}
