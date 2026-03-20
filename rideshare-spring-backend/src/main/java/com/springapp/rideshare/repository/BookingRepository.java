package com.springapp.rideshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByRideIdAndPassengerId(Long rideId, Long passengerId);

    List<Booking> findByPassengerId(Long passengerId);

    List<Booking> findByRideId(Long rideId);

    boolean existsByRideAndPassenger(Ride ride, User passenger);
}
