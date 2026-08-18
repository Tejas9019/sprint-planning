package com.example.sprint_planning.ticket.service;

import com.example.sprint_planning.ticket.dto.CreateTicketRequest;
import com.example.sprint_planning.ticket.dto.TicketResponse;
import com.example.sprint_planning.ticket.dto.UpdateTicketRequest;

import java.util.List;
import java.util.UUID;

public interface TicketService {
    List<TicketResponse> getTicketsForWorkspace(UUID workspaceId);
    TicketResponse getTicket(UUID workspaceId, UUID ticketId);
    TicketResponse createTicket(UUID workspaceId, CreateTicketRequest request);
    TicketResponse updateTicket(UUID workspaceId, UUID ticketId, UpdateTicketRequest request);
    void deleteTicket(UUID workspaceId, UUID ticketId);
}
