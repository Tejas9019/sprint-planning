package com.example.sprint_planning.workflow.dto;

import java.util.ArrayList;
import java.util.List;

public class CreateWorkflowRequest {
    private String name;
    private String description;
    private List<WorkflowNodeDto> nodes = new ArrayList<>();
    private List<WorkflowEdgeDto> edges = new ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<WorkflowNodeDto> getNodes() { return nodes; }
    public void setNodes(List<WorkflowNodeDto> nodes) { this.nodes = nodes; }

    public List<WorkflowEdgeDto> getEdges() { return edges; }
    public void setEdges(List<WorkflowEdgeDto> edges) { this.edges = edges; }
}
