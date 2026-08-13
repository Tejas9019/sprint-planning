package com.example.sprint_planning.note.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.tenant.context.TenantContext;
import com.example.sprint_planning.note.dto.NoteRequest;
import com.example.sprint_planning.note.dto.NoteResponse;
import com.example.sprint_planning.note.model.ChecklistItem;
import com.example.sprint_planning.note.model.Note;
import com.example.sprint_planning.note.repository.NoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceImplTest {

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private TenantContext tenantContext;

    @InjectMocks
    private NoteServiceImpl noteService;

    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        lenient().when(tenantContext.requireTenantId()).thenReturn(tenantId);
    }

    @Test
    void getNotesForActiveTenant_returnsList() {
        Note note = new Note();
        note.setId(UUID.randomUUID());
        note.setTenantId(tenantId);
        note.setTitle("My Note");
        note.setBody("Body text");
        note.setColor("blue");

        when(noteRepository.findAllByTenantId(tenantId)).thenReturn(List.of(note));

        List<NoteResponse> responses = noteService.getNotesForActiveTenant();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("My Note", responses.get(0).title());
        assertEquals("blue", responses.get(0).color());
    }

    @Test
    void createNote_savesAndReturnsNote() {
        ChecklistItem item = new ChecklistItem("c1", "Task 1", false);
        NoteRequest request = new NoteRequest(
                "New Note",
                "Note Content",
                List.of(item),
                "purple",
                true,
                false,
                List.of("tag1", "tag2")
        );

        Note savedNote = new Note();
        savedNote.setId(UUID.randomUUID());
        savedNote.setTenantId(tenantId);
        savedNote.setTitle("New Note");
        savedNote.setBody("Note Content");
        savedNote.setChecklist(List.of(item));
        savedNote.setColor("purple");
        savedNote.setPinned(true);
        savedNote.setTags("tag1,tag2");

        when(noteRepository.save(any(Note.class))).thenReturn(savedNote);

        NoteResponse response = noteService.createNote(request);

        assertNotNull(response);
        assertEquals("New Note", response.title());
        assertEquals("purple", response.color());
        assertTrue(response.pinned());
        assertEquals(2, response.tags().size());
        assertTrue(response.tags().contains("tag1"));
    }

    @Test
    void updateNote_updatesFields() {
        UUID noteId = UUID.randomUUID();
        Note existingNote = new Note();
        existingNote.setId(noteId);
        existingNote.setTenantId(tenantId);
        existingNote.setTitle("Old Title");

        NoteRequest request = new NoteRequest(
                "Updated Title",
                "New Body",
                null,
                "yellow",
                false,
                true,
                Collections.emptyList()
        );

        when(noteRepository.findByIdAndTenantId(noteId, tenantId)).thenReturn(Optional.of(existingNote));
        when(noteRepository.save(any(Note.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NoteResponse response = noteService.updateNote(noteId, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.title());
        assertEquals("yellow", response.color());
        assertFalse(response.pinned());
        assertTrue(response.deleted());
        assertTrue(response.tags().isEmpty());
    }

    @Test
    void updateNote_throwsNotFound_whenNonExistent() {
        UUID noteId = UUID.randomUUID();
        when(noteRepository.findByIdAndTenantId(noteId, tenantId)).thenReturn(Optional.empty());

        NoteRequest request = new NoteRequest("title", null, null, null, null, null, null);

        assertThrows(ResourceNotFoundException.class, () -> noteService.updateNote(noteId, request));
    }

    @Test
    void deleteNote_removesNote() {
        UUID noteId = UUID.randomUUID();
        Note note = new Note();
        note.setId(noteId);
        note.setTenantId(tenantId);

        when(noteRepository.findByIdAndTenantId(noteId, tenantId)).thenReturn(Optional.of(note));

        noteService.deleteNote(noteId);

        verify(noteRepository).delete(note);
    }

    @Test
    void emptyTrash_purgesDeletedNotes() {
        noteService.emptyTrash();
        verify(noteRepository).deleteAllByTenantIdAndDeletedTrue(tenantId);
    }
}
