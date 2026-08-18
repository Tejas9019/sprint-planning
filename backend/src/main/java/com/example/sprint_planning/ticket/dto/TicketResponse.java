package com.example.sprint_planning.ticket.dto;

import java.util.UUID;

public record TicketResponse(
    UUID id,
    UUID workspaceId,
    long ticketNumber,
    String ticketKey,
    String title,
    String description,
    String status,
    String type,
    String priority,
    UUID assigneeId,
    UUID reporterId,
    UUID epicId,
    java.time.LocalDate dueDate,
    java.util.List<String> tags
) {}
