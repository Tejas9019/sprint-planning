package com.example.sprint_planning.workspace.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.security.SecurityUtils;
import com.example.sprint_planning.tenant.context.TenantContext;
import com.example.sprint_planning.tenant.model.TenantMembership;
import com.example.sprint_planning.tenant.repository.TenantMembershipRepository;
import com.example.sprint_planning.user.model.User;
import com.example.sprint_planning.user.repository.UserRepository;
import com.example.sprint_planning.workspace.dto.CreateWorkspaceRequest;
import com.example.sprint_planning.workspace.dto.UpdateWorkspaceRequest;
import com.example.sprint_planning.workspace.dto.WorkspaceResponse;
import com.example.sprint_planning.workspace.model.Workspace;
import com.example.sprint_planning.workspace.repository.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final TenantMembershipRepository tenantMembershipRepository;
    private final UserRepository userRepository;
    private final TenantContext tenantContext;

    public WorkspaceServiceImpl(WorkspaceRepository workspaceRepository,
                                TenantMembershipRepository tenantMembershipRepository,
                                UserRepository userRepository,
                                TenantContext tenantContext) {
        this.workspaceRepository = workspaceRepository;
        this.tenantMembershipRepository = tenantMembershipRepository;
        this.userRepository = userRepository;
        this.tenantContext = tenantContext;
    }

    private void checkAdminAccess() {
        UUID tenantId = tenantContext.requireTenantId();
        UUID userId = SecurityUtils.currentUserId();

        TenantMembership membership = tenantMembershipRepository.findByTenantIdAndUserId(tenantId, userId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this tenant"));

        if (!"ADMIN".equalsIgnoreCase(membership.getRole().getName())) {
            throw new AccessDeniedException("Only admins can perform this operation");
        }
    }

    private void checkMemberAccess() {
        UUID tenantId = tenantContext.requireTenantId();
        UUID userId = SecurityUtils.currentUserId();

        boolean isMember = tenantMembershipRepository.findByTenantIdAndUserId(tenantId, userId).isPresent();
        if (!isMember) {
            throw new AccessDeniedException("User is not a member of this tenant");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getWorkspacesForActiveTenant() {
        UUID tenantId = tenantContext.requireTenantId();
        checkMemberAccess();
        return workspaceRepository.findAllByTenantId(tenantId).stream()
                .map(this::toWorkspaceResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(UUID id) {
        UUID tenantId = tenantContext.requireTenantId();
        checkMemberAccess();
        Workspace workspace = workspaceRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + id));
        return toWorkspaceResponse(workspace);
    }

    @Override
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request) {
        UUID tenantId = tenantContext.requireTenantId();
        UUID userId = SecurityUtils.currentUserId();
        checkAdminAccess();

        // Check if key is already taken in this tenant
        String keyUpper = request.workspaceKey().trim().toUpperCase();
        if (workspaceRepository.findByTenantIdAndWorkspaceKey(tenantId, keyUpper).isPresent()) {
            throw new IllegalArgumentException("Workspace key '" + keyUpper + "' already exists in this tenant");
        }

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found"));

        Workspace workspace = new Workspace();
        workspace.setTenantId(tenantId);
        workspace.setName(request.name().trim());
        workspace.setWorkspaceKey(keyUpper);
        workspace.setDescription(request.description());
        workspace.setOwner(owner);
        workspace.setTicketCounter(0);

        Workspace saved = workspaceRepository.save(workspace);
        return toWorkspaceResponse(saved);
    }

    @Override
    public WorkspaceResponse updateWorkspace(UUID id, UpdateWorkspaceRequest request) {
        UUID tenantId = tenantContext.requireTenantId();
        checkAdminAccess();

        Workspace workspace = workspaceRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + id));

        workspace.setName(request.name().trim());
        workspace.setDescription(request.description());

        Workspace saved = workspaceRepository.save(workspace);
        return toWorkspaceResponse(saved);
    }

    @Override
    public void deleteWorkspace(UUID id) {
        UUID tenantId = tenantContext.requireTenantId();
        checkAdminAccess();

        Workspace workspace = workspaceRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + id));

        workspaceRepository.delete(workspace);
    }

    private WorkspaceResponse toWorkspaceResponse(Workspace workspace) {
        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getWorkspaceKey(),
                workspace.getDescription(),
                workspace.getOwner().getId(),
                workspace.getTicketCounter()
        );
    }
}
