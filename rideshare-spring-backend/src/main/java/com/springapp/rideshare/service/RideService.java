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
import com.springapp.rideshare.repository.ReviewRepository;
import com.springapp.rideshare.repository.RideRepository;
import com.springapp.rideshare.repository.RouteStopRepository;
import com.springapp.rideshare.repository.VehicleRepository;

import jakarta.transaction.Transactional;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteStopRepository routeStopRepository;
    private final DistanceService distanceService;
    private final GeocodingService geocodingService;
    private final BookingRepository bookingRepository;
    private final FareService fareService;
    private final BookingService bookingService;
    private final ReviewRepository reviewRepository;

    public RideService(RideRepository rideRepository, VehicleRepository vehicleRepository,
            RouteStopRepository routeStopRepository, DistanceService distanceService,
            GeocodingService geocodingService, BookingRepository bookingRepository,
            FareService fareService, BookingService bookingService,
            ReviewRepository reviewRepository) {
        this.rideRepository = rideRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeStopRepository = routeStopRepository;
        this.distanceService = distanceService;
        this.geocodingService = geocodingService;
        this.bookingRepository = bookingRepository;
        this.fareService = fareService;
        this.bookingService = bookingService;
        this.reviewRepository = reviewRepository;
    }

    public Ride createRide(Ride ride, User driver, RideRequest request) {

        List<RouteStopRequest> stopRequests = request.getStops();

        if (stopRequests == null || stopRequests.size() < 2) {
            throw new RuntimeException("At least source and destination stop required");
        }

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

        // Build a driver-id → average-rating map in a single query to avoid N+1 calls
        Map<Long, Double> driverAvgRatingMap = buildDriverAverageRatingMap();

        List<RideSearchResult> result = new ArrayList<>();

        for (Long rideId : sourceMap.keySet()) {
            if (!destMap.containsKey(rideId)) continue;

            for (RouteStop src : sourceMap.get(rideId)) {
                for (RouteStop dst : destMap.get(rideId)) {
                    if (src.getStopOrder() < dst.getStopOrder()) {
                        Ride ride = src.getRide();
                        // Only show ACTIVE rides in search
                        if (!"ACTIVE".equals(ride.getStatus())) continue;
                        int overlapping = bookingRepository.countOverlappingBookings(
                                rideId, src.getStopOrder(), dst.getStopOrder());
                        int availableSeats = ride.getAvailableSeats() - overlapping;
                        double fare = fareService.calculateSegmentFare(ride, src, dst);
                        double avgRating = driverAvgRatingMap.getOrDefault(ride.getDriver().getId(), 0.0);
                        result.add(new RideSearchResult(ride, src, dst, availableSeats, fare, avgRating));
                        break;
                    }
                }
            }
        }

        return result;
    }

    /**
     * Fetches all driver average ratings in one query and returns a map of
     * driverId → averageRating. Avoids N+1 when building search results.
     */
    private Map<Long, Double> buildDriverAverageRatingMap() {
        List<Object[]> rows = reviewRepository.findAverageRatingGroupedByUser();
        Map<Long, Double> map = new HashMap<>();
        for (Object[] row : rows) {
            Long userId = (Long) row[0];
            Double avg  = (Double) row[1];
            if (userId != null && avg != null) {
                map.put(userId, avg);
            }
        }
        return map;
    }

    public List<Ride> getMyRides(User driver) {
        return rideRepository.findByDriverId(driver.getId());
    }

    // ── Task 3: Mark ride as completed (driver only) ──────────────────────────
    @Transactional
    public Ride completeRide(Long rideId, User driver) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("Only the driver can mark this ride as completed");
        }
        if (!"ACTIVE".equals(ride.getStatus())) {
            throw new RuntimeException("Only active rides can be marked as completed");
        }
        ride.setStatus("COMPLETED");
        return rideRepository.save(ride);
    }

    // ── Task 2: Cancel ride — notify all passengers ───────────────────────────
    @Transactional
    public void cancelRide(Long rideId, User driver) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("Only the driver can cancel this ride");
        }
        if (!"ACTIVE".equals(ride.getStatus())) {
            throw new RuntimeException("Only active rides can be cancelled");
        }
        ride.setStatus("CANCELLED");
        rideRepository.save(ride);
        bookingService.notifyPassengersOfRideCancellation(ride);
    }
}
