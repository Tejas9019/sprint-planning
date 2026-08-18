package com.example.sprint_planning.tag.controller;

import com.example.sprint_planning.security.SecurityUtils;
import com.example.sprint_planning.tag.model.Tag;
import com.example.sprint_planning.tag.repository.TagRepository;
import com.example.sprint_planning.tenant.context.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tags")
public class TagController {
    private final TagRepository tagRepository;
    private final TenantContext tenantContext;

    public TagController(TagRepository tagRepository, TenantContext tenantContext) {
        this.tagRepository = tagRepository;
        this.tenantContext = tenantContext;
    }

    @GetMapping
    public List<String> getTags() {
        UUID tenantId = tenantContext.requireTenantId();
        return tagRepository.findAllByTenantId(tenantId).stream()
                .map(Tag::getName)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TagCreateResponse createTag(@RequestBody TagRequest request) {
        UUID tenantId = tenantContext.requireTenantId();
        String cleanName = request.name().trim();
        if (cleanName.isEmpty()) {
            throw new IllegalArgumentException("Tag name cannot be empty");
        }
        
        String savedName = tagRepository.findByTenantIdAndName(tenantId, cleanName)
                .orElseGet(() -> tagRepository.save(new Tag(tenantId, cleanName)))
                .getName();
        return new TagCreateResponse(savedName);
    }

    public record TagRequest(String name) {}
    public record TagCreateResponse(String name) {}
}
