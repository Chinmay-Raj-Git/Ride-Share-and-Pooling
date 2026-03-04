package com.springapp.rideshare.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springapp.rideshare.dto.RideRequest;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.entity.Vehicle;
import com.springapp.rideshare.repository.RideRepository;
import com.springapp.rideshare.repository.VehicleRepository;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;
    private final VehicleRepository vehicleRepository;

    public RideService(RideRepository rideRepository, VehicleRepository vehicleRepository) {
        this.rideRepository = rideRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public Ride createRide(Ride ride, User driver, RideRequest request) {

        ride.setDriver(driver);
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        ride.setVehicle(vehicle);

        return rideRepository.save(ride);
    }

    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    public List<Ride> searchRides(String origin, String destination) {
        return rideRepository.findByOriginAndDestination(origin, destination);
    }

    public List<Ride> getMyRides(User driver) {
        return rideRepository.findByDriverId(driver.getId());
    }
}
