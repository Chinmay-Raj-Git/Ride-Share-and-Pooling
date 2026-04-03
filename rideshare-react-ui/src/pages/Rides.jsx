import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import { PageShell, AlertBanner } from "../components/ui";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { APP_STYLES } from "../styles";

// ─── Razorpay helper ──────────────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Data helpers (for all-rides retrieval) ───────────────────────────────────
function normalizeValue(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "name" in v) return v.name;
  return String(v);
}

function sanitizeRide(r) {
  return {
    ...r,
    origin: normalizeValue(r.origin),
    destination: normalizeValue(r.destination),
    driver: normalizeValue(r.driver.name),
    driver_id: normalizeValue(r.driver.id),
    car: normalizeValue(r.car),
    status: normalizeValue(r.status),
    tags: Array.isArray(r.tags) ? r.tags.map(normalizeValue) : [],
  };
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function StatusTag({ status }) {
  const map = {
    available: ["rgba(34,197,94,0.12)", "#86efac", "rgba(34,197,94,0.2)", "Available"],
    filling:   ["rgba(234,179,8,0.12)",  "#fde68a", "rgba(234,179,8,0.2)",  "Filling up"],
    full:      ["rgba(239,68,68,0.1)",   "#fca5a5", "rgba(239,68,68,0.2)",  "Full"],
  };
  const [bg, color, border, label] = map[status] || map.available;
  return (
    <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 6, padding: "0.2rem 0.55rem", fontSize: "0.7rem", fontWeight: 500 }}>
      {label}
    </span>
  );
}

function SeatDots({ seats, max = 7 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[...Array(max)].map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < seats ? "#e7e247" : "rgba(255,255,255,0.1)" }} />
      ))}
    </div>
  );
}

// ─── BookingModal (new — Razorpay + segment stops) ────────────────────────────
function BookingModal({ result, onClose, onBooked }) {
  const { ride, pickupStop, dropStop, availableSeats, segmentFare } = result;
  const stops = ride.routeStops || [];

  const [selectedPickup, setSelectedPickup] = useState(pickupStop?.id ?? "");
  const [selectedDrop, setSelectedDrop] = useState(dropStop?.id ?? "");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const orderedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
  const pickupIdx = orderedStops.findIndex((s) => s.id === Number(selectedPickup));
  const dropIdx   = orderedStops.findIndex((s) => s.id === Number(selectedDrop));

  const validate = () => {
    if (!selectedPickup || !selectedDrop) return "Please select both pickup and drop stops.";
    if (selectedPickup === selectedDrop) return "Pickup and drop cannot be the same stop.";
    if (pickupIdx >= dropIdx) return "Pickup must come before drop in the route.";
    return null;
  };

  const handleBook = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setBooking(true);

    try {
      const bookRes = await apiRequest(
        `/api/bookings/book/${ride.id}?pickupStopId=${selectedPickup}&dropStopId=${selectedDrop}`,
        "POST"
      );

      if (!bookRes.ok) {
        setError((await bookRes.text()) || "Booking failed. Please try again.");
        setBooking(false);
        return;
      }

      const bookingData = await bookRes.json();

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway. Please try again.");
        setBooking(false);
        return;
      }

      const orderRes = await apiRequest(`/api/payments/create-order?bookingId=${bookingData.id}`, "POST");
      if (!orderRes.ok) {
        setError("Failed to create payment order.");
        setBooking(false);
        return;
      }
      const order = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.id || order.orderId,
        name: "RideShare",
        description: `Booking RS-${String(bookingData.id).padStart(5, "0")}`,
        handler: async (response) => {
          try {
            const verifyRes = await apiRequest(
              `/api/payments/verify?razorpayOrderId=${response.razorpay_order_id}&razorpayPaymentId=${response.razorpay_payment_id}&razorpaySignature=${response.razorpay_signature}`,
              "POST"
            );
            if (verifyRes.ok) {
              setSuccess(true);
              if (onBooked) onBooked();
            } else {
              setError("Payment verification failed. Contact support.");
            }
          } catch {
            setError("Payment verification error.");
          }
        },
        prefill: {},
        theme: { color: "#e7e247" },
        modal: { ondismiss: () => setBooking(false) },
      };

      new window.Razorpay(options).open();
    } catch {
      setError("Something went wrong. Please try again.");
      setBooking(false);
    }
  };

  const [date, time] = (ride.departureTime || "").split("T");

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 40, height: 40, background: "rgba(231,226,71,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247" }}>
              {ride.driver?.name?.[0] || "D"}
            </div>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#f4f4f5", fontSize: "0.95rem" }}>
                {ride.driver?.name || "Driver"}
              </div>
              <div style={{ color: "#71717a", fontSize: "0.75rem" }}>
                🚗 {ride.vehicle?.model || "Vehicle"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#71717a", cursor: "pointer", borderRadius: 8, width: 30, height: 30, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>

        {/* Full route */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          <p style={{ color: "#52525b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.75rem 0" }}>Full Route</p>
          {orderedStops.map((stop, i) => (
            <div key={stop.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: 8, height: 8, flexShrink: 0,
                  background: i === 0 ? "#22c55e" : i === orderedStops.length - 1 ? "#e7e247" : "rgba(255,255,255,0.25)",
                  borderRadius: i === orderedStops.length - 1 ? 2 : "50%",
                }} />
                <span style={{ color: i === orderedStops.length - 1 ? "#f4f4f5" : "#a1a1aa", fontSize: "0.82rem", fontWeight: i === orderedStops.length - 1 ? 500 : 400 }}>
                  {stop.locationName}
                </span>
              </div>
              {i < orderedStops.length - 1 && (
                <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.08)", marginLeft: 3, margin: "0.2rem 0 0.2rem 3px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Info chips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
          {[
            ["🕐", "Departure", `${date}, ${time?.substring(0, 5)}`],
            ["💺", "Seats Available", `${availableSeats}`],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.6rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>{icon}</div>
              <div style={{ color: "#52525b", fontSize: "0.68rem", marginBottom: "0.15rem" }}>{label}</div>
              <div style={{ color: "#d4d4d8", fontSize: "0.8rem", fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Stop selectors + book */}
        {!success && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label>Pickup Stop</label>
                <select
                  className="input-field"
                  value={selectedPickup}
                  onChange={(e) => { setSelectedPickup(e.target.value); setError(""); }}
                >
                  <option value="">Select pickup…</option>
                  {orderedStops.map((s) => (
                    <option key={s.id} value={s.id}>{s.locationName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Drop Stop</label>
                <select
                  className="input-field"
                  value={selectedDrop}
                  onChange={(e) => { setSelectedDrop(e.target.value); setError(""); }}
                >
                  <option value="">Select drop…</option>
                  {orderedStops.map((s) => (
                    <option key={s.id} value={s.id}>{s.locationName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ background: "rgba(231,226,71,0.05)", border: "1px solid rgba(231,226,71,0.15)", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#71717a", fontSize: "0.82rem" }}>Segment Price</span>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#e7e247" }}>
                ₹{segmentFare?.toFixed(2) ?? "—"}
              </span>
            </div>

            {error && <AlertBanner message={error} type="err" />}

            <button
              className="glow-btn"
              onClick={handleBook}
              disabled={booking || availableSeats === 0}
              style={{ width: "100%", padding: "0.9rem", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: availableSeats === 0 ? 0.4 : 1, cursor: availableSeats === 0 ? "not-allowed" : "pointer" }}
            >
              {booking && <span style={{ width: 14, height: 14, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
              {availableSeats === 0 ? "No Seats Available" : booking ? "Processing…" : "Book & Pay →"}
            </button>
          </>
        )}

        {success && (
          <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12 }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>✅</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#86efac", fontSize: "0.95rem" }}>Booking Confirmed!</div>
            <div style={{ color: "#71717a", fontSize: "0.78rem", marginTop: "0.2rem" }}>Payment successful · Check your email</div>
            <button className="ghost-btn" style={{ marginTop: "1rem", padding: "0.5rem 1.25rem", fontSize: "0.82rem" }} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Unified Ride Card ────────────────────────────────────────────────────────
// Works for both search results and all-rides listing.
// `result` shape: { ride, pickupStop?, dropStop?, availableSeats, segmentFare }
//
// Route section:
//   • routeStops has entries → full stop list with optional pickup/drop highlights
//   • routeStops is empty   → simple origin → destination two-liner
//
// Driver/vehicle fields are normalised so the card handles both the search API
// (driver as object) and the all-rides API (driver already a string via sanitizeRide).
function RideCard({ result, onBook }) {
  const { ride, pickupStop, dropStop, availableSeats, segmentFare, averageRating } = result;

  const driverName    = typeof ride.driver === "object" ? (ride.driver?.name || "Driver") : (ride.driver || "Driver");
  const driverInitial = driverName[0] || "D";
  const vehicleLabel  = ride.vehicle?.model || ride.car || "";
  const driverSub     = vehicleLabel
    ? `🚗 ${vehicleLabel}`
    : `⭐ ${averageRating > 0 ? averageRating.toFixed(1) : "Unrated"}`;

  // averageRating: from search API (result.averageRating) or 0 if not present
  const ratingValue = averageRating ?? 0;

  const isFull        = availableSeats === 0 || ride.status === "full";
  const statusBg      = isFull ? "rgba(239,68,68,0.1)"  : ride.status === "filling" ? "rgba(234,179,8,0.12)" : "rgba(34,197,94,0.12)";
  const statusColor   = isFull ? "#fca5a5"               : ride.status === "filling" ? "#fde68a"              : "#86efac";
  const statusBorder  = isFull ? "rgba(239,68,68,0.2)"  : ride.status === "filling" ? "rgba(234,179,8,0.2)"  : "rgba(34,197,94,0.2)";
  const statusLabel   = isFull ? "Full"                  : ride.status === "filling" ? "Filling up"           : "Available";

  const stops         = Array.isArray(ride.routeStops) ? [...ride.routeStops].sort((a, b) => a.stopOrder - b.stopOrder) : [];
  const hasStops      = stops.length > 0;

  const originLabel   = ride.origin || stops[0]?.locationName || "";
  const destLabel     = ride.destination || stops[stops.length - 1]?.locationName || "";

  const [date]        = (ride.departureTime || "").split("T");
  const displayPrice  = segmentFare != null ? segmentFare.toFixed(0) : ride.price != null ? ride.price : "—";



  return (
    <div
      onClick={() => !isFull && onBook(result)}
      style={{
        background: "rgba(61,59,48,0.28)", border: "1px solid rgba(231,226,71,0.09)",
        backdropFilter: "blur(10px)", borderRadius: 16, padding: "1.25rem",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        cursor: isFull ? "default" : "pointer", opacity: isFull ? 0.65 : 1,
      }}
      onMouseEnter={(e) => { if (!isFull) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = "rgba(231,226,71,0.25)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(231,226,71,0.09)"; }}
    >
      {/* Driver row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 38, height: 38, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.9rem", flexShrink: 0 }}>
            {driverInitial}
          </div>
          <div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, color: "#f4f4f5", fontSize: "0.88rem" }}>{driverName}</div>
            <div style={{ color: "#71717a", fontSize: "0.72rem" }}>{driverSub}</div>
          </div>
        </div>
        <span style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, borderRadius: 6, padding: "0.2rem 0.55rem", fontSize: "0.7rem", fontWeight: 500 }}>
          {statusLabel}
        </span>
      </div>

      {/* Route section */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.75rem", marginBottom: "0.85rem" }}>
        {hasStops ? (
          stops.map((stop, i) => {
            const isPickup = stop.id === pickupStop?.id;
            const isDrop   = stop.id === dropStop?.id;
            const isHighlighted = isPickup || isDrop;
            return (
              <div key={stop.id}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: 7, height: 7, flexShrink: 0,
                    background: i === 0 ? "#22c55e" : i === stops.length - 1 ? "#e7e247" : "rgba(255,255,255,0.25)",
                    borderRadius: i === stops.length - 1 ? 2 : "50%",
                  }} />
                  <span style={{
                    fontSize: "0.8rem",
                    color: isHighlighted ? "#e7e247" : i === stops.length - 1 ? "#d4d4d8" : "#a1a1aa",
                    fontWeight: isHighlighted ? 600 : i === stops.length - 1 ? 500 : 400,
                  }}>
                    {stop.locationName}
                    {isPickup && <span style={{ color: "#52525b", fontWeight: 400, fontSize: "0.7rem" }}> (pickup)</span>}
                    {isDrop   && <span style={{ color: "#52525b", fontWeight: 400, fontSize: "0.7rem" }}> (drop)</span>}
                  </span>
                </div>
                {i < stops.length - 1 && (
                  <div style={{ width: 1, height: 8, background: "rgba(255,255,255,0.07)", marginLeft: 3, margin: "0.2rem 0 0.2rem 3px" }} />
                )}
              </div>
            );
          })
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.45rem" }}>
              <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", flexShrink: 0 }} />
              <span style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>{originLabel}</span>
            </div>
            <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.07)", marginLeft: 3, marginBottom: "0.45rem" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 7, height: 7, background: "#e7e247", borderRadius: 2, flexShrink: 0 }} />
              <span style={{ color: "#d4d4d8", fontSize: "0.82rem", fontWeight: 500 }}>{destLabel}</span>
            </div>
          </>
        )}
      </div>

      {/* Chips */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
          <span style={{ fontSize: "0.75rem" }}>🕐</span>
          <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{date}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
          <span style={{ fontSize: "0.75rem" }}>💺</span>
          <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{availableSeats} seat{availableSeats !== 1 ? "s" : ""} left</span>
        </div>
        {!hasStops && vehicleLabel && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
            <span style={{ fontSize: "0.75rem" }}>🚗</span>
            <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{vehicleLabel}</span>
          </div>
        )}
        {/* Average rating chip */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: ratingValue > 0 ? "rgba(231,226,71,0.07)" : "rgba(255,255,255,0.04)", border: ratingValue > 0 ? "1px solid rgba(231,226,71,0.18)" : "none", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
          <span style={{ fontSize: "0.75rem" }}>⭐</span>
          <span style={{ color: ratingValue > 0 ? "#e7e247" : "#52525b", fontSize: "0.75rem", fontWeight: ratingValue > 0 ? 600 : 400 }}>
            {ratingValue > 0 ? ratingValue.toFixed(1) : "Unrated"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 3 }}>
          {[...Array(Math.min(availableSeats, 7))].map((_, i) => (
            <div key={`f-${i}`} style={{ width: 8, height: 8, borderRadius: 2, background: "#e7e247" }} />
          ))}
          {[...Array(Math.max(0, 7 - availableSeats))].map((_, i) => (
            <div key={`e-${i}`} style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#e7e247" }}>₹{displayPrice}</span>
            <span style={{ color: "#52525b", fontSize: "0.7rem", marginLeft: "0.2rem" }}>/seat</span>
          </div>
          <button
            className="glow-btn"
            onClick={(e) => { e.stopPropagation(); onBook(result); }}
            disabled={isFull}
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.78rem", opacity: isFull ? 0.4 : 1, cursor: isFull ? "not-allowed" : "pointer" }}
          >
            {isFull ? "Full" : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AllRides BookingModal (old-style, no Razorpay) ───────────────────────────
// Wraps a sanitized flat ride into the shape BookingModal expects.
// If the ride has routeStops, it delegates to the full BookingModal.
// Otherwise falls back to the simple legacy booking.
function AllRideBookingModal({ ride, onClose, onBooked }) {
  const [booked, setBooked] = useState(false);

  // If the raw ride object carries routeStops, build a result shape and use full modal
  if (ride._raw?.routeStops?.length) {
    const raw = ride._raw;
    const stops = [...raw.routeStops].sort((a, b) => a.stopOrder - b.stopOrder);
    const result = {
      ride: raw,
      pickupStop: stops[0] ?? null,
      dropStop: stops[stops.length - 1] ?? null,
      availableSeats: raw.availableSeats ?? 0,
      segmentFare: raw.price ?? null,
      averageRating: ride.averageRating ?? 0,
    };
    return <BookingModal result={result} onClose={onClose} onBooked={onBooked} />;
  }

  const handleBook = async () => {
    try {
      const res = await apiRequest(`/api/bookings/${ride.id}`, "POST");
      if (res.ok) {
        setBooked(true);
        if (onBooked) onBooked(ride);
      } else {
        alert("Booking failed: " + (await res.text()));
      }
    } catch {
      alert("Booking failed");
    }
  };

  const handleClose = () => { setBooked(false); onClose(); };
  const [date, time] = (ride.departureTime || "").split("T");

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box">
        {/* Driver row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 40, height: 40, background: "rgba(231,226,71,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247" }}>
              {ride.driver?.[0] || "D"}
            </div>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#f4f4f5", fontSize: "0.95rem" }}>{ride.driver}</div>
              <div style={{ color: "#71717a", fontSize: "0.75rem" }}>⭐ {ride.rating || "Unrated"} · {ride.reviews || 0} reviews</div>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#71717a", cursor: "pointer", borderRadius: 8, width: 30, height: 30, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Route */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }} />
            <span style={{ color: "#71717a", fontSize: "0.8rem" }}>From</span>
            <span style={{ color: "#f4f4f5", fontSize: "0.9rem", fontWeight: 500 }}>{ride.origin}</span>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)", marginLeft: 3, marginBottom: "0.6rem" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "#e7e247", borderRadius: 2 }} />
            <span style={{ color: "#71717a", fontSize: "0.8rem" }}>To</span>
            <span style={{ color: "#f4f4f5", fontSize: "0.9rem", fontWeight: 500 }}>{ride.destination}</span>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
          {[
            ["🕐", "Departure", `${date}, ${time?.substring(0, 5)}`],
            ["💺", "Seats Left", `${ride.availableSeats} available`],
            ["🚗", "Vehicle", ride.vehicle?.model || ride.car || "—"],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.6rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>{icon}</div>
              <div style={{ color: "#52525b", fontSize: "0.68rem", marginBottom: "0.15rem" }}>{label}</div>
              <div style={{ color: "#d4d4d8", fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.3 }}>{val}</div>
            </div>
          ))}
        </div>

        {!booked ? (
          <button
            className="glow-btn"
            onClick={handleBook}
            disabled={ride.status === "full"}
            style={{ width: "100%", padding: "0.9rem", fontSize: "0.9rem", opacity: ride.status === "full" ? 0.4 : 1, cursor: ride.status === "full" ? "not-allowed" : "pointer" }}
          >
            {ride.status === "full" ? "Ride is Full" : "Book This Seat →"}
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12 }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>✅</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#86efac", fontSize: "0.95rem" }}>Seat Booked!</div>
            <div style={{ color: "#71717a", fontSize: "0.78rem", marginTop: "0.2rem" }}>Confirmation sent to your email</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RidesPage() {
  // ── All-rides state ──
  const [allRides, setAllRides] = useState([]);
  const [ridesLoading, setRidesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDest, setFilterDest] = useState("All");
  const [filterOrigin, setFilterOrigin] = useState("All");
  const [filterDate, setFilterDate] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("departure");
  const [view, setView] = useState("grid");
  const [selectedAllRide, setSelectedAllRide] = useState(null);

  // ── Search state ──
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  const { user } = useCurrentUser();
  const navigate = useNavigate();

  // ── Derived filter options ──
  const ALL_ORIGINS = useMemo(() => ["All", ...new Set(allRides.map((r) => r.origin))], [allRides]);
  const ALL_DESTS   = useMemo(() => ["All", ...new Set(allRides.map((r) => r.destination))], [allRides]);

  // ── Load all rides on mount ──
  const loadRides = async () => {
    try {
      const res = await apiRequest("/api/rides");
      if (res.ok) {
        const data = await res.json();
        console.log("Raw rides data:", data);
        setAllRides(data.map((r) => ({ ...sanitizeRide(r), _raw: r })));
      } else {
        console.error("Failed to fetch rides:", await res.text());
      }
    } catch (err) {
      console.error("Failed to load rides:", err);
    } finally {
      setRidesLoading(false);
    }
  };

  useEffect(() => { loadRides(); }, []);

  // ── Filtered / sorted all-rides ──
  const filtered = useMemo(() => {
    let r = allRides;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) =>
        x.origin.toLowerCase().includes(q) ||
        x.destination.toLowerCase().includes(q) ||
        x.driver.toLowerCase().includes(q)
      );
    }
    if (filterDest   !== "All") r = r.filter((x) => x.destination === filterDest);
    if (filterOrigin !== "All") r = r.filter((x) => x.origin === filterOrigin);
    if (filterDate   !== "All") r = r.filter((x) => x.date === filterDate);
    if (filterStatus !== "All") r = r.filter((x) => x.status === filterStatus);
    if (sortBy === "price")  r = [...r].sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    else if (sortBy === "seats")  r = [...r].sort((a, b) => b.availableSeats - a.availableSeats);
    return r;
  }, [allRides, search, filterDest, filterOrigin, filterDate, filterStatus, sortBy]);

  const hasActiveFilter = search || filterDest !== "All" || filterOrigin !== "All" || filterDate !== "All" || filterStatus !== "All";
  const clearFilters = () => { setSearch(""); setFilterDest("All"); setFilterOrigin("All"); setFilterDate("All"); setFilterStatus("All"); };

  const FILTER_CONFIGS = [
    ["Origin",      filterOrigin, setFilterOrigin, ALL_ORIGINS],
    ["Destination", filterDest,   setFilterDest,   ALL_DESTS],
    ["Date",        filterDate,   setFilterDate,   ["All", "Today", "Tomorrow"]],
    ["Status",      filterStatus, setFilterStatus,  ["All", "available", "filling", "full"]],
    ["Sort by",     sortBy,       setSortBy,
      [["departure", "Departure"], ["price", "Price: Low"], ["rating", "Top Rated"], ["seats", "Most Seats"]]],
  ];

  // ── Search handler ──
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setSearchError("Please enter both pickup and drop locations.");
      return;
    }
    setSearchError("");
    setSearchLoading(true);
    setSearched(false);
    setSearchResults([]);

    try {
      const res = await apiRequest(
        `/api/rides/search?origin=${encodeURIComponent(origin.trim())}&destination=${encodeURIComponent(destination.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        setSearchError("Search failed. Please try again.");
      }
    } catch {
      setSearchError("Something went wrong. Please try again.");
    } finally {
      setSearchLoading(false);
      setSearched(true);
    }
  };

  const handleSearchBooked = () => {
    setSelectedResult(null);
    if (origin && destination) handleSearch({ preventDefault: () => {} });
    loadRides();
  };

  const handleAllRideBooked = async () => {
    await loadRides();
    setSelectedAllRide(null);
  };

  const clearSearch = () => {
    setOrigin("");
    setDestination("");
    setSearchResults([]);
    setSearched(false);
    setSearchError("");
  };

  if (ridesLoading) return <div style={{ color: "white", padding: "3rem" }}>Loading rides…</div>;

  return (
    <PageShell>
      <style>{APP_STYLES}</style>
      <Navbar user={user} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ color: "#e7e247", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.3rem 0" }}>Browse Rides</p>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", margin: 0, lineHeight: 1.15 }}>Find Your Next Journey</h1>
            </div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {[["grid", "⊞"], ["list", "☰"]].map(([v, icon]) => (
                <button key={v} className={`ghost-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)} style={{ padding: "0.5rem 0.75rem", fontSize: "1rem" }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {[
              ["🟢", `${allRides.filter((r) => r.status !== "full").length} rides available`],
              ["🚗", `${allRides.length} total rides`],
              ["📍", "60+ cities"],
            ].map(([icon, txt]) => (
              <div key={txt} style={{ background: "rgba(61,59,48,0.4)", border: "1px solid rgba(231,226,71,0.08)", borderRadius: 10, padding: "0.5rem 0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{icon}</span>
                <span style={{ color: "#71717a", fontSize: "0.75rem" }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Smart Search (new API) ── */}
        <div className="card-dark" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#52525b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.75rem 0" }}>
            🔍 Search by Route
          </p>
          <form onSubmit={handleSearch}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: "0.75rem", alignItems: "end" }}>
              <div>
                <label>Pickup Location</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem" }}>🟢</span>
                  <input
                    className="input-field"
                    style={{ paddingLeft: "2.4rem" }}
                    placeholder="e.g. Hitech City"
                    value={origin}
                    onChange={(e) => { setOrigin(e.target.value); setSearchError(""); }}
                  />
                </div>
              </div>
              <div>
                <label>Drop Location</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem" }}>📍</span>
                  <input
                    className="input-field"
                    style={{ paddingLeft: "2.4rem" }}
                    placeholder="e.g. Airport"
                    value={destination}
                    onChange={(e) => { setDestination(e.target.value); setSearchError(""); }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="glow-btn"
                disabled={searchLoading}
                style={{ padding: "0.82rem 1.5rem", fontSize: "0.88rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {searchLoading && <span style={{ width: 13, height: 13, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
                {searchLoading ? "Searching…" : "🔍 Search"}
              </button>
              {searched && (
                <button type="button" className="ghost-btn" onClick={clearSearch} style={{ padding: "0.82rem 1rem", whiteSpace: "nowrap" }}>
                  ✕ Clear
                </button>
              )}
            </div>
            {searchError && <p className="field-error" style={{ marginTop: "0.5rem" }}>{searchError}</p>}
          </form>
        </div>

        {/* ── Search Results Section ── */}
        {searched && (
          <div style={{ marginBottom: "2.5rem" }}>
            <p style={{ color: "#52525b", fontSize: "0.82rem", margin: "0 0 1rem 0" }}>
              {searchResults.length === 0
                ? "No rides found for this route."
                : <>Showing <span style={{ color: "#e7e247", fontWeight: 600 }}>{searchResults.length}</span> ride{searchResults.length !== 1 ? "s" : ""} from <strong style={{ color: "#a1a1aa" }}>{origin}</strong> to <strong style={{ color: "#a1a1aa" }}>{destination}</strong></>
              }
            </p>

            {searchResults.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 2rem", color: "#52525b", background: "rgba(61,59,48,0.18)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#71717a", marginBottom: "0.4rem" }}>No rides found for this route</div>
                <div style={{ fontSize: "0.85rem" }}>Try different locations or browse all rides below</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(340px, 1fr))" : "1fr", gap: "1rem" }}>
                {searchResults.map((result, i) => (
                  <RideCard key={`${result.ride.id}-${i}`} result={result} onBook={setSelectedResult} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Divider when search results are shown ── */}
        {searched && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ color: "#52525b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>All Available Rides</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>
        )}

        {/* ── All Rides: Filters ──
        <div className="card-dark" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.9rem" }}>🔍</span>
              <input
                className="input-field"
                style={{ paddingLeft: "2.25rem" }}
                placeholder="Filter by origin, destination or driver…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {hasActiveFilter && (
              <button className="ghost-btn" style={{ padding: "0.7rem 1rem", whiteSpace: "nowrap" }} onClick={clearFilters}>
                ✕ Clear
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {FILTER_CONFIGS.map(([label, val, setter, opts]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <span style={{ color: "#52525b", fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.2rem" }}>{label}</span>
                <select className="input-field" value={val} onChange={(e) => setter(e.target.value)} style={{ paddingRight: "2rem", cursor: "pointer", minWidth: 120 }}>
                  {opts.map((o) =>
                    Array.isArray(o)
                      ? <option key={o[0]} value={o[0]}>{o[1]}</option>
                      : <option key={o} value={o}>{o}</option>
                  )}
                </select>
              </div>
            ))}
          </div>
        </div> */}

        <p style={{ color: "#52525b", fontSize: "0.82rem", margin: "0 0 1rem 0" }}>
          Showing <span style={{ color: "#e7e247", fontWeight: 600 }}>{filtered.length}</span> rides
        </p>

        {/* ── All Rides Grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#52525b" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚗</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#71717a", marginBottom: "0.4rem" }}>No rides found</div>
            <div style={{ fontSize: "0.85rem" }}>Try adjusting your filters or search query</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr", gap: "1rem" }}>
            {filtered.map((ride) => {
              const result = {
                ride: ride._raw || ride,
                pickupStop: null,
                dropStop: null,
                availableSeats: ride.availableSeats ?? 0,
                segmentFare: ride.price != null ? ride.price : null,
              };
              return (
                <RideCard key={ride.id} result={result} onBook={() => setSelectedAllRide(ride)} />
              );
            })}
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "#52525b", fontSize: "0.85rem", marginBottom: "1rem" }}>Going somewhere? Share your ride and earn back fuel costs.</p>
          <button className="glow-btn" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem" }} onClick={() => navigate("/post-ride")}>
            🚗 Post a Ride
          </button>
        </div>
      </div>

      {/* ── Search result booking modal (new — Razorpay) ── */}
      {selectedResult && (
        <BookingModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          onBooked={handleSearchBooked}
        />
      )}

      {/* ── All-rides booking modal (old style, with routeStops fallback) ── */}
      {selectedAllRide && (
        <AllRideBookingModal
          ride={selectedAllRide}
          onClose={() => setSelectedAllRide(null)}
          onBooked={handleAllRideBooked}
        />
      )}
    </PageShell>
  );
}