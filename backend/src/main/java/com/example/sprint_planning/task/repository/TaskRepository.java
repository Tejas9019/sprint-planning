package com.example.sprint_planning.task.repository;

import com.example.sprint_planning.task.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findAllByTenantId(UUID tenantId);
    Optional<Task> findByIdAndTenantId(UUID id, UUID tenantId);
}
