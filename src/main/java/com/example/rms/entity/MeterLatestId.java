package com.example.rms.entity;

import java.io.Serializable;
import java.util.Objects;

public class MeterLatestId implements Serializable {
    private String deviceId;
    private String meterId;

    public MeterLatestId() {
    }

    public MeterLatestId(String deviceId, String meterId) {
        this.deviceId = deviceId;
        this.meterId = meterId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getMeterId() {
        return meterId;
    }

    public void setMeterId(String meterId) {
        this.meterId = meterId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MeterLatestId that = (MeterLatestId) o;
        return Objects.equals(deviceId, that.deviceId) && Objects.equals(meterId, that.meterId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(deviceId, meterId);
    }
}
