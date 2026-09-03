package com.example.sprint_planning.workflow.controller;

import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.workflow.dto.CreateWorkflowRequest;
import com.example.sprint_planning.workflow.dto.ExecutionResultDto;
import com.example.sprint_planning.workflow.dto.WorkflowDto;
import com.example.sprint_planning.workflow.service.WorkflowCrudService;
import com.example.sprint_planning.workflow.service.WorkflowExecutionEngine;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.WORKSPACES + "/{workspaceId}/workflows")
public class WorkflowController {

    private final WorkflowCrudService workflowCrudService;
    private final WorkflowExecutionEngine executionEngine;

    public WorkflowController(WorkflowCrudService workflowCrudService,
                              WorkflowExecutionEngine executionEngine) {
        this.workflowCrudService = workflowCrudService;
        this.executionEngine = executionEngine;
    }

    @GetMapping
    public List<WorkflowDto> getWorkflows(@PathVariable UUID workspaceId) {
        return workflowCrudService.getWorkflowsForWorkspace(workspaceId);
    }

    @GetMapping("/{workflowId}")
    public WorkflowDto getWorkflow(@PathVariable UUID workspaceId, @PathVariable UUID workflowId) {
        return workflowCrudService.getWorkflow(workspaceId, workflowId);
    }

    @PostMapping
    public ResponseEntity<WorkflowDto> createWorkflow(@PathVariable UUID workspaceId,
                                                      @Valid @RequestBody CreateWorkflowRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workflowCrudService.createWorkflow(workspaceId, request));
    }

    @PutMapping("/{workflowId}")
    public WorkflowDto updateWorkflow(@PathVariable UUID workspaceId,
                                      @PathVariable UUID workflowId,
                                      @Valid @RequestBody CreateWorkflowRequest request) {
        return workflowCrudService.updateWorkflow(workspaceId, workflowId, request);
    }

    @DeleteMapping("/{workflowId}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable UUID workspaceId,
                                            @PathVariable UUID workflowId) {
        workflowCrudService.deleteWorkflow(workspaceId, workflowId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{workflowId}/execute")
    public ExecutionResultDto executeWorkflow(@PathVariable UUID workspaceId,
                                             @PathVariable UUID workflowId,
                                             @RequestBody(required = false) Map<String, Object> inputPayload) {
        return executionEngine.executeWorkflow(workspaceId, workflowId, inputPayload);
    }
}
