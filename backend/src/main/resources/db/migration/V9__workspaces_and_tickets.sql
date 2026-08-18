CREATE TABLE workspaces (
    id             BINARY(16)   NOT NULL,
    tenant_id      BINARY(16)   NOT NULL,
    name           VARCHAR(255) NOT NULL,
    workspace_key  VARCHAR(10)  NOT NULL,
    description    TEXT         NULL,
    owner_id       BINARY(16)   NOT NULL,
    ticket_counter BIGINT       NOT NULL DEFAULT 0,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_workspaces PRIMARY KEY (id),
    CONSTRAINT fk_workspaces_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_workspaces_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_tenant_key UNIQUE (tenant_id, workspace_key)
);

CREATE TABLE tickets (
    id             BINARY(16)   NOT NULL,
    workspace_id   BINARY(16)   NOT NULL,
    ticket_number  BIGINT       NOT NULL,
    ticket_key     VARCHAR(30)  NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT         NULL,
    status         VARCHAR(50)  NOT NULL DEFAULT 'TODO',
    type           VARCHAR(50)  NOT NULL,
    priority       VARCHAR(50)  NOT NULL DEFAULT 'MEDIUM',
    assignee_id    BINARY(16)   NULL,
    reporter_id    BINARY(16)   NOT NULL,
    epic_id        BINARY(16)   NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_tickets PRIMARY KEY (id),
    CONSTRAINT fk_tickets_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_assignee FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_tickets_reporter FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_epic FOREIGN KEY (epic_id) REFERENCES tickets(id) ON DELETE SET NULL,
    CONSTRAINT uq_workspace_ticket UNIQUE (workspace_id, ticket_number)
);

CREATE INDEX ix_workspaces_tenant ON workspaces (tenant_id);
CREATE INDEX ix_tickets_workspace ON tickets (workspace_id);
