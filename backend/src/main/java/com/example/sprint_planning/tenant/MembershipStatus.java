package com.example.sprint_planning.tenant;

/** Lifecycle of a tenant membership. Mirrors the frontend contactsStore MemberStatus. */
public enum MembershipStatus {
    INVITED,
    ACTIVE,
    REJECTED,
    REVOKED
}
