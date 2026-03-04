package com.springapp.rideshare.dto;

import java.time.LocalDateTime;

public class PassengerResponse {

    private Long id;
    private String name;
    private String contact;
    private LocalDateTime bookingTime;

    public PassengerResponse(Long id, String name, String contact, LocalDateTime bookingTime) {
        this.id = id;
        this.name = name;
        this.contact = contact;
        this.bookingTime = bookingTime;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getContact() {
        return contact;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }
}