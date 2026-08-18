package com.example.sprint_planning.workspace.service;

import com.example.sprint_planning.workspace.dto.CreateWorkspaceRequest;
import com.example.sprint_planning.workspace.dto.UpdateWorkspaceRequest;
import com.example.sprint_planning.workspace.dto.WorkspaceResponse;

import java.util.List;
import java.util.UUID;

public interface WorkspaceService {
    List<WorkspaceResponse> getWorkspacesForActiveTenant();
    WorkspaceResponse getWorkspace(UUID id);
    WorkspaceResponse createWorkspace(CreateWorkspaceRequest request);
    WorkspaceResponse updateWorkspace(UUID id, UpdateWorkspaceRequest request);
    void deleteWorkspace(UUID id);
}
