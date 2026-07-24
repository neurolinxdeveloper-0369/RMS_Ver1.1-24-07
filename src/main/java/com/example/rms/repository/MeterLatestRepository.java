package com.example.rms.repository;

import com.example.rms.entity.MeterLatest;
import com.example.rms.entity.MeterLatestId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeterLatestRepository extends JpaRepository<MeterLatest, MeterLatestId> {
    List<MeterLatest> findAllByOrderByDeviceIdAscMeterIdAsc();
}
