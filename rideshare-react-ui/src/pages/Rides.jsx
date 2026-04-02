import { useState } from "react";
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

// ─── BookingModal ─────────────────────────────────────────────────────────────
function BookingModal({ result, onClose, onBooked }) {
  const { ride, pickupStop, dropStop, availableSeats, segmentFare } = result;
  const stops = ride.routeStops || [];

  // Default pickup/drop from search result
  const [selectedPickup, setSelectedPickup] = useState(pickupStop?.id ?? "");
  const [selectedDrop, setSelectedDrop] = useState(dropStop?.id ?? "");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Derived: ordered stops
  const orderedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);

  const pickupIdx = orderedStops.findIndex((s) => s.id === Number(selectedPickup));
  const dropIdx = orderedStops.findIndex((s) => s.id === Number(selectedDrop));

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
      // Step 1: Book the ride
      const bookRes = await apiRequest(
        `/api/bookings/book/${ride.id}?pickupStopId=${selectedPickup}&dropStopId=${selectedDrop}`,
        "POST"
      );

      if (!bookRes.ok) {
        const msg = await bookRes.text();
        setError(msg || "Booking failed. Please try again.");
        setBooking(false);
        return;
      }

      const bookingData = await bookRes.json();

      // Step 2: Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway. Please try again.");
        setBooking(false);
        return;
      }

      // Step 3: Create Razorpay order
      const orderRes = await apiRequest(`/api/payments/create-order?bookingId=${bookingData.id}`, "POST");
      console.log("Order res: "+orderRes)
      if (!orderRes.ok) {
        setError("Failed to create payment order.");
        setBooking(false);
        return;
      }
      const order = await orderRes.json();

      // Step 4: Open Razorpay checkout
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
        modal: {
          ondismiss: () => setBooking(false),
        },
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

        {/* Stop selectors */}
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

            {/* Price */}
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

// ─── Ride Search Result Card ──────────────────────────────────────────────────
function RideCard({ result, onBook }) {
  const { ride, pickupStop, dropStop, availableSeats, segmentFare } = result;
  const stops = ride.routeStops || [];
  const orderedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
  const [date] = (ride.departureTime || "").split("T");
  const isFull = availableSeats === 0;

  return (
    <div
      style={{
        background: "rgba(61,59,48,0.28)", border: "1px solid rgba(231,226,71,0.09)",
        backdropFilter: "blur(10px)", borderRadius: 16, padding: "1.25rem",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        opacity: isFull ? 0.65 : 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = "rgba(231,226,71,0.25)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(231,226,71,0.09)"; }}
    >
      {/* Driver row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 38, height: 38, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.9rem", flexShrink: 0 }}>
            {ride.driver?.name?.[0] || "D"}
          </div>
          <div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, color: "#f4f4f5", fontSize: "0.88rem" }}>
              {ride.driver?.name || "Driver"}
            </div>
            <div style={{ color: "#71717a", fontSize: "0.72rem" }}>
              🚗 {ride.vehicle?.model || "Vehicle"}
            </div>
          </div>
        </div>
        <span style={{
          background: isFull ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.12)",
          color: isFull ? "#fca5a5" : "#86efac",
          border: `1px solid ${isFull ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
          borderRadius: 6, padding: "0.2rem 0.55rem", fontSize: "0.7rem", fontWeight: 500,
        }}>
          {isFull ? "Full" : "Available"}
        </span>
      </div>

      {/* Route — show all stops */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.75rem", marginBottom: "0.85rem" }}>
        {orderedStops.map((stop, i) => (
          <div key={stop.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: 7, height: 7, flexShrink: 0,
                background: i === 0 ? "#22c55e" : i === orderedStops.length - 1 ? "#e7e247" : "rgba(255,255,255,0.25)",
                borderRadius: i === orderedStops.length - 1 ? 2 : "50%",
              }} />
              <span style={{
                color: i === orderedStops.length - 1 ? "#d4d4d8" : "#a1a1aa",
                fontSize: "0.8rem", fontWeight: i === orderedStops.length - 1 ? 500 : 400,
                // Highlight the matched pickup/drop
                ...(stop.id === pickupStop?.id || stop.id === dropStop?.id
                  ? { color: "#e7e247", fontWeight: 600 }
                  : {}),
              }}>
                {stop.locationName}
                {stop.id === pickupStop?.id && <span style={{ color: "#52525b", fontWeight: 400, fontSize: "0.7rem" }}> (your pickup)</span>}
                {stop.id === dropStop?.id && <span style={{ color: "#52525b", fontWeight: 400, fontSize: "0.7rem" }}> (your drop)</span>}
              </span>
            </div>
            {i < orderedStops.length - 1 && (
              <div style={{ width: 1, height: 8, background: "rgba(255,255,255,0.07)", marginLeft: 3, margin: "0.2rem 0 0.2rem 3px" }} />
            )}
          </div>
        ))}
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
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 3 }}>
          {[...Array(Math.min(availableSeats, 7))].map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: "#e7e247" }} />
          ))}
          {[...Array(Math.max(0, 7 - availableSeats))].map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#e7e247" }}>
              ₹{segmentFare?.toFixed(0) ?? "—"}
            </span>
            <span style={{ color: "#52525b", fontSize: "0.7rem", marginLeft: "0.2rem" }}>/seat</span>
          </div>
          <button
            className="glow-btn"
            onClick={() => onBook(result)}
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RidesPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setSearchError("Please enter both pickup and drop locations.");
      return;
    }
    setSearchError("");
    setLoading(true);
    setSearched(false);
    setResults([]);

    try {
      const res = await apiRequest(
        `/api/rides/search?origin=${encodeURIComponent(origin.trim())}&destination=${encodeURIComponent(destination.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setSearchError("Search failed. Please try again.");
      }
    } catch {
      setSearchError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleBooked = () => {
    setSelectedResult(null);
    // Re-run search to refresh seat counts
    if (origin && destination) handleSearch({ preventDefault: () => {} });
  };

  return (
    <PageShell>
      <style>{APP_STYLES}</style>
      <Navbar user={user} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: "#e7e247", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.3rem 0" }}>
            Browse Rides
          </p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", margin: 0, lineHeight: 1.15 }}>
            Find Your Next Journey
          </h1>
        </div>

        {/* Search form */}
        <div className="card-dark" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
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
                disabled={loading}
                style={{ padding: "0.82rem 1.5rem", fontSize: "0.88rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {loading && <span style={{ width: 13, height: 13, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
                {loading ? "Searching…" : "🔍 Search"}
              </button>
            </div>
            {searchError && <p className="field-error" style={{ marginTop: "0.5rem" }}>{searchError}</p>}
          </form>
        </div>

        {/* Results */}
        {searched && (
          <p style={{ color: "#52525b", fontSize: "0.82rem", margin: "0 0 1rem 0" }}>
            {results.length === 0
              ? "No rides found for this route."
              : <>Showing <span style={{ color: "#e7e247", fontWeight: 600 }}>{results.length}</span> ride{results.length !== 1 ? "s" : ""} from <strong style={{ color: "#a1a1aa" }}>{origin}</strong> to <strong style={{ color: "#a1a1aa" }}>{destination}</strong></>
            }
          </p>
        )}

        {searched && results.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#52525b" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚗</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#71717a", marginBottom: "0.4rem" }}>No rides found</div>
            <div style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>Try different locations or check back later</div>
            <button className="glow-btn" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem" }} onClick={() => navigate("/post-ride")}>
              🚗 Post a Ride
            </button>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
            {results.map((result, i) => (
              <RideCard key={`${result.ride.id}-${i}`} result={result} onBook={setSelectedResult} />
            ))}
          </div>
        )}

        {/* CTA if not searched yet */}
        {!searched && (
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <p style={{ color: "#52525b", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Going somewhere? Share your ride and earn back fuel costs.
            </p>
            <button className="glow-btn" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem" }} onClick={() => navigate("/post-ride")}>
              🚗 Post a Ride
            </button>
          </div>
        )}
      </div>

      {selectedResult && (
        <BookingModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          onBooked={handleBooked}
        />
      )}
    </PageShell>
  );
}
