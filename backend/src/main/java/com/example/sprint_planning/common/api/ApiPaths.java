package com.example.sprint_planning.common.api;

/** Centralised REST path constants. All public API lives under {@code /api/v1}. */
public final class ApiPaths {

    public static final String API_V1 = "/api/v1";
    public static final String AUTH = API_V1 + "/auth";
    public static final String USERS = API_V1 + "/users";
    public static final String TENANTS = API_V1 + "/tenants";
    public static final String TASKS = API_V1 + "/tasks";
    public static final String NOTES = API_V1 + "/notes";
    public static final String WORKSPACES = API_V1 + "/workspaces";
    public static final String FILES = API_V1 + "/files";

    private ApiPaths() {
    }
}
