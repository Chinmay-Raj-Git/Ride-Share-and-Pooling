package com.springapp.rideshare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByRideIdAndPassengerId(Long rideId, Long passengerId);

    List<Booking> findByPassengerId(Long passengerId);

    List<Booking> findByRideId(Long rideId);

    boolean existsByRideAndPassenger(Ride ride, User passenger);

    @Query("SELECT COUNT(b) FROM Booking b "
            + "WHERE b.ride.id = :rideId "
            + "AND b.pickupStop.stopOrder < :dropOrder "
            + "AND b.dropStop.stopOrder > :pickupOrder")
    int countOverlappingBookings(@Param("rideId") Long rideId,
            @Param("pickupOrder") int pickupOrder,
            @Param("dropOrder") int dropOrder);


    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);
}
