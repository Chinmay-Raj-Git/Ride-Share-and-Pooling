import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function Dashboard() {

    const [rides, setRides] = useState([]);

    // useEffect(() => {
    //     loadRides();
    // }, []);

    const loadRides = async () => {
        try {
            const data = await apiRequest("/api/rides");
            const json = await data.json();
            console.log("Received rides:", json);
            setRides(json);
        } catch (err) {
            alert("Failed to load rides");
        }
    };

    const bookRide = async (rideId) => {
        await apiRequest(`/api/bookings/${rideId}`, "POST");
        loadRides();
    };

    return (
        <div>
            <h2>All Rides</h2>
            <button onClick={loadRides} className="bg-red-300">Load Rides</button>
            <ul>
                {rides.map(ride => (
                    <li key={ride.id} className="border p-2 m-2">
                        <div>From: {ride.origin}</div>
                        <div>To: {ride.destination}</div>
                        <div>Time: {ride.time}</div>
                        <div>Seats: {ride.availableSeats}</div>
                        <div>Price: {ride.price}</div>
                        <div className="text-red-500">Driver Details</div>
                        <div>
                            <div>Name: {ride.driver.name}</div>
                            <div>Contact: {ride.driver.contact}</div>
                        </div>
                        <button onClick={() => bookRide(ride.id)} className="bg-green-300">Book</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}