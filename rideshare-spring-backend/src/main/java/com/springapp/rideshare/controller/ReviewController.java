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

    // GET /api/reviews/user/{userId} — list all reviews for a user
    @GetMapping("/user/{userId}")
    public List<Review> getReviewsForUser(@PathVariable Long userId) {
        return reviewService.getReviewsForUser(userId);
    }

    // GET /api/reviews/user/{userId}/average — average rating for a user
    @GetMapping("/user/{userId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getAverageRating(userId));
    }
}
