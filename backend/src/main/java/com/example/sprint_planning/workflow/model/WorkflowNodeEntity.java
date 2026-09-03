package com.example.sprint_planning.workflow.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "workflow_nodes")
public class WorkflowNodeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workflow_id", nullable = false)
    private UUID workflowId;

    @Column(name = "canvas_node_id", nullable = false)
    private String canvasNodeId;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "node_type")
    private String nodeType;

    @Column(name = "position_x")
    private Double positionX = 0.0;

    @Column(name = "position_y")
    private Double positionY = 0.0;

    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getWorkflowId() { return workflowId; }
    public void setWorkflowId(UUID workflowId) { this.workflowId = workflowId; }

    public String getCanvasNodeId() { return canvasNodeId; }
    public void setCanvasNodeId(String canvasNodeId) { this.canvasNodeId = canvasNodeId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getNodeType() { return nodeType; }
    public void setNodeType(String nodeType) { this.nodeType = nodeType; }

    public Double getPositionX() { return positionX; }
    public void setPositionX(Double positionX) { this.positionX = positionX; }

    public Double getPositionY() { return positionY; }
    public void setPositionY(Double positionY) { this.positionY = positionY; }

    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }
}
