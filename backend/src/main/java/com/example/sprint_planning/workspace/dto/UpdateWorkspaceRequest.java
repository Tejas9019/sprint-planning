package com.example.sprint_planning.workspace.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateWorkspaceRequest(
    @NotBlank(message = "Workspace name is required")
    String name,

    String description
) {}
