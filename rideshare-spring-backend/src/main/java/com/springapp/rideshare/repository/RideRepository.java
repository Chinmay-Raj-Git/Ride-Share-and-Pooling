package com.springapp.rideshare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import com.springapp.rideshare.entity.Ride;

import jakarta.persistence.LockModeType;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByOriginAndDestination(String origin, String destination);

    List<Ride> findByDriverId(Long driverId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Ride> findRideForUpdateById(Long id);
}
