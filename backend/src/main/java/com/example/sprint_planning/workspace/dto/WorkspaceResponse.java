package com.example.sprint_planning.workspace.dto;

import java.util.UUID;

public record WorkspaceResponse(
    UUID id,
    String name,
    String workspaceKey,
    String description,
    UUID ownerId,
    long ticketCounter
) {}
