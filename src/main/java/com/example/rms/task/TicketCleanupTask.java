package com.example.rms.task;

import com.example.rms.repository.TicketRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;

@Component
public class TicketCleanupTask {

    private final TicketRepository ticketRepository;

    public TicketCleanupTask(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupClearedTickets() {
        ZonedDateTime cutoff = ZonedDateTime.now().minusHours(24);
        ticketRepository.deleteByStatusAndClearedAtBefore("Cleared", cutoff);
        System.out.println("Ran ticket cleanup task. Deleted Cleared tickets older than 24 hours.");
    }
}
