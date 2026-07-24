package com.example.rms.entity;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "meter_history", indexes = {
    @Index(name = "idx_mh_device_id", columnList = "device_id"),
    @Index(name = "idx_mh_timestamp", columnList = "timestamp")
})
public class MeterHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "meter_id", nullable = false)
    private String meterId;

    @Column(name = "meter_type")
    private String meterType;

    @Column(name = "state")
    private String state;

    @Column(name = "city")
    private String city;

    @Column(name = "region")
    private String region;

    @Column(name = "division")
    private String division;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "voltage")
    private Double voltage;

    @Column(name = "current")
    private Double current;

    @Column(name = "power")
    private Double power;

    @Column(name = "energy")
    private Double energy;

    @Column(name = "capacity")
    private Double capacity;

    @Column(name = "timestamp", nullable = false)
    private ZonedDateTime timestamp;

    // Constructors
    public MeterHistory() {}

    public MeterHistory(MeterLatest latest, ZonedDateTime timestamp) {
        this.deviceId = latest.getDeviceId();
        this.meterId = latest.getMeterId();
        this.meterType = latest.getMeterType();
        this.state = latest.getState();
        this.city = latest.getCity();
        this.region = latest.getRegion();
        this.division = latest.getDivision();
        this.voltage = latest.getVoltage();
        this.current = latest.getCurrent();
        this.power = latest.getPower();
        this.energy = latest.getEnergy();
        this.capacity = latest.getCapacity();
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getMeterId() { return meterId; }
    public void setMeterId(String meterId) { this.meterId = meterId; }

    public String getMeterType() { return meterType; }
    public void setMeterType(String meterType) { this.meterType = meterType; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getDivision() { return division; }
    public void setDivision(String division) {
        this.division = division;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getVoltage() { return voltage; }
    public void setVoltage(Double voltage) { this.voltage = voltage; }

    public Double getCurrent() { return current; }
    public void setCurrent(Double current) { this.current = current; }

    public Double getPower() { return power; }
    public void setPower(Double power) { this.power = power; }

    public Double getEnergy() { return energy; }
    public void setEnergy(Double energy) { this.energy = energy; }

    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }

    public ZonedDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(ZonedDateTime timestamp) { this.timestamp = timestamp; }
}
