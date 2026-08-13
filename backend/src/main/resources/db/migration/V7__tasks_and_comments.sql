CREATE TABLE tasks (
    id          BINARY(16)   NOT NULL,
    tenant_id   BINARY(16)   NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT         NULL,
    status      VARCHAR(20)  NOT NULL, -- TODO | DOING | DONE
    priority    VARCHAR(20)  NULL,     -- LOW | MEDIUM | HIGH
    tag         VARCHAR(50)  NULL,
    assignee_id BINARY(16)   NULL,
    date        DATE         NULL,
    image_url   VARCHAR(512) NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_tasks PRIMARY KEY (id),
    CONSTRAINT fk_tasks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE task_comments (
    id          BINARY(16) NOT NULL,
    task_id     BINARY(16) NOT NULL,
    author_id   BINARY(16) NOT NULL,
    text        TEXT       NOT NULL,
    created_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_task_comments PRIMARY KEY (id),
    CONSTRAINT fk_comments_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_tasks_tenant ON tasks (tenant_id);
CREATE INDEX ix_comments_task ON task_comments (task_id);
