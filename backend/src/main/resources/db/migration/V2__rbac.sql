-- Roles, permissions, and the role->permission join table.
CREATE TABLE roles (
    id          BINARY(16)  NOT NULL,
    name        VARCHAR(40) NOT NULL,
    description VARCHAR(255) NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uq_roles_name UNIQUE (name)
);

CREATE TABLE permissions (
    id          BINARY(16)  NOT NULL,
    name        VARCHAR(64) NOT NULL,
    description VARCHAR(255) NULL,
    CONSTRAINT pk_permissions PRIMARY KEY (id),
    CONSTRAINT uq_permissions_name UNIQUE (name)
);

CREATE TABLE role_permissions (
    role_id       BINARY(16) NOT NULL,
    permission_id BINARY(16) NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

CREATE INDEX ix_role_permissions_permission ON role_permissions (permission_id);
