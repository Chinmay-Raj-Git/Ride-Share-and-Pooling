package com.springapp.rideshare.service;

import org.springframework.stereotype.Service;

import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.RouteStop;

@Service
public class FareService {

    public double calculateSegmentFare(Ride ride, RouteStop pickup, RouteStop drop) {
        if (pickup.getStopOrder() >= drop.getStopOrder()) {
            throw new IllegalArgumentException("Pickup stop must come before drop stop");
        }
        double segmentDistance = drop.getCumulativeDistanceKm() - pickup.getCumulativeDistanceKm();
        double fare = (segmentDistance / ride.getDistanceKm()) * ride.getPrice();
        return Math.ceil(fare);
    }
}