package com.example.sprint_planning.task.dto;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(
    String title,
    String description,
    String status,
    String priority,
    String tag,
    UUID assigneeId,
    LocalDate date,
    String imageUrl
) {}
