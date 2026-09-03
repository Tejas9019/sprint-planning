package com.example.sprint_planning.workflow.repository;

import com.example.sprint_planning.workflow.model.WorkflowEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<WorkflowEntity, UUID> {
    List<WorkflowEntity> findByWorkspaceId(UUID workspaceId);
}
