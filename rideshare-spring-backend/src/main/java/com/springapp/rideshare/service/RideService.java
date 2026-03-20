package com.springapp.rideshare.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springapp.rideshare.dto.RideRequest;
import com.springapp.rideshare.dto.RouteStopRequest;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.RouteStop;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.entity.Vehicle;
import com.springapp.rideshare.repository.RideRepository;
import com.springapp.rideshare.repository.RouteStopRepository;
import com.springapp.rideshare.repository.VehicleRepository;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteStopRepository routeStopRepository;
    private final DistanceService distanceService;
    private final GeocodingService geocodingService;

    public RideService(RideRepository rideRepository, VehicleRepository vehicleRepository,
            RouteStopRepository routeStopRepository, DistanceService distanceService, GeocodingService geocodingService) {

        this.rideRepository = rideRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeStopRepository = routeStopRepository;
        this.distanceService = distanceService;
        this.geocodingService = geocodingService;
    }

    public Ride createRide(Ride ride, User driver, RideRequest request) {
        // if (request.getStops().size() < 2) {
        //     throw new RuntimeException("At least source and destination required");
        // }
        if (request.getStops() != null && !request.getStops().isEmpty()) {

            int order = 0;

            for (RouteStopRequest stopDTO : request.getStops()) {

                RouteStop stop = new RouteStop(
                        ride,
                        order++,
                        stopDTO.getLocationName(),
                        stopDTO.getLatitude(),
                        stopDTO.getLongitude()
                );

                ride.addRouteStop(stop);
            }
        } else if (request.getStops() == null || request.getStops().size() < 2) {
            throw new RuntimeException("At least source and destination required");
        }

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

    public List<Ride> searchRides(String source, String destination) {

        List<RouteStop> sourceStops = routeStopRepository.findByLocationNameIgnoreCase(source);

        List<RouteStop> destinationStops = routeStopRepository.findByLocationNameIgnoreCase(destination);

        Map<Long, List<RouteStop>> sourceMap = new HashMap<>();
        Map<Long, List<RouteStop>> destMap = new HashMap<>();

        // Group by ride
        for (RouteStop stop : sourceStops) {
            sourceMap.computeIfAbsent(stop.getRide().getId(), k -> new ArrayList<>())
                    .add(stop);
        }

        for (RouteStop stop : destinationStops) {
            destMap.computeIfAbsent(stop.getRide().getId(), k -> new ArrayList<>())
                    .add(stop);
        }

        List<Ride> result = new ArrayList<>();

        for (Long rideId : sourceMap.keySet()) {

            if (!destMap.containsKey(rideId)) {
                continue;
            }

            List<RouteStop> srcStops = sourceMap.get(rideId);
            List<RouteStop> dstStops = destMap.get(rideId);

            for (RouteStop src : srcStops) {
                for (RouteStop dst : dstStops) {

                    if (src.getStopOrder() < dst.getStopOrder()) {
                        result.add(src.getRide());
                        break;
                    }
                }
            }
        }

        return result;
    }

    public List<Ride> getMyRides(User driver) {
        return rideRepository.findByDriverId(driver.getId());
    }
}
