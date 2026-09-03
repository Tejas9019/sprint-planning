package com.example.sprint_planning.workflow.repository;

import com.example.sprint_planning.workflow.model.WorkflowNodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowNodeRepository extends JpaRepository<WorkflowNodeEntity, UUID> {
    List<WorkflowNodeEntity> findByWorkflowId(UUID workflowId);
    void deleteByWorkflowId(UUID workflowId);
}
