import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import { PageShell, LoadingScreen, AlertBanner } from "../components/ui";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { APP_STYLES } from "../styles";

// ─── Confirm Cancel Modal ─────────────────────────────────────────────────────
function ConfirmModal({ onConfirm, onCancel, cancelling }) {
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box">
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem", textAlign: "center" }}>⚠️</div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#f4f4f5", textAlign: "center", margin: "0 0 0.5rem 0" }}>
          Cancel this booking?
        </h3>
        <p style={{ color: "#71717a", fontSize: "0.85rem", textAlign: "center", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
          The seat will be released back to the driver. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="ghost-btn" style={{ flex: 1, padding: "0.7rem" }} onClick={onCancel}>Keep Booking</button>
          <button
            className="danger-btn"
            style={{ flex: 1, padding: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            onClick={onConfirm}
            disabled={cancelling}
          >
            {cancelling && <span style={{ width: 13, height: 13, border: "2px solid rgba(252,165,165,0.3)", borderTopColor: "#fca5a5", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
            {cancelling ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [flash, setFlash] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { user, loading } = useCurrentUser(true);
  const navigate = useNavigate();
  const now = new Date();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await apiRequest("/api/bookings/my");
        if (res.ok) setBookings(await res.json());
        else console.error("Failed to load bookings:", await res.text());
      } catch (err) {
        console.error("Bookings fetch error:", err);
        navigate("/login");
      } finally {
        setBookingsLoading(false);
      }
    };
    loadBookings();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await apiRequest(`/api/bookings/cancel/${confirmId}`, "DELETE");
      if (res.ok) {
        setBookings((bs) => bs.filter((b) => b.id !== confirmId));
        setFlash({ msg: "Booking cancelled. Seat returned to driver.", type: "ok" });
      } else {
        setFlash({ msg: "Failed to cancel booking.", type: "err" });
      }
    } catch {
      setFlash({ msg: "Something went wrong.", type: "err" });
    } finally {
      setCancelling(false);
      setConfirmId(null);
      setTimeout(() => setFlash(null), 4000);
    }
  };

  const processed = useMemo(() => {
    let result = bookings.map((b) => ({ ...b, deptDate: new Date(b.ride?.departureTime) }));
    if (filter === "upcoming") result = result.filter((b) => b.deptDate >= now);
    if (filter === "past") result = result.filter((b) => b.deptDate < now);
    if (sortBy === "newest") result = [...result].sort((a, z) => new Date(z.bookingTime) - new Date(a.bookingTime));
    else if (sortBy === "oldest") result = [...result].sort((a, z) => new Date(a.bookingTime) - new Date(z.bookingTime));
    else if (sortBy === "departure") result = [...result].sort((a, z) => a.deptDate - z.deptDate);
    return result;
  }, [bookings, filter, sortBy]);

  const upcomingCount = bookings.filter((b) => new Date(b.ride?.departureTime) >= now).length;
  const totalSpent    = bookings.reduce((s, b) => s + (b.ride?.price || 0), 0);

  if (loading || bookingsLoading) return (
    <>
      <style>{APP_STYLES}</style>
      <LoadingScreen message="Loading your bookings…" />
    </>
  );

  return (
    <PageShell>
      <style>{APP_STYLES}</style>
      <Navbar user={user} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "1.75rem" }}>
          <p style={{ fontSize: "0.72rem", color: "#e7e247", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.3rem 0" }}>Your Journeys</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", lineHeight: 1.15, margin: 0 }}>My Bookings</h1>
            <button className="glow-btn" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }} onClick={() => navigate("/rides")}>
              + Book Another Ride
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            ["📋", bookings.length,              "Total Bookings"],
            ["🟢", upcomingCount,                "Upcoming"],
            ["📅", bookings.length - upcomingCount, "Past Rides"],
            ["💰", `₹${totalSpent.toFixed(2)}`, "Total Spent"],
          ].map(([icon, val, lbl]) => (
            <div key={lbl} style={{ background: "rgba(61,59,48,0.4)", border: "1px solid rgba(231,226,71,0.08)", borderRadius: 10, padding: "0.55rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#e7e247" }}>{val}</div>
                <div style={{ color: "#52525b", fontSize: "0.7rem" }}>{lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + sort bar */}
        <div className="card-dark" style={{ padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {[["all", "All"], ["upcoming", "Upcoming"], ["past", "Past"]].map(([k, l]) => (
              <button key={k} className={`tab-btn ${filter === k ? "on" : "off"}`} onClick={() => setFilter(k)}>
                {l}
                {k === "upcoming" && upcomingCount > 0 && (
                  <span style={{ background: "rgba(34,197,94,0.2)", color: "#86efac", borderRadius: 99, padding: "0 0.35rem", fontSize: "0.68rem", marginLeft: "0.3rem" }}>
                    {upcomingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#52525b", fontSize: "0.75rem" }}>Sort:</span>
            <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "0.45rem 0.75rem", fontSize: "0.8rem", width: "auto" }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="departure">By departure</option>
            </select>
          </div>
        </div>

        {flash && <AlertBanner message={flash.msg} type={flash.type} />}

        {/* Bookings list */}
        {processed.length === 0 ? (
          <div className="card-dark" style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎒</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#71717a", marginBottom: "0.4rem" }}>
              {filter === "all" ? "No bookings yet" : `No ${filter} rides`}
            </div>
            <div style={{ color: "#52525b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {filter === "all" ? "Find a ride and book your first seat." : "Try switching the filter above."}
            </div>
            {filter === "all" && (
              <button className="glow-btn" style={{ padding: "0.65rem 1.5rem", fontSize: "0.85rem" }} onClick={() => navigate("/rides")}>
                Browse Available Rides →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {processed.map((booking) => {
              const ride       = booking.ride;
              const isUpcoming = booking.deptDate >= now;
              const bookDate   = new Date(booking.bookingTime);

              return (
                <div
                  key={booking.id}
                  style={{
                    background: "rgba(61,59,48,0.28)", border: "1px solid rgba(231,226,71,0.09)", backdropFilter: "blur(10px)", borderRadius: 14,
                    padding: "1.25rem", transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.35)"; e.currentTarget.style.borderColor = "rgba(231,226,71,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(231,226,71,0.09)"; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    {/* Route + driver */}
                    <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: 220 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "0.2rem", gap: 3 }}>
                        <div style={{ width: 9, height: 9, background: "#22c55e", borderRadius: "50%" }} />
                        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
                        <div style={{ width: 9, height: 9, background: "#e7e247", borderRadius: 2 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.2rem" }}>{ride?.origin || "—"}</div>
                        <div style={{ color: "#f4f4f5", fontSize: "0.92rem", fontWeight: 600, fontFamily: "Syne, sans-serif", marginBottom: "0.5rem" }}>{ride?.destination || "—"}</div>
                        {ride?.driver && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 24, height: 24, background: "rgba(231,226,71,0.14)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.7rem", flexShrink: 0 }}>
                              {ride.driver.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: "#71717a", fontSize: "0.78rem" }}>
                              Driver: <span style={{ color: "#d4d4d8" }}>{ride.driver.name}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 180 }}>
                      {ride?.departureTime && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.75rem" }}>🕐</span>
                          <span style={{ color: "#a1a1aa", fontSize: "0.78rem" }}>
                            {ride.departureTime.split("T")[0]} · {ride.departureTime.split("T")[1].substring(0, 5)}
                          </span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "0.75rem" }}>🎟</span>
                        <span style={{ color: "#a1a1aa", fontSize: "0.78rem" }}>
                          Booked {bookDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "0.75rem" }}>🔖</span>
                        <span style={{ color: "#52525b", fontSize: "0.72rem", fontFamily: "monospace" }}>
                          BK-{String(booking.id).padStart(5, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Price + status + action */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem", flexShrink: 0 }}>
                      <span style={{
                        borderRadius: 6, fontSize: "0.7rem", fontWeight: 500, padding: "0.18rem 0.55rem",
                        background: isUpcoming ? "rgba(34,197,94,0.12)" : "rgba(113,113,122,0.1)",
                        color: isUpcoming ? "#86efac" : "#71717a",
                        border: `1px solid ${isUpcoming ? "rgba(34,197,94,0.2)" : "rgba(113,113,122,0.15)"}`,
                      }}>
                        {isUpcoming ? "Upcoming" : "Completed"}
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#e7e247" }}>₹{ride?.price || "—"}</div>
                        <div style={{ color: "#52525b", fontSize: "0.7rem" }}>per seat</div>
                      </div>
                      {isUpcoming && (
                        <button className="danger-btn" style={{ padding: "0.4rem 0.85rem" }} onClick={() => setConfirmId(booking.id)}>
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confirmation strip */}
                  {isUpcoming && (
                    <div style={{ marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%" }} />
                      <span style={{ color: "#52525b", fontSize: "0.75rem" }}>Confirmed · Check your email for ride details</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {bookings.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ color: "#52525b", fontSize: "0.82rem", marginBottom: "0.85rem" }}>Going somewhere? Share your journey and fill your seats.</p>
            <button className="glow-btn" style={{ padding: "0.7rem 1.75rem", fontSize: "0.88rem" }} onClick={() => navigate("/post-ride")}>
              🚗 Post a Ride
            </button>
          </div>
        )}
      </div>

      {confirmId && <ConfirmModal onConfirm={handleCancel} onCancel={() => setConfirmId(null)} cancelling={cancelling} />}
    </PageShell>
  );
}
