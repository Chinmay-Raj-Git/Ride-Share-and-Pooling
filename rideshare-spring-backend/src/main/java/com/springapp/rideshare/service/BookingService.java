package com.springapp.rideshare.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springapp.rideshare.dto.PassengerResponse;
import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.RouteStop;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.repository.BookingRepository;
import com.springapp.rideshare.repository.RideRepository;
import com.springapp.rideshare.repository.RouteStopRepository;
import com.springapp.rideshare.security.SecurityUtils;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private RouteStopRepository routeStopRepository;

    @Autowired
    private FareService fareService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking bookRide(Long rideId, Long pickupStopId, Long dropStopId) {

        User user = SecurityUtils.getCurrentUser();

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getDriver().getId().equals(user.getId())) {
            throw new RuntimeException("Driver cannot book own ride");
        }

        RouteStop pickup = routeStopRepository.findById(pickupStopId)
                .orElseThrow(() -> new RuntimeException("Pickup stop not found"));

        RouteStop drop = routeStopRepository.findById(dropStopId)
                .orElseThrow(() -> new RuntimeException("Drop stop not found"));

        if (!pickup.getRide().getId().equals(rideId) || !drop.getRide().getId().equals(rideId)) {
            throw new RuntimeException("Stops do not belong to this ride");
        }

        if (pickup.getStopOrder() >= drop.getStopOrder()) {
            throw new RuntimeException("Invalid route: pickup must come before drop");
        }

        if (bookingRepository.existsByRideAndPassenger(ride, user)) {
            throw new RuntimeException("You have already booked this ride");
        }

        int overlapping = bookingRepository.countOverlappingBookings(
                rideId, pickup.getStopOrder(), drop.getStopOrder());
        if (overlapping >= ride.getAvailableSeats()) {
            throw new RuntimeException("No seats available for this segment");
        }

        double segmentPrice = fareService.calculateSegmentFare(ride, pickup, drop);

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(user);
        booking.setPickupStop(pickup);
        booking.setDropStop(drop);
        booking.setPrice(segmentPrice);
        booking.setBookingTime(java.time.LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        // Notify driver of new booking
        try {
            emailService.sendBookingCreatedToDriver(
                ride.getDriver().getEmail(),
                ride.getDriver().getName(),
                user.getName(),
                ride.getOrigin(),
                ride.getDestination(),
                ride.getDepartureTime().toString(),
                segmentPrice
            );
        } catch (Exception e) {
            // Email failure must not break booking
            System.err.println("Failed to send booking notification email: " + e.getMessage());
        }

        return saved;
    }

    public List<Booking> getMyBookings(User passenger) {
        return bookingRepository.findByPassengerId(passenger.getId());
    }

    @Transactional
    public void cancelBooking(Long bookingId, User passenger) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getPassenger().getId().equals(passenger.getId())) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        Ride ride = booking.getRide();
        String passengerName = passenger.getName();
        String driverEmail = ride.getDriver().getEmail();
        String driverName = ride.getDriver().getName();
        String origin = ride.getOrigin();
        String destination = ride.getDestination();
        String departureTime = ride.getDepartureTime().toString();

        bookingRepository.delete(booking);

        // Notify driver of cancellation
        try {
            emailService.sendBookingCancelledToDriver(
                driverEmail, driverName,
                passengerName, origin, destination, departureTime
            );
        } catch (Exception e) {
            System.err.println("Failed to send cancellation notification email: " + e.getMessage());
        }
    }

    public List<PassengerResponse> getPassengersForRide(Long rideId) {

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User currentUser = SecurityUtils.getCurrentUser();

        if (!ride.getDriver().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only driver can view passengers");
        }

        List<Booking> bookings = bookingRepository.findByRideId(rideId);

        return bookings.stream()
                .map(booking -> new PassengerResponse(
                booking.getPassenger().getId(),
                booking.getPassenger().getName(),
                booking.getPassenger().getContact(),
                booking.getBookingTime()))
                .collect(Collectors.toList());
    }

    // Called by RideService when driver cancels a ride — notifies all passengers
    @Transactional
    public void notifyPassengersOfRideCancellation(Ride ride) {
        List<Booking> bookings = bookingRepository.findByRideId(ride.getId());
        for (Booking booking : bookings) {
            try {
                emailService.sendRideCancelledToPassenger(
                    booking.getPassenger().getEmail(),
                    booking.getPassenger().getName(),
                    ride.getDriver().getName(),
                    ride.getOrigin(),
                    ride.getDestination(),
                    ride.getDepartureTime().toString()
                );
            } catch (Exception e) {
                System.err.println("Failed to notify passenger " +
                    booking.getPassenger().getEmail() + ": " + e.getMessage());
            }
        }
    }
}
