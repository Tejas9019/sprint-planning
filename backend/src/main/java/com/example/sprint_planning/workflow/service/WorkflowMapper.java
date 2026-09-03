package com.example.sprint_planning.workflow.service;

import com.example.sprint_planning.workflow.dto.WorkflowDto;
import com.example.sprint_planning.workflow.dto.WorkflowEdgeDto;
import com.example.sprint_planning.workflow.dto.WorkflowNodeDto;
import com.example.sprint_planning.workflow.model.WorkflowEdgeEntity;
import com.example.sprint_planning.workflow.model.WorkflowEntity;
import com.example.sprint_planning.workflow.model.WorkflowNodeEntity;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class WorkflowMapper {

    public static WorkflowDto toDto(WorkflowEntity entity, List<WorkflowNodeEntity> nodes, List<WorkflowEdgeEntity> edges) {
        WorkflowDto dto = new WorkflowDto();
        dto.setId(entity.getId());
        dto.setWorkspaceId(entity.getWorkspaceId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (nodes != null) {
            dto.setNodes(nodes.stream().map(WorkflowMapper::toNodeDto).collect(Collectors.toList()));
        }
        if (edges != null) {
            dto.setEdges(edges.stream().map(WorkflowMapper::toEdgeDto).collect(Collectors.toList()));
        }
        return dto;
    }

    public static WorkflowNodeDto toNodeDto(WorkflowNodeEntity entity) {
        WorkflowNodeDto dto = new WorkflowNodeDto();
        dto.setId(entity.getCanvasNodeId());
        dto.setLabel(entity.getLabel());
        dto.setCategory(entity.getCategory());
        dto.setNodeType(entity.getNodeType());
        dto.setPositionX(entity.getPositionX());
        dto.setPositionY(entity.getPositionY());
        dto.setConfigJson(entity.getConfigJson());
        return dto;
    }

    public static WorkflowNodeEntity toNodeEntity(UUID workflowId, WorkflowNodeDto dto) {
        WorkflowNodeEntity entity = new WorkflowNodeEntity();
        entity.setWorkflowId(workflowId);
        entity.setCanvasNodeId(dto.getId());
        entity.setLabel(dto.getLabel() != null ? dto.getLabel() : "Custom Node");
        entity.setCategory(dto.getCategory() != null ? dto.getCategory() : "logic");
        entity.setNodeType(dto.getNodeType());
        entity.setPositionX(dto.getPositionX() != null ? dto.getPositionX() : 0.0);
        entity.setPositionY(dto.getPositionY() != null ? dto.getPositionY() : 0.0);
        entity.setConfigJson(dto.getConfigJson());
        return entity;
    }

    public static WorkflowEdgeDto toEdgeDto(WorkflowEdgeEntity entity) {
        WorkflowEdgeDto dto = new WorkflowEdgeDto();
        dto.setId(entity.getCanvasEdgeId());
        dto.setSource(entity.getSourceNodeId());
        dto.setTarget(entity.getTargetNodeId());
        dto.setLabel(entity.getLabel());
        return dto;
    }

    public static WorkflowEdgeEntity toEdgeEntity(UUID workflowId, WorkflowEdgeDto dto) {
        WorkflowEdgeEntity entity = new WorkflowEdgeEntity();
        entity.setWorkflowId(workflowId);
        entity.setCanvasEdgeId(dto.getId());
        entity.setSourceNodeId(dto.getSource());
        entity.setTargetNodeId(dto.getTarget());
        entity.setLabel(dto.getLabel());
        return entity;
    }
}
