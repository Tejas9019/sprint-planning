package com.example.sprint_planning.note.dto;

import com.example.sprint_planning.note.model.ChecklistItem;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record NoteResponse(
    UUID id,
    String title,
    String body,
    List<ChecklistItem> checklist,
    String color,
    List<String> tags,
    boolean pinned,
    boolean deleted,
    Instant createdAt,
    Instant updatedAt
) {}
