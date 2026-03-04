package com.springapp.rideshare.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.springapp.rideshare.dto.VehicleRequest;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.entity.Vehicle;
import com.springapp.rideshare.repository.VehicleRepository;
import com.springapp.rideshare.security.SecurityUtils;

@Service
public class VehicleService {

private final VehicleRepository vehicleRepository;

public VehicleService(VehicleRepository vehicleRepository) {
    this.vehicleRepository = vehicleRepository;
}

public Vehicle addVehicle(VehicleRequest request) {

    User driver = SecurityUtils.getCurrentUser();

    Vehicle vehicle = new Vehicle();
    vehicle.setModel(request.getModel());
    vehicle.setPlateNumber(request.getPlateNumber());
    vehicle.setColor(request.getColor());
    vehicle.setSeatCapacity(request.getSeatCapacity());
    vehicle.setDriver(driver);

    return vehicleRepository.save(vehicle);
}

public List<Vehicle> getMyVehicles() {

    User driver = SecurityUtils.getCurrentUser();
    return vehicleRepository.findByDriver(driver);

}

}