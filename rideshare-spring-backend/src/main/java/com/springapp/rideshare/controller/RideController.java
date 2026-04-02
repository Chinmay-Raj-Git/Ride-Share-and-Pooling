package com.springapp.rideshare.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.dto.PassengerResponse;
import com.springapp.rideshare.dto.RideRequest;
import com.springapp.rideshare.dto.RideSearchResult;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.security.SecurityUtils;
import com.springapp.rideshare.service.BookingService;
import com.springapp.rideshare.service.RideService;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private final RideService rideService;
    private final BookingService bookingService;

    public RideController(RideService rideService, BookingService bookingService) {
        this.rideService = rideService;
        this.bookingService = bookingService;
    }

    @PostMapping("/create")
    public Ride createRide(@RequestBody RideRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        Ride ride = new Ride();
        ride.setOrigin(request.getOrigin());
        ride.setDestination(request.getDestination());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        return rideService.createRide(ride, currentUser, request);
    }

    @GetMapping
    public List<Ride> getAllRides() {
        return rideService.getAllRides();
    }

    @GetMapping("/search")
    public List<RideSearchResult> searchRides(
            @RequestParam String origin,
            @RequestParam String destination) {
        return rideService.searchRides(origin, destination);
    }

    @GetMapping("/my")
    public List<Ride> getMyRides() {
        User currentUser = SecurityUtils.getCurrentUser();
        return rideService.getMyRides(currentUser);
    }

    @GetMapping("/{rideId}/passengers")
    public List<PassengerResponse> getPassengers(@PathVariable Long rideId) {
        return bookingService.getPassengersForRide(rideId);
    }

    // ── Task 3: Driver marks ride as completed ────────────────────────────────
    @PostMapping("/{rideId}/complete")
    public ResponseEntity<?> completeRide(@PathVariable Long rideId) {
        try {
            User currentUser = SecurityUtils.getCurrentUser();
            Ride ride = rideService.completeRide(rideId, currentUser);
            return ResponseEntity.ok(ride);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Task 2: Driver cancels ride — all passengers emailed ─────────────────
    @DeleteMapping("/{rideId}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable Long rideId) {
        try {
            User currentUser = SecurityUtils.getCurrentUser();
            rideService.cancelRide(rideId, currentUser);
            return ResponseEntity.ok("Ride cancelled. All passengers have been notified.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
