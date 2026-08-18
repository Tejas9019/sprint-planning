-- Create tags table for dynamic tenant tags.
CREATE TABLE tags (
    id         BINARY(16)   NOT NULL,
    tenant_id  BINARY(16)   NOT NULL,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_tags PRIMARY KEY (id),
    CONSTRAINT fk_tags_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT uq_tenant_tag UNIQUE (tenant_id, name)
);

-- Add tags column to tickets.
ALTER TABLE tickets ADD COLUMN tags VARCHAR(512) NULL;
