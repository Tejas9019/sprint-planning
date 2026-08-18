package com.example.sprint_planning.ticket.controller;

import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.ticket.dto.CreateTicketRequest;
import com.example.sprint_planning.ticket.dto.TicketResponse;
import com.example.sprint_planning.ticket.dto.UpdateTicketRequest;
import com.example.sprint_planning.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.WORKSPACES + "/{workspaceId}/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<TicketResponse> getTickets(@PathVariable UUID workspaceId) {
        return ticketService.getTicketsForWorkspace(workspaceId);
    }

    @GetMapping("/{ticketId}")
    public TicketResponse getTicket(@PathVariable UUID workspaceId, @PathVariable UUID ticketId) {
        return ticketService.getTicket(workspaceId, ticketId);
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@PathVariable UUID workspaceId,
                                                       @Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(workspaceId, request));
    }

    @PutMapping("/{ticketId}")
    public TicketResponse updateTicket(@PathVariable UUID workspaceId,
                                       @PathVariable UUID ticketId,
                                       @Valid @RequestBody UpdateTicketRequest request) {
        return ticketService.updateTicket(workspaceId, ticketId, request);
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable UUID workspaceId,
                                             @PathVariable UUID ticketId) {
        ticketService.deleteTicket(workspaceId, ticketId);
        return ResponseEntity.noContent().build();
    }
}
