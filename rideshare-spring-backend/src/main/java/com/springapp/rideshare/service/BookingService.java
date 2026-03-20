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

    @Transactional
    public Booking bookRide(Long rideId, Long pickupStopId, Long dropStopId) {

        User user = SecurityUtils.getCurrentUser();

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        RouteStop pickup = routeStopRepository.findById(pickupStopId)
                .orElseThrow(() -> new RuntimeException("Pickup stop not found"));

        RouteStop drop = routeStopRepository.findById(dropStopId)
                .orElseThrow(() -> new RuntimeException("Drop stop not found"));

        if (ride.getDriver().getId().equals(user.getId())) {
            throw new RuntimeException("Driver cannot book own ride");
        }

        if (!pickup.getRide().getId().equals(rideId)
                || !drop.getRide().getId().equals(rideId)) {
            throw new RuntimeException("Stops do not belong to this ride");
        }

        if (pickup.getId().equals(drop.getId())) {
            throw new RuntimeException("Pickup and drop cannot be same");
        }

        if (pickup.getStopOrder() >= drop.getStopOrder()) {
            throw new RuntimeException("Invalid route selection");
        }

        boolean alreadyBooked = bookingRepository.existsByRideAndPassenger(ride, user);
        if (alreadyBooked) {
            throw new RuntimeException("You have already booked this ride");
        }

        if (ride.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available");
        }

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(user);
        booking.setPickupStop(pickup);
        booking.setDropStop(drop);

        // decrementing seat
        ride.setAvailableSeats(ride.getAvailableSeats() - 1);

        rideRepository.save(ride);

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

        Ride ride = booking.getRide();

        ride.setAvailableSeats(ride.getAvailableSeats() + 1);
        rideRepository.save(ride);

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
