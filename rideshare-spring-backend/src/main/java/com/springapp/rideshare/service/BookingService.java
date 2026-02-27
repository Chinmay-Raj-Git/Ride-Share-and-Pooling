package com.springapp.rideshare.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.repository.BookingRepository;
import com.springapp.rideshare.repository.RideRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    public Booking bookRide(Long rideId, User passenger) {

        Ride ride = rideRepository.findById(rideId)
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
        rideRepository.save(ride);

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
}
