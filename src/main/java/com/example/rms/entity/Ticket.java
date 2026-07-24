package com.example.rms.entity;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "ticket", indexes = {
    @Index(name = "idx_ticket_device_id", columnList = "device_id"),
    @Index(name = "idx_ticket_status", columnList = "status")
})
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "severity", nullable = false)
    private String severity; // critical, warning, info

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "trigger_time", nullable = false)
    private ZonedDateTime triggerTime;

    @Column(name = "status", nullable = false)
    private String status = "Unresolved"; // Unresolved, Acknowledged

    @Column(name = "muted", nullable = false)
    private Boolean muted = false;

    @Column(name = "cleared_at")
    private ZonedDateTime clearedAt;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ZonedDateTime getTriggerTime() {
        return triggerTime;
    }

    public void setTriggerTime(ZonedDateTime triggerTime) {
        this.triggerTime = triggerTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getMuted() {
        return muted;
    }

    public void setMuted(Boolean muted) {
        this.muted = muted;
    }

    public ZonedDateTime getClearedAt() {
        return clearedAt;
    }

    public void setClearedAt(ZonedDateTime clearedAt) {
        this.clearedAt = clearedAt;
    }
}
