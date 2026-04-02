package com.springapp.rideshare.dto;

import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.RouteStop;

public class RideSearchResult {

    private Ride ride;
    private RouteStop pickupStop;
    private RouteStop dropStop;
    private int availableSeats;
    private double segmentFare;

    public RideSearchResult(Ride ride, RouteStop pickupStop, RouteStop dropStop,
            int availableSeats, double segmentFare) {
        this.ride = ride;
        this.pickupStop = pickupStop;
        this.dropStop = dropStop;
        this.availableSeats = availableSeats;
        this.segmentFare = segmentFare;
    }

    public Ride getRide() {
        return ride;
    }

    public RouteStop getPickupStop() {
        return pickupStop;
    }

    public RouteStop getDropStop() {
        return dropStop;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public double getSegmentFare() {
        return segmentFare;
    }
}
