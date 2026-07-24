package com.example.rms.service;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
public class MqttService {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.username:}")
    private String username;

    @Value("${mqtt.password:}")
    private String password;

    private MqttClient mqttClient;

    @PostConstruct
    public void init() {
        try {
            mqttClient = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
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
