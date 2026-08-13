package com.example.sprint_planning.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(
    @NotBlank String title,
    String description,
    @NotBlank String status,
    String priority,
    String tag,
    UUID assigneeId,
    LocalDate date,
    String imageUrl
) {}
