-- Core users table. UUID primary keys stored as BINARY(16) for compact indexing.
CREATE TABLE users (
    id               BINARY(16)   NOT NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    password         VARCHAR(100) NULL,            -- NULL for OAuth (Google) accounts
    dob              DATE         NULL,
    enabled          BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    auth_provider    VARCHAR(20)  NOT NULL DEFAULT 'LOCAL',  -- LOCAL | GOOGLE
    provider_subject VARCHAR(255) NULL,                      -- e.g. Google "sub"
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX ix_users_provider_subject ON users (provider_subject);
