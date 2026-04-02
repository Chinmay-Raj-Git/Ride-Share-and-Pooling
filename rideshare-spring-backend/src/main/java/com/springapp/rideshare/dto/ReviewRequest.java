package com.springapp.rideshare.dto;

public class ReviewRequest {
    private Long rideId;
    private int rating;   // 1–5
    private String comment;

    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
