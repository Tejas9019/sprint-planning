CREATE TABLE notes (
    id          BINARY(16)   NOT NULL,
    tenant_id   BINARY(16)   NOT NULL,
    title       VARCHAR(255) NULL,
    body        TEXT         NULL,
    checklist   JSON         NULL,
    color       VARCHAR(20)  NOT NULL DEFAULT 'default',
    pinned      BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted     BOOLEAN      NOT NULL DEFAULT FALSE,
    tags        VARCHAR(512) NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_notes PRIMARY KEY (id),
    CONSTRAINT fk_notes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
);

CREATE INDEX ix_notes_tenant ON notes (tenant_id);
