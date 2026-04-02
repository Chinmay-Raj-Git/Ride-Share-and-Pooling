package com.springapp.rideshare.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("RideShare Email Verification");
        message.setText("Your OTP is: " + otp + "\nValid for 10 minutes.");
        mailSender.send(message);
    }

    // ── Booking Created: notify driver ────────────────────────────────────────
    public void sendBookingCreatedToDriver(String driverEmail, String driverName,
            String passengerName, String origin, String destination,
            String departureTime, double price) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(driverEmail);
        message.setSubject("New Booking on Your Ride — RideShare");
        message.setText(
            "Hi " + driverName + ",\n\n" +
            passengerName + " has booked a seat on your ride.\n\n" +
            "Route    : " + origin + " → " + destination + "\n" +
            "Departure: " + departureTime + "\n" +
            "Fare     : ₹" + String.format("%.2f", price) + "\n\n" +
            "Check your RideShare profile to see all passengers.\n\n" +
            "— RideShare Team"
        );
        mailSender.send(message);
    }

    // ── Booking Cancelled by Passenger: notify driver ─────────────────────────
    public void sendBookingCancelledToDriver(String driverEmail, String driverName,
            String passengerName, String origin, String destination,
            String departureTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(driverEmail);
        message.setSubject("Booking Cancelled — RideShare");
        message.setText(
            "Hi " + driverName + ",\n\n" +
            passengerName + " has cancelled their booking on your ride.\n\n" +
            "Route    : " + origin + " → " + destination + "\n" +
            "Departure: " + departureTime + "\n\n" +
            "A seat is now free on this ride.\n\n" +
            "— RideShare Team"
        );
        mailSender.send(message);
    }

    // ── Ride Cancelled by Driver: notify a passenger ──────────────────────────
    public void sendRideCancelledToPassenger(String passengerEmail, String passengerName,
            String driverName, String origin, String destination,
            String departureTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(passengerEmail);
        message.setSubject("Your Ride Has Been Cancelled — RideShare");
        message.setText(
            "Hi " + passengerName + ",\n\n" +
            "Unfortunately, the driver " + driverName + " has cancelled the following ride:\n\n" +
            "Route    : " + origin + " → " + destination + "\n" +
            "Departure: " + departureTime + "\n\n" +
            "Please browse RideShare for an alternative ride.\n\n" +
            "— RideShare Team"
        );
        mailSender.send(message);
    }
}
