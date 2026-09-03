package com.example.sprint_planning.workflow.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class WorkflowDto {
    private UUID id;
    private UUID workspaceId;
    private String name;
    private String description;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private List<WorkflowNodeDto> nodes = new ArrayList<>();
    private List<WorkflowEdgeDto> edges = new ArrayList<>();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<WorkflowNodeDto> getNodes() { return nodes; }
    public void setNodes(List<WorkflowNodeDto> nodes) { this.nodes = nodes; }

    public List<WorkflowEdgeDto> getEdges() { return edges; }
    public void setEdges(List<WorkflowEdgeDto> edges) { this.edges = edges; }
}
