package com.springapp.rideshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.springapp.rideshare.entity.RouteStop;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {   
    List<RouteStop> findByRideIdOrderByStopOrderAsc(Long rideId);

    List<RouteStop> findByLocationNameIgnoreCase(String locationName);
}