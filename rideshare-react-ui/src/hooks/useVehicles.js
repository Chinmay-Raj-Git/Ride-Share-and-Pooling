import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api";

/**
 * Fetches the authenticated user's registered vehicles.
 * Also exposes an `addVehicle` function that POSTs to /api/vehicles
 * and refreshes the list on success.
 *
 * @returns {{ vehicles, vehiclesLoading, addVehicle, adding, addError }}
 */
export function useVehicles() {
  const [vehicles, setVehicles]             = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [adding, setAdding]                 = useState(false);
  const [addError, setAddError]             = useState("");

  const load = useCallback(async () => {
    try {
      const res = await apiRequest("/api/vehicles/my");
      if (res.ok) setVehicles(await res.json());
      else console.error("Failed to load vehicles:", res.status);
    } catch (err) {
      console.error("Vehicles fetch error:", err);
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /**
   * Add a new vehicle.
   * @param {{ model: string, plateNumber: string, color: string, seatCapacity: number }} data
   * @returns {boolean} success
   */
  const addVehicle = async (data) => {
    setAdding(true);
    setAddError("");
    try {
      const res = await apiRequest("/api/vehicles", "POST", data);
      if (res.ok) {
        const newVehicle = await res.json();
        setVehicles((prev) => [...prev, newVehicle]);
        return true;
      } else {
        const text = await res.text();
        console.error("Add vehicle failed:", text);
        setAddError("Failed to add vehicle. Please try again.");
        return false;
      }
    } catch (err) {
      console.error("Add vehicle error:", err);
      setAddError("Something went wrong. Please try again.");
      return false;
    } finally {
      setAdding(false);
    }
  };

  return { vehicles, vehiclesLoading, addVehicle, adding, addError, setAddError };
}
