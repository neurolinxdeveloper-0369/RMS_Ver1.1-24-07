package com.example.rms.dto;

public class DashboardSummaryDto {
    private long totalDevices;
    private double activePower;
    private double totalEnergy;
    private double efficiency;
    private double uptime;
    private double todayEnergy;
    private long activeDevices;
    private long idleDevices;
    private long offlineDevices;

    public long getTotalDevices() {
        return totalDevices;
    }

    public void setTotalDevices(long totalDevices) {
        this.totalDevices = totalDevices;
    }

    public double getActivePower() {
        return activePower;
    }

    public void setActivePower(double activePower) {
        this.activePower = activePower;
    }

    public double getTotalEnergy() {
        return totalEnergy;
    }

    public void setTotalEnergy(double totalEnergy) {
        this.totalEnergy = totalEnergy;
    }

    public double getEfficiency() {
        return efficiency;
    }

    public void setEfficiency(double efficiency) {
        this.efficiency = efficiency;
    }

    public double getUptime() {
        return uptime;
    }

    public void setUptime(double uptime) {
        this.uptime = uptime;
    }

    public double getTodayEnergy() {
        return todayEnergy;
    }

    public void setTodayEnergy(double todayEnergy) {
        this.todayEnergy = todayEnergy;
    }

    public long getActiveDevices() {
        return activeDevices;
    }

    public void setActiveDevices(long activeDevices) {
        this.activeDevices = activeDevices;
    }

    public long getIdleDevices() {
        return idleDevices;
    }

    public void setIdleDevices(long idleDevices) {
        this.idleDevices = idleDevices;
    }

    public long getOfflineDevices() {
        return offlineDevices;
    }

    public void setOfflineDevices(long offlineDevices) {
        this.offlineDevices = offlineDevices;
    }
}
