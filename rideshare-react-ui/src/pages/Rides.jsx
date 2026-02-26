import { useState, useMemo } from "react";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  body { margin: 0; background: #1a1a16; }
  .page-bg {
    background:
      radial-gradient(ellipse 60% 40% at 70% 0%, rgba(231,226,71,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 40% 50% at 5% 80%, rgba(77,80,97,0.25) 0%, transparent 60%),
      #1a1a16;
    min-height: 100vh;
  }
  .grid-bg {
    background-image:
      linear-gradient(rgba(231,226,71,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(231,226,71,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .card-dark {
    background: rgba(61,59,48,0.28);
    border: 1px solid rgba(231,226,71,0.09);
    backdrop-filter: blur(10px);
    border-radius: 16px;
  }
  .ride-card {
    background: rgba(61,59,48,0.28);
    border: 1px solid rgba(231,226,71,0.09);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    cursor: pointer;
  }
  .ride-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
    border-color: rgba(231,226,71,0.25);
  }
  .input-field {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #f4f4f5;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .input-field::placeholder { color: #52525b; }
  .input-field:focus { border-color: rgba(231,226,71,0.45); }
  select.input-field option { background: #2a2a22; color: #f4f4f5; }
  .glow-btn {
    background-color: #e7e247;
    color: #1a1a16;
    border: none;
    cursor: pointer;
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
  }
  .glow-btn:hover { box-shadow: 0 0 25px rgba(231,226,71,0.3); transform: translateY(-1px); }
  .ghost-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #a1a1aa;
    cursor: pointer;
    border-radius: 10px;
    font-size: 0.82rem;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .ghost-btn:hover, .ghost-btn.active {
    border-color: rgba(231,226,71,0.4);
    color: #e7e247;
    background: rgba(231,226,71,0.06);
  }
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.55rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 500;
  }
  .tag-available { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.2); }
  .tag-filling { background: rgba(234,179,8,0.12); color: #fde68a; border: 1px solid rgba(234,179,8,0.2); }
  .tag-full { background: rgba(239,68,68,0.1); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }
  .seat-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
  .modal-bg {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }
  .modal {
    background: #22221a;
    border: 1px solid rgba(231,226,71,0.15);
    border-radius: 20px;
    padding: 2rem;
    max-width: 440px;
    width: 100%;
    animation: slideUp 0.3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .nav-blur {
    backdrop-filter: blur(16px);
    background: rgba(26,26,22,0.85);
    border-bottom: 1px solid rgba(231,226,71,0.07);
  }
  a { color: #e7e247; text-decoration: none; }
  .stat-pill {
    background: rgba(61,59,48,0.4);
    border: 1px solid rgba(231,226,71,0.08);
    border-radius: 10px;
    padding: 0.5rem 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const RIDES = [
  { id: 1, driver: "Alex R.", driverInit: "A", rating: 4.9, reviews: 83, origin: "Downtown", destination: "International Airport", departure: "7:30 AM", date: "Today", seats: 3, price: 14, car: "Toyota Camry · Silver", tags: ["AC", "Non-smoking"], status: "available" },
  { id: 2, driver: "Priya K.", driverInit: "P", rating: 4.8, reviews: 120, origin: "Midtown", destination: "Business Park North", departure: "8:00 AM", date: "Today", seats: 2, price: 9, car: "Honda Civic · White", tags: ["Music", "Quiet"], status: "filling" },
  { id: 3, driver: "Marcus T.", driverInit: "M", rating: 4.7, reviews: 47, origin: "West Side", destination: "University Campus", departure: "8:45 AM", date: "Today", seats: 1, price: 7, car: "Ford Focus · Blue", tags: ["AC", "Fast driver"], status: "filling" },
  { id: 4, driver: "Sophie L.", driverInit: "S", rating: 5.0, reviews: 212, origin: "Suburbs East", destination: "City Centre", departure: "9:00 AM", date: "Today", seats: 4, price: 11, car: "VW Passat · Black", tags: ["Luggage space", "AC"], status: "available" },
  { id: 5, driver: "James O.", driverInit: "J", rating: 4.6, reviews: 38, origin: "Riverside", destination: "Tech Hub", departure: "9:30 AM", date: "Today", seats: 0, price: 12, car: "Nissan Altima · Grey", tags: ["AC"], status: "full" },
  { id: 6, driver: "Aisha M.", driverInit: "A", rating: 4.9, reviews: 95, origin: "North Quarter", destination: "Shopping Mall", departure: "10:15 AM", date: "Today", seats: 2, price: 8, car: "Hyundai Elantra · Red", tags: ["Quiet", "Music"], status: "available" },
  { id: 7, driver: "Carlos B.", driverInit: "C", rating: 4.8, reviews: 61, origin: "Harbour View", destination: "International Airport", departure: "11:00 AM", date: "Tomorrow", seats: 3, price: 16, car: "Tesla Model 3 · White", tags: ["EV", "Luggage space", "AC"], status: "available" },
  { id: 8, driver: "Natalie W.", driverInit: "N", rating: 4.7, reviews: 55, origin: "Downtown", destination: "Beach Resort", departure: "2:00 PM", date: "Tomorrow", seats: 2, price: 20, car: "Mazda CX-5 · Blue", tags: ["AC", "Music"], status: "filling" },
  { id: 9, driver: "Ravi S.", driverInit: "R", rating: 4.5, reviews: 29, origin: "Industrial Zone", destination: "City Centre", departure: "7:00 AM", date: "Tomorrow", seats: 3, price: 6, car: "Suzuki Swift · White", tags: ["Budget friendly"], status: "available" },
];

const ALL_DESTINATIONS = [...new Set(RIDES.map(r => r.destination))];
const ALL_ORIGINS = [...new Set(RIDES.map(r => r.origin))];

function StatusTag({ status }) {
  const map = { available: ["tag-available", "Available"], filling: ["tag-filling", "Filling up"], full: ["tag-full", "Full"] };
  const [cls, label] = map[status] || map.available;
  return <span className={`tag ${cls}`}>{label}</span>;
}

function SeatDots({ seats, max = 4 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[...Array(max)].map((_, i) => (
        <div key={i} className="seat-dot" style={{ background: i < seats ? "#e7e247" : "rgba(255,255,255,0.1)" }}></div>
      ))}
    </div>
  );
}

function RideModal({ ride, onClose }) {
  const [booked, setBooked] = useState(false);
  if (!ride) return null;
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 40, height: 40, background: "rgba(231,226,71,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247" }}>
              {ride.driverInit}
            </div>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#f4f4f5", fontSize: "0.95rem" }}>{ride.driver}</div>
              <div style={{ color: "#71717a", fontSize: "0.75rem" }}>⭐ {ride.rating} · {ride.reviews} reviews</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#71717a", cursor: "pointer", borderRadius: 8, width: 30, height: 30, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }}></div>
            <span style={{ color: "#71717a", fontSize: "0.8rem" }}>From</span>
            <span style={{ color: "#f4f4f5", fontSize: "0.9rem", fontWeight: 500 }}>{ride.origin}</span>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)", marginLeft: "3px", marginBottom: "0.6rem" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "#e7e247", borderRadius: "2px" }}></div>
            <span style={{ color: "#71717a", fontSize: "0.8rem" }}>To</span>
            <span style={{ color: "#f4f4f5", fontSize: "0.9rem", fontWeight: 500 }}>{ride.destination}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
          {[["🕐", "Departure", `${ride.date}, ${ride.departure}`], ["💺", "Seats Left", `${ride.seats} available`], ["🚗", "Vehicle", ride.car]].map(([icon, label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.6rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>{icon}</div>
              <div style={{ color: "#52525b", fontSize: "0.68rem", marginBottom: "0.15rem" }}>{label}</div>
              <div style={{ color: "#d4d4d8", fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.3 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
          {ride.tags.map(t => (
            <span key={t} style={{ background: "rgba(231,226,71,0.08)", border: "1px solid rgba(231,226,71,0.15)", borderRadius: 6, padding: "0.2rem 0.55rem", color: "#d4d4d8", fontSize: "0.72rem" }}>{t}</span>
          ))}
        </div>

        {!booked ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ color: "#71717a", fontSize: "0.85rem" }}>Price per seat</span>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#e7e247" }}>${ride.price}</span>
            </div>
            <button
              className="glow-btn"
              onClick={() => setBooked(true)}
              disabled={ride.status === "full"}
              style={{ width: "100%", padding: "0.9rem", fontSize: "0.9rem", opacity: ride.status === "full" ? 0.4 : 1, cursor: ride.status === "full" ? "not-allowed" : "pointer" }}
            >
              {ride.status === "full" ? "Ride is Full" : "Book This Seat →"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12 }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>✅</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#86efac", fontSize: "0.95rem" }}>Seat Booked!</div>
            <div style={{ color: "#71717a", fontSize: "0.78rem", marginTop: "0.2rem" }}>Payment confirmation sent to your email</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewRidesPage() {
  const [search, setSearch] = useState("");
  const [filterDest, setFilterDest] = useState("All");
  const [filterOrigin, setFilterOrigin] = useState("All");
  const [filterDate, setFilterDate] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("departure");
  const [selectedRide, setSelectedRide] = useState(null);
  const [view, setView] = useState("grid");

  const filtered = useMemo(() => {
    let r = RIDES;
    if (search) r = r.filter(x => x.origin.toLowerCase().includes(search.toLowerCase()) || x.destination.toLowerCase().includes(search.toLowerCase()) || x.driver.toLowerCase().includes(search.toLowerCase()));
    if (filterDest !== "All") r = r.filter(x => x.destination === filterDest);
    if (filterOrigin !== "All") r = r.filter(x => x.origin === filterOrigin);
    if (filterDate !== "All") r = r.filter(x => x.date === filterDate);
    if (filterStatus !== "All") r = r.filter(x => x.status === filterStatus);
    if (sortBy === "price") r = [...r].sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    else if (sortBy === "seats") r = [...r].sort((a, b) => b.seats - a.seats);
    return r;
  }, [search, filterDest, filterOrigin, filterDate, filterStatus, sortBy]);

  return (
    <div className="page-bg grid-bg" style={{ minHeight: "100vh" }}>
      <style>{SHARED_STYLES}</style>

      {/* Nav */}
      <nav className="nav-blur" style={{ position: "sticky", top: 0, zIndex: 40, padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: "#e7e247", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#1a1a16" }}>R</span>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#f4f4f5" }}>RideShare</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button className="ghost-btn" style={{ padding: "0.5rem 1rem" }}>Sign In</button>
          <button className="glow-btn" style={{ padding: "0.5rem 1.1rem", fontSize: "0.82rem" }}>Post a Ride</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Page Header */}
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

          {/* Live stats pills */}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {[["🟢", `${RIDES.filter(r => r.status !== "full").length} rides available`], ["🚗", `${RIDES.length} total rides`], ["📍", "60+ cities"]].map(([icon, txt]) => (
              <div key={txt} className="stat-pill">
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
                style={{ width: "100%", paddingLeft: "2.25rem" }}
                placeholder="Search by origin, destination or driver name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {(search || filterDest !== "All" || filterOrigin !== "All" || filterDate !== "All" || filterStatus !== "All") && (
              <button className="ghost-btn" style={{ padding: "0.7rem 1rem", whiteSpace: "nowrap" }} onClick={() => { setSearch(""); setFilterDest("All"); setFilterOrigin("All"); setFilterDate("All"); setFilterStatus("All"); }}>
                ✕ Clear
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {[
              ["Origin", filterOrigin, setFilterOrigin, ["All", ...ALL_ORIGINS]],
              ["Destination", filterDest, setFilterDest, ["All", ...ALL_DESTINATIONS]],
              ["Date", filterDate, setFilterDate, ["All", "Today", "Tomorrow"]],
              ["Status", filterStatus, setFilterStatus, ["All", "available", "filling", "full"]],
              ["Sort by", sortBy, setSortBy, [["departure", "Departure"], ["price", "Price: Low"], ["rating", "Top Rated"], ["seats", "Most Seats"]]],
            ].map(([label, val, setter, opts]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <span style={{ color: "#52525b", fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.2rem" }}>{label}</span>
                <select
                  className="input-field"
                  value={val}
                  onChange={e => setter(e.target.value)}
                  style={{ paddingRight: "2rem", cursor: "pointer", minWidth: 120 }}
                >
                  {opts.map(o => Array.isArray(o)
                    ? <option key={o[0]} value={o[0]}>{o[1]}</option>
                    : <option key={o} value={o}>{o}</option>
                  )}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <p style={{ color: "#52525b", fontSize: "0.82rem", margin: 0 }}>
            Showing <span style={{ color: "#e7e247", fontWeight: 600 }}>{filtered.length}</span> rides
          </p>
        </div>

        {/* Ride Grid / List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#52525b" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚗</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#71717a", marginBottom: "0.4rem" }}>No rides found</div>
            <div style={{ fontSize: "0.85rem" }}>Try adjusting your filters or search query</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr",
            gap: "1rem"
          }}>
            {filtered.map(ride => (
              <div key={ride.id} className="ride-card" onClick={() => setSelectedRide(ride)}
                style={{ padding: "1.25rem", opacity: ride.status === "full" ? 0.65 : 1 }}>

                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 38, height: 38, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.9rem", flexShrink: 0 }}>
                      {ride.driverInit}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, color: "#f4f4f5", fontSize: "0.88rem" }}>{ride.driver}</div>
                      <div style={{ color: "#71717a", fontSize: "0.72rem" }}>⭐ {ride.rating} · {ride.reviews} trips</div>
                    </div>
                  </div>
                  <StatusTag status={ride.status} />
                </div>

                {/* Route */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "0.75rem", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.45rem" }}>
                    <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", flexShrink: 0 }}></div>
                    <span style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>{ride.origin}</span>
                  </div>
                  <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.07)", marginLeft: "3px", marginBottom: "0.45rem" }}></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 7, height: 7, background: "#e7e247", borderRadius: "2px", flexShrink: 0 }}></div>
                    <span style={{ color: "#d4d4d8", fontSize: "0.82rem", fontWeight: 500 }}>{ride.destination}</span>
                  </div>
                </div>

                {/* Info chips */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
                    <span style={{ fontSize: "0.75rem" }}>🕐</span>
                    <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{ride.date}, {ride.departure}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "0.25rem 0.55rem" }}>
                    <span style={{ fontSize: "0.75rem" }}>🚗</span>
                    <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>{ride.car.split(" · ")[0]}</span>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  {ride.tags.slice(0, 3).map(t => (
                    <span key={t} style={{ background: "rgba(231,226,71,0.07)", border: "1px solid rgba(231,226,71,0.12)", borderRadius: 5, padding: "0.15rem 0.45rem", color: "#a1a1aa", fontSize: "0.68rem" }}>{t}</span>
                  ))}
                </div>

                {/* Bottom row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <SeatDots seats={ride.seats} />
                      <span style={{ color: "#71717a", fontSize: "0.72rem" }}>{ride.seats} seat{ride.seats !== 1 ? "s" : ""} left</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#e7e247" }}>${ride.price}</span>
                      <span style={{ color: "#52525b", fontSize: "0.7rem", marginLeft: "0.2rem" }}>/seat</span>
                    </div>
                    <button
                      className="glow-btn"
                      onClick={e => { e.stopPropagation(); setSelectedRide(ride); }}
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

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "#52525b", fontSize: "0.85rem", marginBottom: "1rem" }}>Going somewhere? Share your ride and earn back fuel costs.</p>
          <button className="glow-btn" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem" }}>🚗 Post a Ride</button>
        </div>
      </div>

      {selectedRide && <RideModal ride={selectedRide} onClose={() => setSelectedRide(null)} />}
    </div>
  );
}
