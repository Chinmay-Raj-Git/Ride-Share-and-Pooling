package com.springapp.rideshare.dto;

import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.RouteStop;

public class RideSearchResult {

    private Ride ride;
    private RouteStop pickupStop;
    private RouteStop dropStop;
    private int availableSeats;
    private double segmentFare;
    // Average rating of the driver for this ride (0.0 = unrated)
    private double averageRating;

    public RideSearchResult(Ride ride, RouteStop pickupStop, RouteStop dropStop,
            int availableSeats, double segmentFare) {
        this.ride = ride;
        this.pickupStop = pickupStop;
        this.dropStop = dropStop;
        this.availableSeats = availableSeats;
        this.segmentFare = segmentFare;
        this.averageRating = 0.0;
    }

    public RideSearchResult(Ride ride, RouteStop pickupStop, RouteStop dropStop,
            int availableSeats, double segmentFare, double averageRating) {
        this(ride, pickupStop, dropStop, availableSeats, segmentFare);
        this.averageRating = averageRating;
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

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}
