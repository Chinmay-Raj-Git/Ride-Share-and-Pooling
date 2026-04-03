package com.springapp.rideshare.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.dto.ReviewRequest;
import com.springapp.rideshare.entity.Review;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.security.SecurityUtils;
import com.springapp.rideshare.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // POST /api/reviews  — passenger submits a review for the driver
    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody ReviewRequest req) {
        try {
            User currentUser = SecurityUtils.getCurrentUser();
            Review review = reviewService.submitReview(currentUser, req);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/reviews/user/{userId} — list all reviews for a user (as driver)
    @GetMapping("/user/{userId}")
    public List<Review> getReviewsForUser(@PathVariable Long userId) {
        return reviewService.getReviewsForUser(userId);
    }

    // GET /api/reviews/user/{userId}/average — average rating for a user as driver
    @GetMapping("/user/{userId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getAverageRating(userId));
    }

    /**
     * GET /api/reviews/my/{rideId}
     * Returns the current user's own review for a given ride.
     * 404 if not yet reviewed — frontend uses this to decide whether to show
     * the review form or the submitted review display.
     */
    @GetMapping("/my/{rideId}")
    public ResponseEntity<?> getMyReviewForRide(@PathVariable Long rideId) {
        try {
            User currentUser = SecurityUtils.getCurrentUser();
            return reviewService.getMyReviewForRide(currentUser.getId(), rideId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/reviews/ride/{rideId}
     * Returns all reviews for a specific ride.
     * Used by the driver to see what each passenger rated/commented.
     */
    @GetMapping("/ride/{rideId}")
    public ResponseEntity<?> getReviewsForRide(@PathVariable Long rideId) {
        try {
            List<Review> reviews = reviewService.getReviewsForRide(rideId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
