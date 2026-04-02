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

        // ride.setAvailableSeats(ride.getAvailableSeats() - 1);
        // rideRepository.save(ride); seat availability is checked via overlapping bookings, so we don't need to update it here
        return bookingRepository.save(booking);
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

        bookingRepository.delete(booking);
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
}
