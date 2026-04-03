import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import { PageShell, LoadingScreen, AlertBanner } from "../components/ui";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { APP_STYLES } from "../styles";

// ─── Star Display (read-only) ─────────────────────────────────────────────────
function StarDisplay({ value }) {
  const rounded = Math.round(value);
  return (
    <span style={{ display: "inline-flex", gap: "0.1rem" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: "0.9rem", color: s <= rounded ? "#e7e247" : "#3f3f46" }}>★</span>
      ))}
    </span>
  );
}

export default function AdminPage() {
  const { user, loading } = useCurrentUser(true);
  const navigate = useNavigate();

  const [tab, setTab]           = useState("reports");
  const [reports, setReports]   = useState(null);
  const [users, setUsers]       = useState([]);
  const [rides, setRides]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviewStats, setReviewStats] = useState([]);   // NEW: review analytics
  const [dataLoading, setDataLoading] = useState(false);
  const [flash, setFlash]       = useState("");
  const [flashType, setFlashType] = useState("ok");

  const showFlash = (msg, type = "ok") => {
    setFlash(msg); setFlashType(type);
    setTimeout(() => setFlash(""), 4000);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") { navigate("/profile"); return; }

    const load = async () => {
      setDataLoading(true);
      try {
        if (tab === "reports") {
          const res = await apiRequest("/api/admin/reports");
          if (res.ok) setReports(await res.json());
          else showFlash("Failed to load reports.", "err");
        }
        if (tab === "users") {
          const res = await apiRequest("/api/admin/users");
          if (res.ok) setUsers(await res.json());
          else showFlash("Failed to load users.", "err");
        }
        if (tab === "rides") {
          const res = await apiRequest("/api/admin/rides");
          if (res.ok) setRides(await res.json());
          else showFlash("Failed to load rides.", "err");
        }
        if (tab === "bookings") {
          const res = await apiRequest("/api/admin/bookings");
          if (res.ok) setBookings(await res.json());
          else showFlash("Failed to load bookings.", "err");
        }
        // NEW: load review stats
        if (tab === "reviews") {
          const res = await apiRequest("/api/admin/review-stats");
          if (res.ok) setReviewStats(await res.json());
          else showFlash("Failed to load review stats.", "err");
        }
      } catch {
        showFlash("Network error.", "err");
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [tab, user]);

  const handleBlock = async (userId, block) => {
    const action = block ? "block" : "unblock";
    const res = await apiRequest(`/api/admin/users/${userId}/${action}`, "POST");
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, enabled: !block } : u));
      showFlash(`User ${block ? "blocked" : "unblocked"} successfully.`);
    } else {
      const msg = await res.text();
      showFlash(msg || "Action failed.", "err");
    }
  };

  if (loading) return (
    <>
      <style>{APP_STYLES}</style>
      <LoadingScreen message="Loading admin panel…" />
    </>
  );

  const REPORT_LABELS = {
    totalRides:     "Total Rides",
    activeRides:    "Active Rides",
    completedRides: "Completed Rides",
    cancelledRides: "Cancelled Rides",
    totalBookings:  "Total Bookings",
    totalEarnings:  "Total Earnings (₹)",
    activeUsers:    "Active Users",
    blockedUsers:   "Blocked Users",
  };

  return (
    <PageShell>
      <style>{APP_STYLES}</style>
      <Navbar user={user} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <p style={{ fontSize: "0.72rem", color: "#e7e247", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.3rem 0" }}>
            Administration
          </p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", margin: 0 }}>
            Admin Dashboard
          </h1>
        </div>

        {flash && <AlertBanner message={flash} type={flashType} />}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            ["reports",  "📊 Reports"],
            ["users",    "👥 Users"],
            ["rides",    "🚗 Rides"],
            ["bookings", "🎟 Bookings"],
            ["reviews",  "⭐ Reviews"],   // NEW tab
          ].map(([k, l]) => (
            <button key={k} className={`tab-btn ${tab === k ? "on" : "off"}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {dataLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#52525b", fontSize: "0.85rem", marginBottom: "1rem" }}>
            <span style={{ width: 14, height: 14, border: "2px solid rgba(231,226,71,0.2)", borderTopColor: "#e7e247", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
            Loading…
          </div>
        )}

        {/* ── Reports ── */}
        {tab === "reports" && !dataLoading && reports && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "0.85rem" }}>
            {Object.entries(REPORT_LABELS).map(([key, label]) => (
              <div key={key} style={{ background: "rgba(61,59,48,0.4)", border: "1px solid rgba(231,226,71,0.1)", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#e7e247" }}>
                  {key === "totalEarnings"
                    ? `₹${Number(reports[key] || 0).toFixed(2)}`
                    : reports[key] ?? "—"}
                </div>
                <div style={{ color: "#71717a", fontSize: "0.75rem", marginTop: "0.25rem" }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Users ── */}
        {tab === "users" && !dataLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {users.length === 0 && <div style={{ color: "#52525b", fontSize: "0.85rem" }}>No users found.</div>}
            {users.map((u) => (
              <div key={u.id} style={{
                background: "rgba(61,59,48,0.28)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "0.85rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
                opacity: u.enabled === false ? 0.6 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 36, height: 36, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.85rem", flexShrink: 0 }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: "#f4f4f5", fontWeight: 600, fontSize: "0.9rem" }}>
                      {u.name}
                      {u.role === "ADMIN" && (
                        <span style={{ marginLeft: "0.5rem", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", borderRadius: 4, padding: "0.1rem 0.4rem", fontSize: "0.68rem", fontWeight: 700 }}>ADMIN</span>
                      )}
                      {u.enabled === false && (
                        <span style={{ marginLeft: "0.5rem", background: "rgba(239,68,68,0.12)", color: "#fca5a5", borderRadius: 4, padding: "0.1rem 0.4rem", fontSize: "0.68rem", fontWeight: 700 }}>BLOCKED</span>
                      )}
                    </div>
                    <div style={{ color: "#71717a", fontSize: "0.78rem" }}>{u.email} · ID: RS-{String(u.id).padStart(6, "0")}</div>
                  </div>
                </div>
                {u.role !== "ADMIN" && (
                  <button
                    className={u.enabled !== false ? "danger-btn" : "glow-btn"}
                    style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem" }}
                    onClick={() => handleBlock(u.id, u.enabled !== false)}
                  >
                    {u.enabled !== false ? "Block" : "Unblock"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Rides ── */}
        {tab === "rides" && !dataLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {rides.length === 0 && <div style={{ color: "#52525b", fontSize: "0.85rem" }}>No rides found.</div>}
            {rides.map((r) => (
              <div key={r.id} style={{
                background: "rgba(61,59,48,0.28)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "0.85rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ color: "#f4f4f5", fontSize: "0.9rem", fontWeight: 600 }}>
                    {r.origin} → {r.destination}
                  </div>
                  <div style={{ color: "#71717a", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                    Driver: {r.driver?.name || "—"} · Departure: {r.departureTime?.split("T")[0]} · ₹{r.price}
                  </div>
                </div>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 6,
                  color: r.status === "COMPLETED" ? "#a5b4fc" : r.status === "CANCELLED" ? "#fca5a5" : "#86efac",
                  background: r.status === "COMPLETED" ? "rgba(99,102,241,0.12)" : r.status === "CANCELLED" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.12)",
                  border: `1px solid ${r.status === "COMPLETED" ? "rgba(99,102,241,0.25)" : r.status === "CANCELLED" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                }}>
                  {r.status || "ACTIVE"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Bookings ── */}
        {tab === "bookings" && !dataLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {bookings.length === 0 && <div style={{ color: "#52525b", fontSize: "0.85rem" }}>No bookings found.</div>}
            {bookings.map((b) => (
              <div key={b.id} style={{
                background: "rgba(61,59,48,0.28)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "0.85rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ color: "#f4f4f5", fontSize: "0.9rem", fontWeight: 600 }}>
                    Booking BK-{String(b.id).padStart(5, "0")}
                  </div>
                  <div style={{ color: "#71717a", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                    Passenger: {b.passenger?.name || "—"} · ₹{b.price?.toFixed(2) ?? "—"}
                  </div>
                </div>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 6,
                  color: b.paymentStatus === "PAID" ? "#86efac" : "#fde68a",
                  background: b.paymentStatus === "PAID" ? "rgba(34,197,94,0.12)" : "rgba(253,230,138,0.08)",
                  border: `1px solid ${b.paymentStatus === "PAID" ? "rgba(34,197,94,0.2)" : "rgba(253,230,138,0.15)"}`,
                }}>
                  {b.paymentStatus}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Reviews (NEW) ── */}
        {tab === "reviews" && !dataLoading && (
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ color: "#71717a", fontSize: "0.82rem", margin: 0 }}>
                Drivers who have received at least one review, sorted by highest average rating.
              </p>
            </div>

            {reviewStats.length === 0 ? (
              <div style={{ color: "#52525b", fontSize: "0.85rem", padding: "2rem 0", textAlign: "center" }}>
                No reviews have been submitted yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {reviewStats.map((stat, idx) => (
                  <div key={stat.userId} style={{
                    background: "rgba(61,59,48,0.28)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10, padding: "0.85rem 1rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
                  }}>
                    {/* Rank + user info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 28, height: 28, background: idx === 0 ? "rgba(231,226,71,0.2)" : "rgba(255,255,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: idx === 0 ? "#e7e247" : "#52525b", fontSize: "0.8rem", flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ width: 36, height: 36, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.85rem", flexShrink: 0 }}>
                        {stat.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: "#f4f4f5", fontWeight: 600, fontSize: "0.9rem" }}>{stat.name}</div>
                        <div style={{ color: "#71717a", fontSize: "0.75rem" }}>{stat.email} · RS-{String(stat.userId).padStart(6, "0")}</div>
                      </div>
                    </div>

                    {/* Rating + review count */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#e7e247", lineHeight: 1 }}>
                          {stat.averageRating.toFixed(1)}
                        </div>
                        <StarDisplay value={stat.averageRating} />
                        <div style={{ color: "#52525b", fontSize: "0.68rem", marginTop: "0.15rem" }}>avg rating</div>
                      </div>
                      <div style={{ textAlign: "center", minWidth: 60 }}>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#a1a1aa", lineHeight: 1 }}>
                          {stat.totalReviews}
                        </div>
                        <div style={{ color: "#52525b", fontSize: "0.68rem", marginTop: "0.35rem" }}>review{stat.totalReviews !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
