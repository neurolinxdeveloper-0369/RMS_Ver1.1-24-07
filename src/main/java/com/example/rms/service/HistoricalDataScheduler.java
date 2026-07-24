package com.example.rms.service;

import com.example.rms.entity.MeterHistory;
import com.example.rms.entity.MeterLatest;
import com.example.rms.repository.MeterHistoryRepository;
import com.example.rms.repository.MeterLatestRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class HistoricalDataScheduler {

    private final MeterLatestRepository meterLatestRepository;
    private final MeterHistoryRepository meterHistoryRepository;

    public HistoricalDataScheduler(MeterLatestRepository meterLatestRepository, MeterHistoryRepository meterHistoryRepository) {
        this.meterLatestRepository = meterLatestRepository;
        this.meterHistoryRepository = meterHistoryRepository;
    }

    // Runs at the top of every hour
    @Scheduled(cron = "0 0 * * * *")
    public void captureHourlySnapshot() {
        System.out.println("Running scheduled task: Capturing hourly snapshot of MeterLatest data...");
        
        List<MeterLatest> latestRecords = meterLatestRepository.findAll();
        ZonedDateTime now = ZonedDateTime.now();
        
        int count = 0;
        for (MeterLatest latest : latestRecords) {
            // Only capture if we have some data
            if (latest.getPower() != null || latest.getEnergy() != null || latest.getVoltage() != null) {
                MeterHistory history = new MeterHistory(latest, now);
                meterHistoryRepository.save(history);
                count++;
            }
        }
        
        System.out.println("Successfully captured " + count + " historical records.");
    }
}
