package com.example.rms.repository;

import com.example.rms.entity.MeterHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;

public interface MeterHistoryRepository extends JpaRepository<MeterHistory, Long> {

    @Query("SELECT mh FROM MeterHistory mh WHERE mh.deviceId = :deviceId AND mh.timestamp >= :startDate ORDER BY mh.timestamp ASC")
    List<MeterHistory> findByDeviceIdAndTimestampAfterOrderByTimestampAsc(@Param("deviceId") String deviceId, @Param("startDate") ZonedDateTime startDate);
    
    @Query("SELECT mh FROM MeterHistory mh WHERE mh.timestamp >= :startDate ORDER BY mh.timestamp ASC")
    List<MeterHistory> findAllByTimestampAfterOrderByTimestampAsc(@Param("startDate") ZonedDateTime startDate);
}
