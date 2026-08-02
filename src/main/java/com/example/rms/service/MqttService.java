package com.example.rms.service;

import com.example.rms.entity.MeterHistory;
import com.example.rms.entity.MeterLatest;
import com.example.rms.entity.MeterLatestId;
import com.example.rms.repository.MeterHistoryRepository;
import com.example.rms.repository.MeterLatestRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.ZonedDateTime;

@Service
public class MqttService implements MqttCallback {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.username:}")
    private String username;

    @Value("${mqtt.password:}")
    private String password;

    private MqttClient mqttClient;

    @Autowired
    private MeterLatestRepository meterLatestRepository;

    @Autowired
    private MeterHistoryRepository meterHistoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        try {
            mqttClient = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            mqttClient.setCallback(this);
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setAutomaticReconnect(true);
            
            if (username != null && !username.isEmpty()) {
                options.setUserName(username);
            }
            if (password != null && !password.isEmpty()) {
                options.setPassword(password.toCharArray());
            }
            
            System.out.println("Connecting to EMQX MQTT broker: " + brokerUrl);
            mqttClient.connect(options);
            System.out.println("Connected to EMQX MQTT broker successfully!");
            
            // Subscribe to all meter data topics
            mqttClient.subscribe("meters/+/+/data", 1);
            System.out.println("Subscribed to MQTT topic: meters/+/+/data");

        } catch (MqttException e) {
            System.err.println("Warning: Failed to connect to EMQX broker. OTA push notifications won't work.");
            // Do not throw to prevent crashing the Spring Boot app if broker is offline
        }
    }

    public boolean publish(String topic, String payload) {
        if (mqttClient == null || !mqttClient.isConnected()) {
            System.err.println("MQTT client not connected. Cannot publish message.");
            return false;
        }

        try {
            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(1);
            mqttClient.publish(topic, message);
            System.out.println("MQTT message published to topic " + topic + " : " + payload);
            return true;
        } catch (MqttException e) {
            System.err.println("Failed to publish MQTT message to topic " + topic);
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.err.println("MQTT Connection lost: " + cause.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        String payload = new String(message.getPayload());
        System.out.println("Received MQTT Message on topic " + topic + ": " + payload);

        try {
            JsonNode node = objectMapper.readTree(payload);
            String deviceId = node.has("device_id") ? node.get("device_id").asText() : "UNKNOWN";
            String meterId = node.has("meter_id") ? node.get("meter_id").asText() : "0";
            Double voltage = node.has("voltage") ? node.get("voltage").asDouble() : 0.0;
            Double current = node.has("current") ? node.get("current").asDouble() : 0.0;
            Double power = node.has("power") ? node.get("power").asDouble() : 0.0;
            Double energy = node.has("energy") ? node.get("energy").asDouble() : 0.0;

            MeterLatest latest = meterLatestRepository.findById(new MeterLatestId(deviceId, meterId)).orElse(null);
            if (latest == null) {
                latest = new MeterLatest();
                latest.setDeviceId(deviceId);
                latest.setMeterId(meterId);
            }
            
            latest.setVoltage(voltage);
            latest.setCurrent(current);
            latest.setPower(power);
            latest.setEnergy(energy);
            latest.setUpdatedAt(ZonedDateTime.now());

            meterLatestRepository.save(latest);

            MeterHistory history = new MeterHistory(latest, ZonedDateTime.now());
            meterHistoryRepository.save(history);
            
            System.out.println("Saved telemetry data to Postgres for Device: " + deviceId);
        } catch (Exception e) {
            System.err.println("Error processing MQTT message: " + e.getMessage());
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Not used
    }

    @PreDestroy
    public void cleanup() {
        if (mqttClient != null && mqttClient.isConnected()) {
            try {
                mqttClient.disconnect();
                System.out.println("Disconnected from MQTT broker");
            } catch (MqttException e) {
                e.printStackTrace();
            }
        }
    }
}
