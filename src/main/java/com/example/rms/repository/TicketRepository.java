package com.example.rms.repository;

import com.example.rms.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByOrderByTriggerTimeDesc();
    void deleteByStatusAndClearedAtBefore(String status, java.time.ZonedDateTime date);
}
