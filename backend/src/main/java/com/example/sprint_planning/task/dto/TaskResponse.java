package com.example.sprint_planning.task.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TaskResponse(
    UUID id,
    String title,
    String description,
    String status, // lowercase todo | doing | done
    String priority, // lowercase low | medium | high
    String tag,
    UUID assigneeId,
    int commentsCount,
    List<CommentResponse> comments,
    String imageUrl,
    LocalDate date
) {}
