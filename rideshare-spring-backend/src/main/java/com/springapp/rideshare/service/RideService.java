package com.springapp.rideshare.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.springapp.rideshare.dto.RideRequest;
import com.springapp.rideshare.dto.RideSearchResult;
import com.springapp.rideshare.dto.RouteStopRequest;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.RouteStop;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.entity.Vehicle;
import com.springapp.rideshare.repository.BookingRepository;
import com.springapp.rideshare.repository.RideRepository;
import com.springapp.rideshare.repository.RouteStopRepository;
import com.springapp.rideshare.repository.VehicleRepository;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteStopRepository routeStopRepository;
    private final DistanceService distanceService;
    private final GeocodingService geocodingService;
    private final BookingRepository bookingRepository;
    private final FareService fareService;

    public RideService(RideRepository rideRepository, VehicleRepository vehicleRepository,
            RouteStopRepository routeStopRepository, DistanceService distanceService,
            GeocodingService geocodingService, BookingRepository bookingRepository,
            FareService fareService) {
        this.rideRepository = rideRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeStopRepository = routeStopRepository;
        this.distanceService = distanceService;
        this.geocodingService = geocodingService;
        this.bookingRepository = bookingRepository;
        this.fareService = fareService;
    }

    public Ride createRide(Ride ride, User driver, RideRequest request) {

        List<RouteStopRequest> stopRequests = request.getStops();

        if (stopRequests == null || stopRequests.size() < 2) {
            throw new RuntimeException("At least source and destination stop required");
        }

        // Validate and set vehicle
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You can only use your own vehicle");
        }

        if (request.getAvailableSeats() > vehicle.getSeatCapacity()) {
            throw new RuntimeException("Available seats cannot exceed vehicle capacity");
        }

        ride.setDriver(driver);
        ride.setVehicle(vehicle);

        // Geocode all stops and build RouteStop list with cumulative distances
        double cumulativeKm = 0.0;
        double[] prevCoords = null;

        for (int i = 0; i < stopRequests.size(); i++) {
            String locationName = stopRequests.get(i).getLocationName();
            double[] coords = geocodingService.getCoordinates(locationName);

            if (prevCoords != null) {
                cumulativeKm += distanceService.getDistanceKm(
                        prevCoords[0], prevCoords[1],
                        coords[0], coords[1]);
            }

            RouteStop stop = new RouteStop();
            stop.setStopOrder(i);
            stop.setLocationName(locationName);
            stop.setLatitude(coords[0]);
            stop.setLongitude(coords[1]);
            stop.setCumulativeDistanceKm(cumulativeKm);

            ride.addRouteStop(stop);
            prevCoords = coords;
        }

        double totalDistanceKm = cumulativeKm;
        ride.setDistanceKm(totalDistanceKm);

        // Price is per-km rate applied to total distance; override any client-provided price
        double price = Math.ceil(totalDistanceKm * 8.0);
        ride.setPrice(price);

        return rideRepository.save(ride);
    }

    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    public List<RideSearchResult> searchRides(String source, String destination) {

        List<RouteStop> sourceStops = routeStopRepository.findByLocationNameIgnoreCase(source);
        List<RouteStop> destinationStops = routeStopRepository.findByLocationNameIgnoreCase(destination);

        Map<Long, List<RouteStop>> sourceMap = new HashMap<>();
        Map<Long, List<RouteStop>> destMap = new HashMap<>();

        for (RouteStop stop : sourceStops) {
            sourceMap.computeIfAbsent(stop.getRide().getId(), k -> new ArrayList<>()).add(stop);
        }
        for (RouteStop stop : destinationStops) {
            destMap.computeIfAbsent(stop.getRide().getId(), k -> new ArrayList<>()).add(stop);
        }

        List<RideSearchResult> result = new ArrayList<>();

        for (Long rideId : sourceMap.keySet()) {
            if (!destMap.containsKey(rideId)) {
                continue;
            }

            for (RouteStop src : sourceMap.get(rideId)) {
                for (RouteStop dst : destMap.get(rideId)) {
                    if (src.getStopOrder() < dst.getStopOrder()) {
                        Ride ride = src.getRide();
                        int overlapping = bookingRepository.countOverlappingBookings(
                                rideId, src.getStopOrder(), dst.getStopOrder());
                        int availableSeats = ride.getAvailableSeats() - overlapping;
                        double fare = fareService.calculateSegmentFare(ride, src, dst);
                        result.add(new RideSearchResult(ride, src, dst, availableSeats, fare));
                        break; // one result per ride
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
