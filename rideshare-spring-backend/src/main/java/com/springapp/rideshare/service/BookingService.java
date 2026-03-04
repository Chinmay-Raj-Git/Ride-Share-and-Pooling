package com.springapp.rideshare.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springapp.rideshare.dto.PassengerResponse;
import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.repository.BookingRepository;
import com.springapp.rideshare.repository.RideRepository;
import com.springapp.rideshare.security.SecurityUtils;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Transactional
    public Booking bookRide(Long rideId, User passenger) {

        Ride ride = rideRepository.findRideForUpdateById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getDriver().getId().equals(passenger.getId())) {
            throw new RuntimeException("Driver cannot book own ride");
        }

        if (ride.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available");
        }

        if (bookingRepository.existsByRideIdAndPassengerId(rideId, passenger.getId())) {
            throw new RuntimeException("Already booked");
        }

        ride.setAvailableSeats(ride.getAvailableSeats() - 1);
        // rideRepository.save(ride); --> no longer needed, because this method has been
        // made @transactional

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setBookingTime(LocalDateTime.now());

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
