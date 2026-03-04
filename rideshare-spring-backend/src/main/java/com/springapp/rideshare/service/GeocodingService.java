package com.springapp.rideshare.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();

    public double[] getCoordinates(String location) {

        String url = "https://nominatim.openstreetmap.org/search?q="
                + location + "&format=json&limit=1";

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "rideshare-app");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                List.class);

        List<Map<String, Object>> body = response.getBody();

        if (body == null || body.isEmpty()) {
            throw new RuntimeException("Location not found");
        }

        Map<String, Object> result = body.get(0);

        double lat = Double.parseDouble((String) result.get("lat"));
        double lon = Double.parseDouble((String) result.get("lon"));

        return new double[] { lat, lon };
    }
}