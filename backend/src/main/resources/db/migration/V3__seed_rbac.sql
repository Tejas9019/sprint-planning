-- Seed roles, fine-grained permissions, and the role->permission matrix.
-- Idempotent: INSERT IGNORE relies on the UNIQUE(name) constraints.

INSERT IGNORE INTO roles (id, name, description) VALUES
    (UUID_TO_BIN(UUID()), 'ADMIN',   'Full tenant administration'),
    (UUID_TO_BIN(UUID()), 'MANAGER', 'Manage tasks and members'),
    (UUID_TO_BIN(UUID()), 'MEMBER',  'Create and edit own/assigned work'),
    (UUID_TO_BIN(UUID()), 'VIEWER',  'Read-only access');

INSERT IGNORE INTO permissions (id, name, description) VALUES
    (UUID_TO_BIN(UUID()), 'TASK_CREATE',        'Create tasks'),
    (UUID_TO_BIN(UUID()), 'TASK_READ',          'View tasks'),
    (UUID_TO_BIN(UUID()), 'TASK_UPDATE',        'Edit tasks'),
    (UUID_TO_BIN(UUID()), 'TASK_DELETE',        'Delete tasks'),
    (UUID_TO_BIN(UUID()), 'BOARD_READ',         'View boards'),
    (UUID_TO_BIN(UUID()), 'MEMBER_INVITE',      'Invite members to a tenant'),
    (UUID_TO_BIN(UUID()), 'MEMBER_READ',        'View tenant members'),
    (UUID_TO_BIN(UUID()), 'MEMBER_UPDATE_ROLE', 'Change a member''s role'),
    (UUID_TO_BIN(UUID()), 'MEMBER_REMOVE',      'Remove members from a tenant'),
    (UUID_TO_BIN(UUID()), 'TENANT_MANAGE',      'Manage tenant settings'),
    (UUID_TO_BIN(UUID()), 'USER_READ',          'View users'),
    (UUID_TO_BIN(UUID()), 'USER_MANAGE',        'Manage users');

-- ADMIN -> every permission
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'ADMIN';

-- MANAGER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN ('TASK_CREATE','TASK_READ','TASK_UPDATE','TASK_DELETE','BOARD_READ',
                'MEMBER_INVITE','MEMBER_READ','USER_READ')
WHERE r.name = 'MANAGER';

-- MEMBER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN ('TASK_CREATE','TASK_READ','TASK_UPDATE','TASK_DELETE','BOARD_READ',
                'MEMBER_READ','USER_READ')
WHERE r.name = 'MEMBER';

-- VIEWER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN ('TASK_READ','BOARD_READ','MEMBER_READ','USER_READ')
WHERE r.name = 'VIEWER';
