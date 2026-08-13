-- Tenants and the user<->tenant<->role membership table.
CREATE TABLE tenants (
    id            BINARY(16)   NOT NULL,
    name          VARCHAR(150) NOT NULL,
    slug          VARCHAR(80)  NOT NULL,
    owner_user_id BINARY(16)   NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_tenants PRIMARY KEY (id),
    CONSTRAINT uq_tenants_slug UNIQUE (slug),
    CONSTRAINT fk_tenants_owner FOREIGN KEY (owner_user_id) REFERENCES users (id)
);

CREATE TABLE tenant_memberships (
    id            BINARY(16)   NOT NULL,
    tenant_id     BINARY(16)   NOT NULL,
    user_id       BINARY(16)   NULL,        -- NULL while an invite is pending pre-signup
    role_id       BINARY(16)   NOT NULL,
    status        VARCHAR(20)  NOT NULL,    -- INVITED | ACTIVE | REJECTED | REVOKED
    department    VARCHAR(60)  NULL,
    invite_token  VARCHAR(64)  NULL,
    invited_email VARCHAR(255) NOT NULL,
    invited_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    joined_at     TIMESTAMP    NULL,
    CONSTRAINT pk_tenant_memberships PRIMARY KEY (id),
    CONSTRAINT uq_membership_tenant_user UNIQUE (tenant_id, user_id),
    CONSTRAINT uq_membership_invite_token UNIQUE (invite_token),
    CONSTRAINT fk_membership_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_membership_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
    CONSTRAINT fk_membership_role   FOREIGN KEY (role_id)   REFERENCES roles (id)
);

CREATE INDEX ix_membership_user   ON tenant_memberships (user_id);
CREATE INDEX ix_membership_tenant ON tenant_memberships (tenant_id);
