package com.example.sprint_planning.workflow.repository;

import com.example.sprint_planning.workflow.model.WorkflowEdgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowEdgeRepository extends JpaRepository<WorkflowEdgeEntity, UUID> {
    List<WorkflowEdgeEntity> findByWorkflowId(UUID workflowId);
    void deleteByWorkflowId(UUID workflowId);
}
