package com.springapp.rideshare.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.security.SecurityUtils;
import com.springapp.rideshare.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/{rideId}")
    public Booking bookRide(@PathVariable Long rideId) {

        User currentUser = SecurityUtils.getCurrentUser();

        return bookingService.bookRide(rideId, currentUser);
    }

    @GetMapping("/my")
    public List<Booking> getMyBookings() {

        User currentUser = SecurityUtils.getCurrentUser();

        return bookingService.getMyBookings(currentUser);
    }

    @DeleteMapping("/cancel/{bookingId}")
    public void cancelBooking(@PathVariable Long bookingId) {

        User currentUser = SecurityUtils.getCurrentUser();

        bookingService.cancelBooking(bookingId, currentUser);
    }
}
