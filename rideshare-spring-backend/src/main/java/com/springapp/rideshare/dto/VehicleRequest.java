package com.springapp.rideshare.dto;

public class VehicleRequest {
    private String model;
    private String plateNumber;
    private String color;
    private int seatCapacity;

    public String getModel() {
        return model;
    }

    public String getPlateNumber() {
        return plateNumber;
    }

    public String getColor() {
        return color;
    }

    public int getSeatCapacity() {
        return seatCapacity;
    }
}
