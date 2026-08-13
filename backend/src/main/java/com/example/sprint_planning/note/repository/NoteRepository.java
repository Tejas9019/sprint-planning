package com.example.sprint_planning.note.repository;

import com.example.sprint_planning.note.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findAllByTenantId(UUID tenantId);
    Optional<Note> findByIdAndTenantId(UUID id, UUID tenantId);
    void deleteAllByTenantIdAndDeletedTrue(UUID tenantId);
}
