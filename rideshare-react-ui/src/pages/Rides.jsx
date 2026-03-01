import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import { PageShell, AlertBanner } from "../components/ui";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { APP_STYLES } from "../styles";

// ─── Data helpers ─────────────────────────────────────────────────────────────
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

// ─── Sub-components ───────────────────────────────────────────────────────────
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

function SeatDots({ seats, max = 4 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[...Array(max)].map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < seats ? "#e7e247" : "rgba(255,255,255,0.1)" }} />
      ))}
    </div>
  );
}

function RideModal({ ride, onClose, onBooked }) {
  const [booked, setBooked] = useState(false);
  if (!ride) return null;

  const handleBook = async () => {
    try {
      const res = await apiRequest(`/api/bookings/${ride.id}`, "POST");
      if (res.ok) {
        setBooked(true);
        if (onBooked) onBooked(ride);
      } else {
        alert("Booking failed: " + (await res.text()));
      }
    } catch (err) {
      alert("Booking failed");
    }
  };

  const handleClose = () => { setBooked(false); onClose(); };

  const [date, time] = ride.departureTime.split("T");

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
            ["🕐", "Departure", `${date}, ${time.substring(0, 5)}`],
            ["💺", "Seats Left", `${ride.availableSeats} available`],
            ["🚗", "Vehicle", ride.car || "—"],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.6rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>{icon}</div>
              <div style={{ color: "#52525b", fontSize: "0.68rem", marginBottom: "0.15rem" }}>{label}</div>
              <div style={{ color: "#d4d4d8", fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.3 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Book button / success state */}
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
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDest, setFilterDest] = useState("All");
  const [filterOrigin, setFilterOrigin] = useState("All");
  const [filterDate, setFilterDate] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("departure");
  const [selectedRide, setSelectedRide] = useState(null);
  const [view, setView] = useState("grid");

  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const ALL_ORIGINS = useMemo(() => ["All", ...new Set(rides.map((r) => r.origin))], [rides]);
  const ALL_DESTS   = useMemo(() => ["All", ...new Set(rides.map((r) => r.destination))], [rides]);

  const loadRides = async () => {
    try {
      const res = await apiRequest("/api/rides");
      if (res.ok) setRides((await res.json()).map(sanitizeRide));
      else console.error("Failed to fetch rides:", await res.text());
    } catch (err) {
      console.error("Failed to load rides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRides(); }, []);

  const filtered = useMemo(() => {
    let r = rides;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.origin.toLowerCase().includes(q) || x.destination.toLowerCase().includes(q) || x.driver.toLowerCase().includes(q));
    }
    if (filterDest !== "All") r = r.filter((x) => x.destination === filterDest);
    if (filterOrigin !== "All") r = r.filter((x) => x.origin === filterOrigin);
    if (filterDate !== "All") r = r.filter((x) => x.date === filterDate);
    if (filterStatus !== "All") r = r.filter((x) => x.status === filterStatus);
    if (sortBy === "price") r = [...r].sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    else if (sortBy === "seats") r = [...r].sort((a, b) => b.seats - a.seats);
    return r;
  }, [rides, search, filterDest, filterOrigin, filterDate, filterStatus, sortBy]);

  const handleRideBooked = async () => { await loadRides(); setSelectedRide(null); };
  const clearFilters = () => { setSearch(""); setFilterDest("All"); setFilterOrigin("All"); setFilterDate("All"); setFilterStatus("All"); };
  const hasActiveFilter = search || filterDest !== "All" || filterOrigin !== "All" || filterDate !== "All" || filterStatus !== "All";

  const FILTER_CONFIGS = [
    ["Origin",      filterOrigin, setFilterOrigin, ALL_ORIGINS],
    ["Destination", filterDest,   setFilterDest,   ALL_DESTS],
    ["Date",        filterDate,   setFilterDate,   ["All", "Today", "Tomorrow"]],
    ["Status",      filterStatus, setFilterStatus,  ["All", "available", "filling", "full"]],
    ["Sort by",     sortBy,       setSortBy,
      [["departure", "Departure"], ["price", "Price: Low"], ["rating", "Top Rated"], ["seats", "Most Seats"]]],
  ];

  if (loading) return <div style={{ color: "white", padding: "3rem" }}>Loading rides…</div>;

  return (
    <PageShell>
      <style>{APP_STYLES}</style>
      <Navbar user={user} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
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
              ["🟢", `${rides.filter((r) => r.status !== "full").length} rides available`],
              ["🚗", `${rides.length} total rides`],
              ["📍", "60+ cities"],
            ].map(([icon, txt]) => (
              <div key={txt} style={{ background: "rgba(61,59,48,0.4)", border: "1px solid rgba(231,226,71,0.08)", borderRadius: 10, padding: "0.5rem 0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{icon}</span>
                <span style={{ color: "#71717a", fontSize: "0.75rem" }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="card-dark" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.9rem" }}>🔍</span>
              <input
                className="input-field"
                style={{ paddingLeft: "2.25rem" }}
                placeholder="Search by origin, destination or driver…"
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
        </div>

        <p style={{ color: "#52525b", fontSize: "0.82rem", margin: "0 0 1rem 0" }}>
          Showing <span style={{ color: "#e7e247", fontWeight: 600 }}>{filtered.length}</span> rides
        </p>

        {/* Rides grid/list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#52525b" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚗</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#71717a", marginBottom: "0.4rem" }}>No rides found</div>
            <div style={{ fontSize: "0.85rem" }}>Try adjusting your filters or search query</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr", gap: "1rem" }}>
            {filtered.map((ride) => (
              <div
                key={ride.id}
                onClick={() => setSelectedRide(ride)}
                style={{
                  background: "rgba(61,59,48,0.28)", border: "1px solid rgba(231,226,71,0.09)", backdropFilter: "blur(10px)", borderRadius: 16,
                  transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                  cursor: "pointer", padding: "1.25rem", opacity: ride.status === "full" ? 0.65 : 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = "rgba(231,226,71,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(231,226,71,0.09)"; }}
              >
                {/* Driver row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 38, height: 38, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.9rem", flexShrink: 0 }}>
                      {ride.driver?.[0] || "D"}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, color: "#f4f4f5", fontSize: "0.88rem" }}>{ride.driver}</div>
                      <div style={{ color: "#71717a", fontSize: "0.72rem" }}>⭐ {ride.rating || "Unrated"} · {ride.reviews || 0} trips</div>
                    </div>
                  </div>
                  <StatusTag status={ride.status} />
                </div>

                {/* Route */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.75rem", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.45rem" }}>
                    <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", flexShrink: 0 }} />
                    <span style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>{ride.origin}</span>
                  </div>
                  <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.07)", marginLeft: 3, marginBottom: "0.45rem" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 7, height: 7, background: "#e7e247", borderRadius: 2, flexShrink: 0 }} />
                    <span style={{ color: "#d4d4d8", fontSize: "0.82rem", fontWeight: 500 }}>{ride.destination}</span>
                  </div>
                </div>

                {/* Chips */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
                    <span style={{ fontSize: "0.75rem" }}>🕐</span>
                    <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{ride.departureTime.split("T")[0]}</span>
                  </div>
                  {ride.car && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
                      <span style={{ fontSize: "0.75rem" }}>🚗</span>
                      <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{ride.car}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <SeatDots seats={ride.availableSeats} />
                    <span style={{ color: "#71717a", fontSize: "0.72rem" }}>{ride.availableSeats} seat{ride.availableSeats !== 1 ? "s" : ""} left</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#e7e247" }}>₹{ride.price}</span>
                      <span style={{ color: "#52525b", fontSize: "0.7rem", marginLeft: "0.2rem" }}>/seat</span>
                    </div>
                    <button
                      className="glow-btn"
                      onClick={(e) => { e.stopPropagation(); setSelectedRide(ride); }}
                      disabled={ride.status === "full"}
                      style={{ padding: "0.45rem 0.9rem", fontSize: "0.78rem", opacity: ride.status === "full" ? 0.4 : 1, cursor: ride.status === "full" ? "not-allowed" : "pointer" }}
                    >
                      {ride.status === "full" ? "Full" : "Book"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "#52525b", fontSize: "0.85rem", marginBottom: "1rem" }}>Going somewhere? Share your ride and earn back fuel costs.</p>
          <button className="glow-btn" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem" }} onClick={() => navigate("/post-ride")}>
            🚗 Post a Ride
          </button>
        </div>
      </div>

      {selectedRide && (
        <RideModal ride={selectedRide} onClose={() => setSelectedRide(null)} onBooked={handleRideBooked} />
      )}
    </PageShell>
  );
}
