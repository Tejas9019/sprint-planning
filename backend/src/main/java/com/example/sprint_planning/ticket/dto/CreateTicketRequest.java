package com.example.sprint_planning.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateTicketRequest(
    @NotBlank(message = "Title is required")
    String title,

    String description,

    @NotBlank(message = "Status is required")
    String status,

    @NotBlank(message = "Type is required")
    String type,

    @NotBlank(message = "Priority is required")
    String priority,

    UUID assigneeId,
    UUID epicId,
    java.time.LocalDate dueDate,
    java.util.List<String> tags
) {}
