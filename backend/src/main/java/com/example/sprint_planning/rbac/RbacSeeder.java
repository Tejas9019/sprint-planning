package com.example.sprint_planning.rbac;

import com.example.sprint_planning.rbac.model.Permission;
import com.example.sprint_planning.rbac.model.Role;
import com.example.sprint_planning.rbac.repository.PermissionRepository;
import com.example.sprint_planning.rbac.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class RbacSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RbacSeeder(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public void run(String... args) {
        if (roleRepository.findByName(RoleName.ADMIN).isPresent()) {
            return; // Already seeded
        }

        // 1. Seed Permissions
        Map<String, Permission> permMap = new HashMap<>();
        Map<String, String> permDescriptions = new HashMap<>();
        permDescriptions.put("TASK_CREATE", "Create tasks");
        permDescriptions.put("TASK_READ", "View tasks");
        permDescriptions.put("TASK_UPDATE", "Edit tasks");
        permDescriptions.put("TASK_DELETE", "Delete tasks");
        permDescriptions.put("BOARD_READ", "View boards");
        permDescriptions.put("MEMBER_INVITE", "Invite members to a tenant");
        permDescriptions.put("MEMBER_READ", "View tenant members");
        permDescriptions.put("MEMBER_UPDATE_ROLE", "Change a member's role");
        permDescriptions.put("MEMBER_REMOVE", "Remove members from a tenant");
        permDescriptions.put("TENANT_MANAGE", "Manage tenant settings");
        permDescriptions.put("USER_READ", "View users");
        permDescriptions.put("USER_MANAGE", "Manage users");

        for (PermissionName nameEnum : PermissionName.values()) {
            String name = nameEnum.name();
            Permission perm = permissionRepository.findByName(name)
                    .orElseGet(() -> permissionRepository.save(new Permission(name, permDescriptions.getOrDefault(name, name))));
            permMap.put(name, perm);
        }

        // 2. Seed Roles and map Permissions
        // ADMIN
        Role admin = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> new Role(RoleName.ADMIN.name(), "Full tenant administration"));
        admin.getPermissions().addAll(permMap.values());
        roleRepository.save(admin);

        // MANAGER
        Role manager = roleRepository.findByName(RoleName.MANAGER)
                .orElseGet(() -> new Role(RoleName.MANAGER.name(), "Manage tasks and members"));
        List<String> managerPerms = Arrays.asList("TASK_CREATE", "TASK_READ", "TASK_UPDATE", "TASK_DELETE", "BOARD_READ", "MEMBER_INVITE", "MEMBER_READ", "USER_READ");
        for (String pName : managerPerms) {
            if (permMap.containsKey(pName)) {
                manager.getPermissions().add(permMap.get(pName));
            }
        }
        roleRepository.save(manager);

        // MEMBER
        Role member = roleRepository.findByName(RoleName.MEMBER)
                .orElseGet(() -> new Role(RoleName.MEMBER.name(), "Create and edit own/assigned work"));
        List<String> memberPerms = Arrays.asList("TASK_CREATE", "TASK_READ", "TASK_UPDATE", "TASK_DELETE", "BOARD_READ", "MEMBER_READ", "USER_READ");
        for (String pName : memberPerms) {
            if (permMap.containsKey(pName)) {
                member.getPermissions().add(permMap.get(pName));
            }
        }
        roleRepository.save(member);

        // VIEWER
        Role viewer = roleRepository.findByName(RoleName.VIEWER)
                .orElseGet(() -> new Role(RoleName.VIEWER.name(), "Read-only access"));
        List<String> viewerPerms = Arrays.asList("TASK_READ", "BOARD_READ", "MEMBER_READ", "USER_READ");
        for (String pName : viewerPerms) {
            if (permMap.containsKey(pName)) {
                viewer.getPermissions().add(permMap.get(pName));
            }
        }
        roleRepository.save(viewer);
    }
}
