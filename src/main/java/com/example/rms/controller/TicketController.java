package com.example.rms.controller;

import com.example.rms.entity.Ticket;
import com.example.rms.repository.TicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;

    public TicketController(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getAllTickets() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return ticketRepository.findAllByOrderByTriggerTimeDesc().stream().map(t -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", t.getId());
            map.put("severity", t.getSeverity());
            map.put("deviceId", t.getDeviceId());
            map.put("description", t.getDescription());
            map.put("triggerTime", t.getTriggerTime().format(formatter));
            map.put("status", t.getStatus());
            map.put("muted", t.getMuted());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> payload) {
        String deviceId = payload.get("deviceId");
        String severity = payload.get("severity");
        String description = payload.get("description");

        if (deviceId == null || severity == null || description == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        Ticket ticket = new Ticket();
        ticket.setDeviceId(deviceId);
        ticket.setSeverity(severity);
        ticket.setDescription(description);
        ticket.setTriggerTime(ZonedDateTime.now());
        ticket.setStatus("Unresolved");
        ticket.setMuted(false);

        ticketRepository.save(ticket);
        return ResponseEntity.ok(Map.of("message", "Ticket raised successfully"));
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<?> acknowledgeTicket(@PathVariable Long id) {
        Optional<Ticket> opt = ticketRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Ticket ticket = opt.get();
        ticket.setStatus("Acknowledged");
        ticketRepository.save(ticket);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/mute")
    public ResponseEntity<?> muteTicket(@PathVariable Long id) {
        Optional<Ticket> opt = ticketRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Ticket ticket = opt.get();
        ticket.setMuted(!ticket.getMuted());
        ticketRepository.save(ticket);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        if (newStatus == null) return ResponseEntity.badRequest().body("Missing status");

        Optional<Ticket> opt = ticketRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Ticket ticket = opt.get();
        ticket.setStatus(newStatus);
        
        if ("Cleared".equalsIgnoreCase(newStatus)) {
            ticket.setClearedAt(ZonedDateTime.now());
        } else {
            ticket.setClearedAt(null);
        }

        ticketRepository.save(ticket);
        return ResponseEntity.ok().build();
    }
}
