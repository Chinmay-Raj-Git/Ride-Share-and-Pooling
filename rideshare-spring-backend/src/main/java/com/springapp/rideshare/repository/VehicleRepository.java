package com.springapp.rideshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByDriver(User driver);

}