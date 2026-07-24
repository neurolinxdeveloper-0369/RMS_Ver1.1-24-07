package com.example.rms.controller;

import com.example.rms.dto.DeviceDto;
import com.example.rms.dto.DeviceUpdateRequest;
import com.example.rms.entity.MeterLatest;
import com.example.rms.entity.MeterLatestId;
import com.example.rms.repository.MeterLatestRepository;
import com.example.rms.service.MqttService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final MeterLatestRepository meterLatestRepository;
    private final MqttService mqttService;

    public DeviceController(MeterLatestRepository meterLatestRepository, MqttService mqttService) {
        this.meterLatestRepository = meterLatestRepository;
        this.mqttService = mqttService;
    }

    @GetMapping
    public List<DeviceDto> getAllDevices() {
        List<MeterLatest> allMeters = meterLatestRepository.findAllByOrderByDeviceIdAscMeterIdAsc();
        
        Map<String, DeviceDto> deviceMap = new LinkedHashMap<>();
        Map<String, Boolean> deviceMappedStatus = new LinkedHashMap<>();

        for (MeterLatest m : allMeters) {
            String deviceId = m.getDeviceId();
            DeviceDto dto = deviceMap.computeIfAbsent(deviceId, id -> {
                DeviceDto newDto = new DeviceDto();
                newDto.setId(id);
                newDto.setMeters(new ArrayList<>());
                return newDto;
            });
            
            // Check if this meter has a type. If any meter has a type, the device is mapped.
            boolean hasType = m.getMeterType() != null && !m.getMeterType().trim().isEmpty();
            if (hasType) {
                deviceMappedStatus.put(deviceId, true);
            }
            
            // Add meter detail
            dto.getMeters().add(new DeviceDto.MeterDetail(m.getMeterId(), m.getCustomMeterId(), m.getMeterType()));
            
            // Populate location/capacity if present
            if (m.getCity() != null && !m.getCity().isEmpty()) {
                dto.setLocation(m.getCity());
                dto.setCity(m.getCity());
            } else if (m.getState() != null && !m.getState().isEmpty()) {
                dto.setLocation(m.getState());
            }
            if (m.getState() != null) dto.setState(m.getState());
            
            if (m.getCapacity() != null) {
                dto.setCapacity(m.getCapacity());
            }
            
            if (m.getRegion() != null && !m.getRegion().isEmpty()) {
                dto.setRegion(m.getRegion());
            }

            if (m.getDivision() != null) dto.setDivision(m.getDivision());
            if (m.getLatitude() != null) dto.setLatitude(m.getLatitude());
            if (m.getLongitude() != null) dto.setLongitude(m.getLongitude());

            // Status and Last Seen logic
            if (m.getUpdatedAt() != null) {
                long secondsAgo = Duration.between(m.getUpdatedAt(), ZonedDateTime.now()).getSeconds();
                long minutesAgo = secondsAgo / 60;
                String lastSeenStr = secondsAgo < 60 ? secondsAgo + " sec ago" : (minutesAgo < 60 ? minutesAgo + " mins ago" : (minutesAgo / 60) + " hours ago");
                
                if (dto.getLastSeen() == null || secondsAgo < 300) {
                    dto.setLastSeen(lastSeenStr);
                    dto.setStatus(secondsAgo > 10 ? "Offline" : (m.getSwitchState() != null && m.getSwitchState() ? "Active" : "Idle"));
                }
            }
        }
        
        // Finalize device metadata based on mapped status
        for (DeviceDto dto : deviceMap.values()) {
            boolean isMapped = deviceMappedStatus.getOrDefault(dto.getId(), false);
            dto.setMapped(isMapped);
            
            if (isMapped) {
                dto.setType("Hybrid");
                dto.setName("Unit " + dto.getId().substring(Math.max(dto.getId().length() - 3, 0)));
            }
        }

        return new ArrayList<>(deviceMap.values());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDevice(@PathVariable String id, @Valid @RequestBody DeviceUpdateRequest request) {
        if (request.getMeters() != null) {
            for (DeviceUpdateRequest.MeterUpdateRequest meterReq : request.getMeters()) {
                MeterLatestId pk = new MeterLatestId(id, meterReq.getMeterId());
                Optional<MeterLatest> opt = meterLatestRepository.findById(pk);
                
                if (opt.isPresent()) {
                    MeterLatest meter = opt.get();
                    meter.setMeterType(meterReq.getType());
                    
                    if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
                        meter.setCity(request.getLocation()); // storing location in city field as fallback
                    }
                    if (request.getCity() != null) meter.setCity(request.getCity());
                    if (request.getState() != null) meter.setState(request.getState());
                    if (request.getRegion() != null) meter.setRegion(request.getRegion());
                    if (request.getDivision() != null) meter.setDivision(request.getDivision());
                    if (request.getLatitude() != null) meter.setLatitude(request.getLatitude());
                    if (request.getLongitude() != null) meter.setLongitude(request.getLongitude());

                    if (request.getCapacity() != null) {
                        meter.setCapacity(request.getCapacity());
                    }
                    
                    // Generate Custom Meter ID
                    if (meterReq.getType() != null && !meterReq.getType().isEmpty()) {
                        String prefix = "";
                        if (meterReq.getType().equalsIgnoreCase("Solar")) prefix = "METYSO";
                        else if (meterReq.getType().equalsIgnoreCase("Wind")) prefix = "METYWI";
                        else if (meterReq.getType().equalsIgnoreCase("Inverter")) prefix = "METYIN";
                        else prefix = "METYXX";
                        
                        // Parse original meter ID to append as 3 digits
                        try {
                            int originalIdNum = Integer.parseInt(meterReq.getMeterId());
                            meter.setCustomMeterId(prefix + String.format("%03d", originalIdNum));
                        } catch (NumberFormatException e) {
                            meter.setCustomMeterId(prefix + meterReq.getMeterId());
                        }
                    }
                    
                    meterLatestRepository.save(meter);
                }
            }
        }
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{deviceId}/meters/{meterId}/switch")
    public ResponseEntity<?> toggleSwitch(@PathVariable String deviceId, @PathVariable String meterId, @RequestBody Map<String, Boolean> body) {
        MeterLatestId pk = new MeterLatestId(deviceId, meterId);
        Optional<MeterLatest> opt = meterLatestRepository.findById(pk);
        if (opt.isPresent()) {
            MeterLatest meter = opt.get();
            Boolean state = body.get("state");
            meter.setSwitchState(state != null ? state : false);
            meterLatestRepository.save(meter);
            
            // Publish the command to MQTT exactly as the hardware expects
            boolean isOn = (state != null ? state : false);
            String topic = "meters/" + deviceId + "/" + meterId + "/cmd";
            String payload = "{\"switch\": " + isOn + "}";
            mqttService.publish(topic, payload);
            
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}/telemetry")
    public ResponseEntity<List<MeterLatest>> getDeviceTelemetry(@PathVariable String id) {
        List<MeterLatest> allMeters = meterLatestRepository.findAllByOrderByDeviceIdAscMeterIdAsc();
        List<MeterLatest> deviceMeters = new ArrayList<>();
        
        for (MeterLatest m : allMeters) {
            if (m.getDeviceId().equals(id)) {
                deviceMeters.add(m);
            }
        }
        
        if (deviceMeters.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(deviceMeters);
    }
}
