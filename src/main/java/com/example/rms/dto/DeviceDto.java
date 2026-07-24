package com.example.rms.dto;

import java.util.List;

public class DeviceDto {
    private String id;
    private String name;
    private String type;
    private String location; // fallback
    private String state;
    private String city;
    private String region;
    private String division;
    private Double latitude;
    private Double longitude;
    private Double capacity;
    private String status;
    private String lastSeen;
    private List<MeterDetail> meters;
    private boolean isMapped;

    public static class MeterDetail {
        private String originalId;
        private String customId;
        private String type;
        
        public MeterDetail(String originalId, String customId, String type) {
            this.originalId = originalId;
            this.customId = customId;
            this.type = type;
        }
        
        public String getOriginalId() { return originalId; }
        public void setOriginalId(String originalId) { this.originalId = originalId; }
        public String getCustomId() { return customId; }
        public void setCustomId(String customId) { this.customId = customId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getCapacity() {
        return capacity;
    }

    public void setCapacity(Double capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(String lastSeen) {
        this.lastSeen = lastSeen;
    }

    public List<MeterDetail> getMeters() {
        return meters;
    }

    public void setMeters(List<MeterDetail> meters) {
        this.meters = meters;
    }

    public boolean isMapped() {
        return isMapped;
    }

    public void setMapped(boolean mapped) {
        isMapped = mapped;
    }
}
