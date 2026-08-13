package com.example.sprint_planning.note.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.tenant.context.TenantContext;
import com.example.sprint_planning.note.dto.NoteRequest;
import com.example.sprint_planning.note.dto.NoteResponse;
import com.example.sprint_planning.note.model.Note;
import com.example.sprint_planning.note.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final TenantContext tenantContext;

    public NoteServiceImpl(NoteRepository noteRepository, TenantContext tenantContext) {
        this.noteRepository = noteRepository;
        this.tenantContext = tenantContext;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponse> getNotesForActiveTenant() {
        UUID tenantId = tenantContext.requireTenantId();
        return noteRepository.findAllByTenantId(tenantId).stream()
                .map(this::toNoteResponse)
                .toList();
    }

    @Override
    public NoteResponse createNote(NoteRequest request) {
        UUID tenantId = tenantContext.requireTenantId();
        Note note = new Note();
        note.setTenantId(tenantId);
        note.setTitle(request.title());
        note.setBody(request.body());
        note.setChecklist(request.checklist() != null ? request.checklist() : new ArrayList<>());
        note.setColor(request.color() != null ? request.color() : "default");
        note.setPinned(request.pinned() != null ? request.pinned() : false);
        note.setDeleted(request.deleted() != null ? request.deleted() : false);

        if (request.tags() != null && !request.tags().isEmpty()) {
            note.setTags(String.join(",", request.tags()));
        }

        Note saved = noteRepository.save(note);
        return toNoteResponse(saved);
    }

    @Override
    public NoteResponse updateNote(UUID id, NoteRequest request) {
        UUID tenantId = tenantContext.requireTenantId();
        Note note = noteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        if (request.title() != null) {
            note.setTitle(request.title());
        }
        if (request.body() != null) {
            note.setBody(request.body());
        }
        if (request.checklist() != null) {
            note.setChecklist(request.checklist());
        }
        if (request.color() != null) {
            note.setColor(request.color());
        }
        if (request.pinned() != null) {
            note.setPinned(request.pinned());
        }
        if (request.deleted() != null) {
            note.setDeleted(request.deleted());
        }
        if (request.tags() != null) {
            if (request.tags().isEmpty()) {
                note.setTags(null);
            } else {
                note.setTags(String.join(",", request.tags()));
            }
        }

        Note saved = noteRepository.save(note);
        return toNoteResponse(saved);
    }

    @Override
    public void deleteNote(UUID id) {
        UUID tenantId = tenantContext.requireTenantId();
        Note note = noteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
        noteRepository.delete(note);
    }

    @Override
    public void emptyTrash() {
        UUID tenantId = tenantContext.requireTenantId();
        noteRepository.deleteAllByTenantIdAndDeletedTrue(tenantId);
    }

    private NoteResponse toNoteResponse(Note note) {
        List<String> tagList = Collections.emptyList();
        if (note.getTags() != null && !note.getTags().isBlank()) {
            tagList = Arrays.stream(note.getTags().split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .toList();
        }

        return new NoteResponse(
                note.getId(),
                note.getTitle() != null ? note.getTitle() : "",
                note.getBody() != null ? note.getBody() : "",
                note.getChecklist() != null ? note.getChecklist() : Collections.emptyList(),
                note.getColor(),
                tagList,
                note.isPinned(),
                note.isDeleted(),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }
}
