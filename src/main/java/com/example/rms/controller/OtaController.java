package com.example.rms.controller;

import com.example.rms.service.MqttService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/ota")
public class OtaController {

    private final String UPLOAD_DIR = "ota-firmware";
    private final MqttService mqttService;

    public OtaController(MqttService mqttService) {
        this.mqttService = mqttService;
        // Create the directory if it doesn't exist
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateFirmware(@RequestParam("deviceId") String deviceId,
            @RequestParam("firmware") MultipartFile firmware,
            HttpServletRequest request) {
        // Validate input
        if (deviceId == null || deviceId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Device ID is required"));
        }
        if (firmware == null || firmware.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Firmware file is required"));
        }

        System.out.println("Received firmware update request for device: " + deviceId);

        try {
            // Save the file as device-{deviceId}.bin
            Path filePath = Paths.get(UPLOAD_DIR, "device-" + deviceId + ".bin");
            Files.write(filePath, firmware.getBytes());
            System.out.println("Firmware saved successfully to " + filePath.toAbsolutePath());

            // Generate download URL with actual LAN IP instead of localhost
            String hostIp = java.net.InetAddress.getLocalHost().getHostAddress();
            String baseUrl = String.format("http://%s:%d", hostIp, request.getServerPort());
            String downloadUrl = baseUrl + "/api/ota/download/" + deviceId;

            // Publish MQTT message to notify the device
            String topic = "device/" + deviceId + "/ota_command";
            mqttService.publish(topic, downloadUrl);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Firmware uploaded and ready for device " + deviceId,
                    "status", "success"));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save firmware file"));
        }
    }

    @GetMapping("/download/{deviceId}")
    public ResponseEntity<Resource> downloadFirmware(@PathVariable String deviceId) {
        try {
            // Clean up the device ID in case the ESP32 accidentally included a space or
            // newline (\r or \n)
            deviceId = deviceId.trim().replaceAll("[\\r\\n]", "");

            Path filePath = Paths.get(UPLOAD_DIR, "device-" + deviceId + ".bin");

            if (!Files.exists(filePath)) {
                System.out.println("ERROR: Firmware not found at path: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
