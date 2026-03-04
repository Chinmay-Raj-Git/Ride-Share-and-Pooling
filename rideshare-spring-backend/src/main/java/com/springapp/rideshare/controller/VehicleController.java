package com.springapp.rideshare.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.dto.VehicleRequest;
import com.springapp.rideshare.entity.Vehicle;
import com.springapp.rideshare.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public Vehicle addVehicle(@RequestBody VehicleRequest request) {
        return vehicleService.addVehicle(request);
    }

    @GetMapping("/my")
    public List<Vehicle> getMyVehicles() {
        return vehicleService.getMyVehicles();
    }

}