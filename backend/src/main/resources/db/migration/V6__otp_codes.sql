-- One-time passcodes for sign-in and signup email verification.
-- The 6-digit code is stored hashed; challenge_id is the public handle returned to the client.
CREATE TABLE otp_codes (
    id           BINARY(16)   NOT NULL,
    user_id      BINARY(16)   NULL,
    email        VARCHAR(255) NOT NULL,
    code_hash    CHAR(64)     NOT NULL,
    purpose      VARCHAR(20)  NOT NULL,   -- SIGNIN | SIGNUP_VERIFY
    challenge_id BINARY(16)   NOT NULL,
    expires_at   TIMESTAMP    NOT NULL,
    consumed     BOOLEAN      NOT NULL DEFAULT FALSE,
    attempts     INT          NOT NULL DEFAULT 0,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_otp_codes PRIMARY KEY (id),
    CONSTRAINT uq_otp_challenge UNIQUE (challenge_id),
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_otp_email_purpose ON otp_codes (email, purpose);
