package com.example.sprint_planning.ticket.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.tenant.context.TenantContext;
import com.example.sprint_planning.tenant.repository.TenantMembershipRepository;
import com.example.sprint_planning.user.model.User;
import com.example.sprint_planning.user.repository.UserRepository;
import com.example.sprint_planning.workspace.model.Workspace;
import com.example.sprint_planning.workspace.repository.WorkspaceRepository;
import com.example.sprint_planning.ticket.dto.CreateTicketRequest;
import com.example.sprint_planning.ticket.dto.UpdateTicketRequest;
import com.example.sprint_planning.ticket.dto.TicketResponse;
import com.example.sprint_planning.ticket.model.Ticket;
import com.example.sprint_planning.ticket.model.TicketStatus;
import com.example.sprint_planning.ticket.model.TicketType;
import com.example.sprint_planning.task.model.TaskPriority;
import com.example.sprint_planning.ticket.repository.TicketRepository;
import com.example.sprint_planning.tenant.model.TenantMembership;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.sprint_planning.security.SecurityUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private TenantMembershipRepository tenantMembershipRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantContext tenantContext;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private UUID tenantId;
    private UUID userId;
    private UUID workspaceId;
    private Workspace workspace;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        userId = UUID.randomUUID();
        workspaceId = UUID.randomUUID();

        workspace = new Workspace();
        workspace.setId(workspaceId);
        workspace.setWorkspaceKey("PROJ");
        workspace.setTicketCounter(0);
    }

    @Test
    void updateTicket_savesAndMapsTags() {
        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::currentUserId).thenReturn(userId);
            when(tenantContext.requireTenantId()).thenReturn(tenantId);
            when(tenantMembershipRepository.findByTenantIdAndUserId(tenantId, userId))
                    .thenReturn(Optional.of(new TenantMembership()));
            when(workspaceRepository.findByIdAndTenantId(workspaceId, tenantId))
                    .thenReturn(Optional.of(workspace));

            UUID ticketId = UUID.randomUUID();
            Ticket existingTicket = new Ticket();
            existingTicket.setId(ticketId);
            existingTicket.setWorkspace(workspace);
            existingTicket.setTitle("Old Title");
            existingTicket.setStatus(TicketStatus.TODO);
            existingTicket.setType(TicketType.TASK);
            existingTicket.setPriority(TaskPriority.MEDIUM);

            User reporter = new User();
            reporter.setId(UUID.randomUUID());
            existingTicket.setReporter(reporter);

            UpdateTicketRequest request = new UpdateTicketRequest(
                    "Updated Title",
                    "New Description",
                    "IN_PROGRESS",
                    "TASK",
                    "HIGH",
                    null,
                    null,
                    null,
                    List.of("Tag1", "Tag2")
            );

            when(ticketRepository.findByIdAndWorkspaceId(ticketId, workspaceId))
                    .thenReturn(Optional.of(existingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            TicketResponse response = ticketService.updateTicket(workspaceId, ticketId, request);

            assertNotNull(response);
            assertEquals("Updated Title", response.title());
            assertEquals("IN_PROGRESS", response.status());
            assertEquals("HIGH", response.priority());
            assertEquals(List.of("Tag1", "Tag2"), response.tags());
        }
    }
}
