package com.example.sprint_planning.task.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
    UUID id,
    String author,
    String text,
    Instant createdAt
) {}
