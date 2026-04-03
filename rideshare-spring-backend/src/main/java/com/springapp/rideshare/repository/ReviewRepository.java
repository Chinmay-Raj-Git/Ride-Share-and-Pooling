package com.springapp.rideshare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.springapp.rideshare.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewedUserId(Long userId);

    boolean existsByReviewerIdAndRideId(Long reviewerId, Long rideId);

    Optional<Review> findByReviewerIdAndRideId(Long reviewerId, Long rideId);

    // All reviews for a specific ride (used by driver to see passenger feedback)
    List<Review> findByRideId(Long rideId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewedUser.id = :userId")
    Double findAverageRatingByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewedUser.id = :userId")
    Long countByReviewedUserId(@Param("userId") Long userId);

    // Average rating per driver across all rides (used by admin panel)
    @Query("SELECT r.reviewedUser.id, AVG(r.rating), COUNT(r) FROM Review r GROUP BY r.reviewedUser.id")
    List<Object[]> findAverageRatingGroupedByUser();
}
