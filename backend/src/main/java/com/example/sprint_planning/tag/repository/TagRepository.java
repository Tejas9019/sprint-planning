package com.example.sprint_planning.tag.repository;

import com.example.sprint_planning.tag.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {
    List<Tag> findAllByTenantId(UUID tenantId);
    Optional<Tag> findByTenantIdAndName(UUID tenantId, String name);
}
