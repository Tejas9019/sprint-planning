package com.example.sprint_planning.note.service;

import com.example.sprint_planning.note.dto.NoteRequest;
import com.example.sprint_planning.note.dto.NoteResponse;

import java.util.List;
import java.util.UUID;

public interface NoteService {
    List<NoteResponse> getNotesForActiveTenant();
    NoteResponse createNote(NoteRequest request);
    NoteResponse updateNote(UUID id, NoteRequest request);
    void deleteNote(UUID id);
    void emptyTrash();
}
