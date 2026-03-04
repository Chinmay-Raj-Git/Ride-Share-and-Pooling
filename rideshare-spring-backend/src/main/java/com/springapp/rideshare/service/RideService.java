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
    private final DistanceService distanceService;
    private final GeocodingService geocodingService;

    public RideService(RideRepository rideRepository, VehicleRepository vehicleRepository,
            DistanceService distanceService, GeocodingService geocodingService) {

        this.rideRepository = rideRepository;
        this.vehicleRepository = vehicleRepository;
        this.distanceService = distanceService;
        this.geocodingService = geocodingService;
    }

    public Ride createRide(Ride ride, User driver, RideRequest request) {

        double[] originCoords = geocodingService.getCoordinates(request.getOrigin());
        double[] destCoords = geocodingService.getCoordinates(request.getDestination());

        double distanceKm = distanceService.getDistanceKm(
                originCoords[0], originCoords[1],
                destCoords[0], destCoords[1]);

        double ratePerKm = 8.0;
        double price = distanceKm * ratePerKm;

        ride.setDistanceKm(distanceKm);
        ride.setPrice(Math.ceil(price));

        ride.setDriver(driver);
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You can only use your own vehicle");
        }

        if (request.getAvailableSeats() > vehicle.getSeatCapacity()) {
            throw new RuntimeException("Available seats cannot exceed vehicle capacity");
        }

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
