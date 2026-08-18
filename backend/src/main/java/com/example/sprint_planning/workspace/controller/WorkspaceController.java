package com.example.sprint_planning.workspace.controller;

import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.workspace.dto.CreateWorkspaceRequest;
import com.example.sprint_planning.workspace.dto.UpdateWorkspaceRequest;
import com.example.sprint_planning.workspace.dto.WorkspaceResponse;
import com.example.sprint_planning.workspace.service.WorkspaceService;
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
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.WORKSPACES)
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public List<WorkspaceResponse> getWorkspaces() {
        return workspaceService.getWorkspacesForActiveTenant();
    }

    @GetMapping("/{id}")
    public WorkspaceResponse getWorkspace(@PathVariable UUID id) {
        return workspaceService.getWorkspace(id);
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(@Valid @RequestBody CreateWorkspaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.createWorkspace(request));
    }

    @PutMapping("/{id}")
    public WorkspaceResponse updateWorkspace(@PathVariable UUID id, @Valid @RequestBody UpdateWorkspaceRequest request) {
        return workspaceService.updateWorkspace(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable UUID id) {
        workspaceService.deleteWorkspace(id);
        return ResponseEntity.noContent().build();
    }
}
