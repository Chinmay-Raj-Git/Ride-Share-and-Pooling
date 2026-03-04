package com.springapp.rideshare.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class DistanceService {

    private final RestTemplate restTemplate = new RestTemplate();

    public double getDistanceKm(double originLat, double originLon,
            double destLat, double destLon) {

        String url = "https://router.project-osrm.org/route/v1/driving/"
                + originLon + "," + originLat + ";"
                + destLon + "," + destLat
                + "?overview=false";

        Map response = restTemplate.getForObject(url, Map.class);

        List routes = (List) response.get("routes");
        Map route = (Map) routes.get(0);

        double distanceMeters = (Double) route.get("distance");

        return distanceMeters / 1000.0;
    }
}