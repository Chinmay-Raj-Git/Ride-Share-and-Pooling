package com.springapp.rideshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springapp.rideshare.entity.Ride;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByOriginAndDestination(String origin, String destination);

    List<Ride> findByDriverId(Long driverId);
}

