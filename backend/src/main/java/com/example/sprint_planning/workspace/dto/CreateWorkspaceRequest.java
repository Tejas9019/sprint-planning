package com.example.sprint_planning.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWorkspaceRequest(
    @NotBlank(message = "Workspace name is required") 
    String name,

    @NotBlank(message = "Workspace key is required")
    @Size(min = 2, max = 10, message = "Key must be between 2 and 10 characters")
    String workspaceKey,

    String description
) {}
