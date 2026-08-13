-- Opaque refresh tokens, stored hashed (SHA-256 hex) to allow revocation + rotation.
CREATE TABLE refresh_tokens (
    id             BINARY(16)   NOT NULL,
    user_id        BINARY(16)   NOT NULL,
    token_hash     CHAR(64)     NOT NULL,
    tenant_id      BINARY(16)   NULL,       -- active tenant at issuance (for re-mint)
    expires_at     TIMESTAMP    NOT NULL,
    revoked        BOOLEAN      NOT NULL DEFAULT FALSE,
    replaced_by_id BINARY(16)   NULL,       -- rotation chain pointer
    user_agent     VARCHAR(255) NULL,
    ip             VARCHAR(45)  NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_refresh_user ON refresh_tokens (user_id);
