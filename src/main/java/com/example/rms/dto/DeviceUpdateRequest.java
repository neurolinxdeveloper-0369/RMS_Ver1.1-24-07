package com.example.rms.dto;

import java.util.List;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.Valid;

public class DeviceUpdateRequest {
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location; // Keeping for backward compatibility or general location
    
    @Size(max = 100)
    private String state;
    
    @Size(max = 100)
    private String city;
    
    @Size(max = 100)
    private String region;
    
    @Size(max = 100)
    private String division;
    
    @Min(value = -90, message = "Latitude must be valid")
    @Max(value = 90, message = "Latitude must be valid")
    private Double latitude;
    
    @Min(value = -180, message = "Longitude must be valid")
    @Max(value = 180, message = "Longitude must be valid")
    private Double longitude;
    
    @Min(value = 0, message = "Capacity cannot be negative")
    private Double capacity;
    
    @Valid
    private List<MeterUpdateRequest> meters;

    public static class MeterUpdateRequest {
        private String meterId;
        
        @Pattern(regexp = "^(Solar|Wind|Inverter|)$", message = "Invalid meter type")
        private String type; // Solar, Wind, Inverter

        public String getMeterId() {
            return meterId;
        }

        public void setMeterId(String meterId) {
            this.meterId = meterId;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
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

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

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

    public List<MeterUpdateRequest> getMeters() {
        return meters;
    }

    public void setMeters(List<MeterUpdateRequest> meters) {
        this.meters = meters;
    }
}
