package com.example.sprint_planning.ticket.repository;

import com.example.sprint_planning.ticket.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findAllByWorkspaceId(UUID workspaceId);
    Optional<Ticket> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    Optional<Ticket> findByWorkspaceIdAndTicketNumber(UUID workspaceId, long ticketNumber);
    Optional<Ticket> findByWorkspaceIdAndTicketKey(UUID workspaceId, String ticketKey);
}
