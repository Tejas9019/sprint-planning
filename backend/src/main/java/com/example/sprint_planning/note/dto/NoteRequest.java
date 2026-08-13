package com.example.sprint_planning.note.dto;

import com.example.sprint_planning.note.model.ChecklistItem;
import java.util.List;

public record NoteRequest(
    String title,
    String body,
    List<ChecklistItem> checklist,
    String color,
    Boolean pinned,
    Boolean deleted,
    List<String> tags
) {}
