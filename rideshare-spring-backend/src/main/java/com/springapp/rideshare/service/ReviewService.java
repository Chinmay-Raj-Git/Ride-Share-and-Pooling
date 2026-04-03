package com.springapp.rideshare.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.springapp.rideshare.dto.ReviewRequest;
import com.springapp.rideshare.entity.Review;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.repository.BookingRepository;
import com.springapp.rideshare.repository.ReviewRepository;
import com.springapp.rideshare.repository.RideRepository;

import jakarta.transaction.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(ReviewRepository reviewRepository, RideRepository rideRepository,
            BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public Review submitReview(User reviewer, ReviewRequest req) {
        if (req.getRating() < 1 || req.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Ride ride = rideRepository.findById(req.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!"COMPLETED".equals(ride.getStatus())) {
            throw new RuntimeException("Can only review a completed ride");
        }

        // Passenger must have booked this ride
        boolean wasPassenger = bookingRepository.existsByRideIdAndPassengerId(
                ride.getId(), reviewer.getId());
        if (!wasPassenger) {
            throw new RuntimeException("You did not book this ride");
        }

        // Prevent duplicate review
        if (reviewRepository.existsByReviewerIdAndRideId(reviewer.getId(), ride.getId())) {
            throw new RuntimeException("You have already reviewed this ride");
        }

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setReviewedUser(ride.getDriver());
        review.setRide(ride);
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        review.setCreatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * Returns the review the given passenger submitted for a specific ride.
     * Returns empty Optional if they haven't reviewed yet.
     */
    public Optional<Review> getMyReviewForRide(Long reviewerId, Long rideId) {
        return reviewRepository.findByReviewerIdAndRideId(reviewerId, rideId);
    }

    /**
     * Returns all reviews submitted for a specific ride.
     * Used by the driver to see what each passenger said.
     */
    public List<Review> getReviewsForRide(Long rideId) {
        return reviewRepository.findByRideId(rideId);
    }

    public List<Review> getReviewsForUser(Long userId) {
        return reviewRepository.findByReviewedUserId(userId);
    }

    public Double getAverageRating(Long userId) {
        Double avg = reviewRepository.findAverageRatingByUserId(userId);
        return avg != null ? avg : 0.0;
    }

    public Long getReviewCount(Long userId) {
        return reviewRepository.countByReviewedUserId(userId);
    }
}
