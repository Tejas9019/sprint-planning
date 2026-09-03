package com.example.sprint_planning.workflow.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.workflow.dto.CreateWorkflowRequest;
import com.example.sprint_planning.workflow.dto.WorkflowDto;
import com.example.sprint_planning.workflow.model.WorkflowEdgeEntity;
import com.example.sprint_planning.workflow.model.WorkflowEntity;
import com.example.sprint_planning.workflow.model.WorkflowNodeEntity;
import com.example.sprint_planning.workflow.repository.WorkflowEdgeRepository;
import com.example.sprint_planning.workflow.repository.WorkflowNodeRepository;
import com.example.sprint_planning.workflow.repository.WorkflowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkflowCrudService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowNodeRepository nodeRepository;
    private final WorkflowEdgeRepository edgeRepository;

    public WorkflowCrudService(WorkflowRepository workflowRepository,
                               WorkflowNodeRepository nodeRepository,
                               WorkflowEdgeRepository edgeRepository) {
        this.workflowRepository = workflowRepository;
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkflowDto> getWorkflowsForWorkspace(UUID workspaceId) {
        List<WorkflowEntity> workflows = workflowRepository.findByWorkspaceId(workspaceId);
        return workflows.stream().map(wf -> {
            List<WorkflowNodeEntity> nodes = nodeRepository.findByWorkflowId(wf.getId());
            List<WorkflowEdgeEntity> edges = edgeRepository.findByWorkflowId(wf.getId());
            return WorkflowMapper.toDto(wf, nodes, edges);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowDto getWorkflow(UUID workspaceId, UUID workflowId) {
        WorkflowEntity entity = workflowRepository.findById(workflowId)
                .filter(w -> w.getWorkspaceId().equals(workspaceId))
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + workflowId));
        List<WorkflowNodeEntity> nodes = nodeRepository.findByWorkflowId(workflowId);
        List<WorkflowEdgeEntity> edges = edgeRepository.findByWorkflowId(workflowId);
        return WorkflowMapper.toDto(entity, nodes, edges);
    }

    @Transactional
    public WorkflowDto createWorkflow(UUID workspaceId, CreateWorkflowRequest request) {
        WorkflowEntity entity = new WorkflowEntity();
        entity.setWorkspaceId(workspaceId);
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        WorkflowEntity savedWf = workflowRepository.save(entity);

        List<WorkflowNodeEntity> nodesToSave = request.getNodes().stream()
                .map(dto -> WorkflowMapper.toNodeEntity(savedWf.getId(), dto))
                .collect(Collectors.toList());
        List<WorkflowNodeEntity> savedNodes = nodeRepository.saveAll(nodesToSave);

        List<WorkflowEdgeEntity> edgesToSave = request.getEdges().stream()
                .map(dto -> WorkflowMapper.toEdgeEntity(savedWf.getId(), dto))
                .collect(Collectors.toList());
        List<WorkflowEdgeEntity> savedEdges = edgeRepository.saveAll(edgesToSave);

        return WorkflowMapper.toDto(savedWf, savedNodes, savedEdges);
    }

    @Transactional
    public WorkflowDto updateWorkflow(UUID workspaceId, UUID workflowId, CreateWorkflowRequest request) {
        WorkflowEntity entity = workflowRepository.findById(workflowId)
                .filter(w -> w.getWorkspaceId().equals(workspaceId))
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + workflowId));

        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        WorkflowEntity updated = workflowRepository.save(entity);

        nodeRepository.deleteByWorkflowId(workflowId);
        edgeRepository.deleteByWorkflowId(workflowId);

        List<WorkflowNodeEntity> nodesToSave = request.getNodes().stream()
                .map(dto -> WorkflowMapper.toNodeEntity(workflowId, dto))
                .collect(Collectors.toList());
        List<WorkflowNodeEntity> savedNodes = nodeRepository.saveAll(nodesToSave);

        List<WorkflowEdgeEntity> edgesToSave = request.getEdges().stream()
                .map(dto -> WorkflowMapper.toEdgeEntity(workflowId, dto))
                .collect(Collectors.toList());
        List<WorkflowEdgeEntity> savedEdges = edgeRepository.saveAll(edgesToSave);

        return WorkflowMapper.toDto(updated, savedNodes, savedEdges);
    }

    @Transactional
    public void deleteWorkflow(UUID workspaceId, UUID workflowId) {
        WorkflowEntity entity = workflowRepository.findById(workflowId)
                .filter(w -> w.getWorkspaceId().equals(workspaceId))
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + workflowId));
        nodeRepository.deleteByWorkflowId(workflowId);
        edgeRepository.deleteByWorkflowId(workflowId);
        workflowRepository.delete(entity);
    }
}
