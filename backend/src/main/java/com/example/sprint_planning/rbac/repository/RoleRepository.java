package com.example.sprint_planning.rbac.repository;

import com.example.sprint_planning.rbac.RoleName;
import com.example.sprint_planning.rbac.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    default Optional<Role> findByName(RoleName name) {
        return findByName(name.name());
    }
}
