package com.example.sprint_planning.workspace.repository;

import com.example.sprint_planning.workspace.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    List<Workspace> findAllByTenantId(UUID tenantId);
    Optional<Workspace> findByIdAndTenantId(UUID id, UUID tenantId);
    Optional<Workspace> findByTenantIdAndWorkspaceKey(UUID tenantId, String workspaceKey);
}
