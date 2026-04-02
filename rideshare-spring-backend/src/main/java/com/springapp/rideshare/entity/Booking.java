package com.springapp.rideshare.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime bookingTime;

    @ManyToOne
    @JoinColumn(name = "ride_id")
    private Ride ride;

    @ManyToOne
    @JoinColumn(name = "passenger_id")
    private User passenger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_stop_id", nullable = false)
    private RouteStop pickupStop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_stop_id", nullable = false)
    private RouteStop dropStop;

    @Column(nullable = false)
    private Double price;

    private String razorpayOrderId;
    private String razorpayPaymentId;

    @Column(nullable = false)
    private String paymentStatus = "PENDING"; // PENDING, PAID

    public Booking() {
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public Ride getRide() {
        return ride;
    }

    public void setRide(Ride ride) {
        this.ride = ride;
    }

    public User getPassenger() {
        return passenger;
    }

    public void setPassenger(User passenger) {
        this.passenger = passenger;
    }

    public RouteStop getPickupStop() {
        return pickupStop;
    }

    public void setPickupStop(RouteStop pickupStop) {
        this.pickupStop = pickupStop;
    }

    public RouteStop getDropStop() {
        return dropStop;
    }

    public void setDropStop(RouteStop dropStop) {
        this.dropStop = dropStop;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

}
