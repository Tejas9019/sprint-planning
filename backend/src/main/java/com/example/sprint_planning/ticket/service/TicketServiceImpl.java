package com.example.sprint_planning.ticket.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.security.SecurityUtils;
import com.example.sprint_planning.tenant.context.TenantContext;
import com.example.sprint_planning.tenant.repository.TenantMembershipRepository;
import com.example.sprint_planning.user.model.User;
import com.example.sprint_planning.user.repository.UserRepository;
import com.example.sprint_planning.workspace.model.Workspace;
import com.example.sprint_planning.workspace.repository.WorkspaceRepository;
import com.example.sprint_planning.task.model.TaskPriority;
import com.example.sprint_planning.ticket.model.Ticket;
import com.example.sprint_planning.ticket.model.TicketType;
import com.example.sprint_planning.ticket.model.TicketStatus;
import com.example.sprint_planning.ticket.dto.CreateTicketRequest;
import com.example.sprint_planning.ticket.dto.UpdateTicketRequest;
import com.example.sprint_planning.ticket.dto.TicketResponse;
import com.example.sprint_planning.ticket.repository.TicketRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final WorkspaceRepository workspaceRepository;
    private final TenantMembershipRepository tenantMembershipRepository;
    private final UserRepository userRepository;
    private final TenantContext tenantContext;

    public TicketServiceImpl(TicketRepository ticketRepository,
                             WorkspaceRepository workspaceRepository,
                             TenantMembershipRepository tenantMembershipRepository,
                             UserRepository userRepository,
                             TenantContext tenantContext) {
        this.ticketRepository = ticketRepository;
        this.workspaceRepository = workspaceRepository;
        this.tenantMembershipRepository = tenantMembershipRepository;
        this.userRepository = userRepository;
        this.tenantContext = tenantContext;
    }

    private Workspace validateAndGetWorkspace(UUID workspaceId) {
        UUID tenantId = tenantContext.requireTenantId();
        UUID userId = SecurityUtils.currentUserId();

        // Check if user belongs to the active tenant
        boolean isMember = tenantMembershipRepository.findByTenantIdAndUserId(tenantId, userId).isPresent();
        if (!isMember) {
            throw new AccessDeniedException("User is not a member of this tenant");
        }

        // Fetch workspace and assert tenant ownership
        Workspace workspace = workspaceRepository.findByIdAndTenantId(workspaceId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));
        return workspace;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsForWorkspace(UUID workspaceId) {
        validateAndGetWorkspace(workspaceId);
        return ticketRepository.findAllByWorkspaceId(workspaceId).stream()
                .map(this::toTicketResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicket(UUID workspaceId, UUID ticketId) {
        validateAndGetWorkspace(workspaceId);
        Ticket ticket = ticketRepository.findByIdAndWorkspaceId(ticketId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
        return toTicketResponse(ticket);
    }

    @Override
    public TicketResponse createTicket(UUID workspaceId, CreateTicketRequest request) {
        Workspace workspace = validateAndGetWorkspace(workspaceId);
        UUID userId = SecurityUtils.currentUserId();

        User reporter = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter user not found"));

        Ticket ticket = new Ticket();
        ticket.setWorkspace(workspace);
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description());
        ticket.setStatus(TicketStatus.valueOf(request.status().toUpperCase()));
        ticket.setType(TicketType.valueOf(request.type().toUpperCase()));
        ticket.setPriority(TaskPriority.fromString(request.priority()));
        ticket.setReporter(reporter);
        ticket.setDueDate(request.dueDate());
        if (request.tags() != null) {
            ticket.setTags(String.join(",", request.tags()));
        }

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
            ticket.setAssignee(assignee);
        }

        if (request.epicId() != null) {
            Ticket epic = ticketRepository.findByIdAndWorkspaceId(request.epicId(), workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Epic ticket not found"));
            if (epic.getType() != TicketType.EPIC) {
                throw new IllegalArgumentException("Target epic ticket must be of type EPIC");
            }
            ticket.setEpic(epic);
        }

        // Thread-safe ticket key number incrementation
        synchronized (this) {
            // Re-fetch to prevent concurrency race condition in counter
            Workspace activeWorkspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
            long nextNumber = activeWorkspace.getTicketCounter() + 1;
            activeWorkspace.setTicketCounter(nextNumber);
            workspaceRepository.save(activeWorkspace);

            ticket.setTicketNumber(nextNumber);
            ticket.setTicketKey(activeWorkspace.getWorkspaceKey() + "-" + nextNumber);
        }

        Ticket saved = ticketRepository.save(ticket);
        return toTicketResponse(saved);
    }

    @Override
    public TicketResponse updateTicket(UUID workspaceId, UUID ticketId, UpdateTicketRequest request) {
        validateAndGetWorkspace(workspaceId);

        Ticket ticket = ticketRepository.findByIdAndWorkspaceId(ticketId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description());
        ticket.setStatus(TicketStatus.valueOf(request.status().toUpperCase()));
        ticket.setType(TicketType.valueOf(request.type().toUpperCase()));
        ticket.setPriority(TaskPriority.fromString(request.priority()));
        ticket.setDueDate(request.dueDate());
        if (request.tags() != null) {
            ticket.setTags(String.join(",", request.tags()));
        }

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
            ticket.setAssignee(assignee);
        } else {
            ticket.setAssignee(null);
        }

        if (request.epicId() != null) {
            Ticket epic = ticketRepository.findByIdAndWorkspaceId(request.epicId(), workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Epic ticket not found"));
            if (epic.getType() != TicketType.EPIC) {
                throw new IllegalArgumentException("Target epic ticket must be of type EPIC");
            }
            ticket.setEpic(epic);
        } else {
            ticket.setEpic(null);
        }

        Ticket saved = ticketRepository.save(ticket);
        return toTicketResponse(saved);
    }

    @Override
    public void deleteTicket(UUID workspaceId, UUID ticketId) {
        validateAndGetWorkspace(workspaceId);

        Ticket ticket = ticketRepository.findByIdAndWorkspaceId(ticketId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        ticketRepository.delete(ticket);
    }

    private TicketResponse toTicketResponse(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getWorkspace().getId(),
                ticket.getTicketNumber(),
                ticket.getTicketKey(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus().name(),
                ticket.getType().name(),
                ticket.getPriority().name(),
                ticket.getAssignee() != null ? ticket.getAssignee().getId() : null,
                ticket.getReporter().getId(),
                ticket.getEpic() != null ? ticket.getEpic().getId() : null,
                ticket.getDueDate(),
                ticket.getTags() != null && !ticket.getTags().trim().isEmpty()
                        ? java.util.Arrays.asList(ticket.getTags().split(","))
                        : java.util.Collections.emptyList()
        );
    }
}
