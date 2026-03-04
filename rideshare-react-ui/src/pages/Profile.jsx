import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import { PageShell, LoadingScreen, AlertBanner } from "../components/ui";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useVehicles } from "../hooks/useVehicles";
import { APP_STYLES } from "../styles";

const EXTRA_STYLES = `
  .stat-left-border {
    background: rgba(61,59,48,0.22); border: 1px solid rgba(231,226,71,0.08);
    border-left: 3px solid #e7e247; border-radius: 12px; padding: 1rem 1.25rem;
  }
  .ride-row {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px; padding: 1rem; transition: border-color 0.2s;
  }
  .ride-row:hover { border-color: rgba(231,226,71,0.2); }
  .field-display {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 0.75rem 1rem; color: #d4d4d8; font-size: 0.88rem;
  }
  .vehicle-card {
    background: rgba(61,59,48,0.25); border: 1px solid rgba(231,226,71,0.09);
    border-radius: 14px; padding: 1rem 1.1rem;
    transition: border-color 0.2s;
  }
  .vehicle-card:hover { border-color: rgba(231,226,71,0.22); }
  .vehicle-card.selected {
    border-color: rgba(231,226,71,0.5);
    background: rgba(61,59,48,0.45);
    box-shadow: 0 0 0 1px rgba(231,226,71,0.25);
  }
  .passenger-row {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .passenger-row:last-child { border-bottom: none; }
`;

// ─── Inline Add-Vehicle Form ──────────────────────────────────────────────────
const EMPTY_V = { model: "", plateNumber: "", color: "", seatCapacity: 4 };

function AddVehicleForm({ onAdd, adding, addError, onCancel }) {
  const [form, setForm] = useState(EMPTY_V);
  const [localErr, setLocalErr] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (!form.model.trim())       { setLocalErr("Vehicle model is required.");   return false; }
    if (!form.plateNumber.trim()) { setLocalErr("Plate number is required.");    return false; }
    if (!form.color.trim())       { setLocalErr("Color is required.");           return false; }
    if (form.seatCapacity < 1 || form.seatCapacity > 10) { setLocalErr("Seat capacity must be between 1 and 10."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr("");
    if (!validate()) return;
    const ok = await onAdd({ ...form, seatCapacity: parseInt(form.seatCapacity) });
    if (ok) setForm(EMPTY_V);
  };

  const err = localErr || addError;

  return (
    <div style={{ background: "rgba(61,59,48,0.3)", border: "1px solid rgba(231,226,71,0.12)", borderRadius: 14, padding: "1.25rem", marginTop: "1rem" }}>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f4f4f5", margin: "0 0 1rem 0" }}>
        Add New Vehicle
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label>Model / Make</label>
            <input className="input-field" placeholder="e.g. Toyota Corolla" value={form.model} onChange={set("model")} />
          </div>
          <div>
            <label>Plate Number</label>
            <input className="input-field" placeholder="e.g. KA 01 AB 1234" value={form.plateNumber} onChange={set("plateNumber")} />
          </div>
          <div>
            <label>Color</label>
            <input className="input-field" placeholder="e.g. White" value={form.color} onChange={set("color")} />
          </div>
          <div>
            <label>Seat Capacity</label>
            <input className="input-field" type="number" min="1" max="10" value={form.seatCapacity} onChange={set("seatCapacity")} />
          </div>
        </div>

        {err && <AlertBanner message={err} type="err" />}

        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
          {onCancel && (
            <button type="button" className="ghost-btn" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem" }} onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="glow-btn" disabled={adding}
            style={{ padding: "0.55rem 1.25rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {adding && <span style={{ width: 12, height: 12, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
            {adding ? "Saving…" : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Passengers Panel ─────────────────────────────────────────────────────────
function PassengersPanel({ rideId }) {
  const [passengers, setPassengers] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest(`/api/rides/${rideId}/passengers`);
        if (res.ok) setPassengers(await res.json());
        else setError("Could not load passengers.");
      } catch {
        setError("Could not load passengers.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rideId]);

  if (loading) return (
    <div style={{ padding: "0.75rem 0", color: "#52525b", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ width: 12, height: 12, border: "2px solid rgba(231,226,71,0.2)", borderTopColor: "#e7e247", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
      Loading passengers…
    </div>
  );

  if (error) return <div style={{ padding: "0.6rem 0", color: "#fca5a5", fontSize: "0.8rem" }}>⚠ {error}</div>;

  if (!passengers || passengers.length === 0) return (
    <div style={{ padding: "0.75rem 0", color: "#52525b", fontSize: "0.82rem" }}>No passengers have booked this ride yet.</div>
  );

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ color: "#71717a", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.5rem 0" }}>
        Passengers ({passengers.length})
      </p>
      {passengers.map((p) => (
        <div key={p.id} className="passenger-row">
          <div style={{ width: 30, height: 30, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.78rem", flexShrink: 0 }}>
            {p.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f4f4f5", fontSize: "0.85rem", fontWeight: 500 }}>{p.name}</div>
            <div style={{ color: "#52525b", fontSize: "0.75rem" }}>{p.contact || "No contact"}</div>
          </div>
          <div style={{ color: "#71717a", fontSize: "0.72rem", textAlign: "right" }}>
            Booked {new Date(p.bookingTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [myRides, setMyRides]           = useState([]);
  const [ridesLoading, setRidesLoading] = useState(true);
  const [tab, setTab]                   = useState("details");
  const [editMode, setEditMode]         = useState(false);
  const [editForm, setEditForm]         = useState({ name: "", email: "", contact: "" });
  const [saving, setSaving]             = useState(false);
  const [saveMsg, setSaveMsg]           = useState("");
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  // rideId → true/false whether passengers panel is open
  const [passengersOpen, setPassengersOpen] = useState({});

  const { user, loading }                                     = useCurrentUser(true);
  const { vehicles, vehiclesLoading, addVehicle, adding, addError, setAddError } = useVehicles();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setEditForm({ name: user.name, email: user.email, contact: user.contact || "" });
  }, [user]);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const res = await apiRequest("/api/rides/my");
        if (res.ok) setMyRides(await res.json());
        else console.error("Failed to load rides:", await res.text());
      } catch (err) {
        console.error("Rides error:", err);
      } finally {
        setRidesLoading(false);
      }
    };
    loadRides();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await new Promise((r) => setTimeout(r, 600));
      setSaveMsg("Profile updated successfully.");
      setEditMode(false);
      setTimeout(() => setSaveMsg(""), 3500);
    } catch (err) {
      setSaveMsg("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async (data) => {
    const ok = await addVehicle(data);
    if (ok) setShowAddVehicle(false);
    return ok;
  };

  const togglePassengers = (rideId) =>
    setPassengersOpen((prev) => ({ ...prev, [rideId]: !prev[rideId] }));

  const setField = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return (
    <>
      <style>{APP_STYLES + EXTRA_STYLES}</style>
      <LoadingScreen message="Loading your profile…" />
    </>
  );

  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <PageShell>
      <style>{APP_STYLES + EXTRA_STYLES}</style>
      <Navbar user={user} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* ── Hero card ── */}
        <div className="card-dark fade-up" style={{ padding: "2rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}>
          <div className="avatar-circle" style={{ width: 72, height: 72, fontSize: "1.5rem", cursor: "default" }}>{initials}</div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: "0.72rem", color: "#e7e247", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.3rem 0" }}>Your Profile</p>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#f4f4f5", lineHeight: 1.15, margin: 0 }}>{user.name}</h1>
            <p style={{ color: "#71717a", fontSize: "0.85rem", marginTop: "0.3rem" }}>{user.email}</p>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div className="stat-left-border" style={{ textAlign: "center", minWidth: 80 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#e7e247" }}>{myRides.length}</div>
              <div style={{ color: "#71717a", fontSize: "0.72rem", marginTop: "0.15rem" }}>Rides Posted</div>
            </div>
            <div className="stat-left-border" style={{ textAlign: "center", minWidth: 80 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#e7e247" }}>{vehicles.length}</div>
              <div style={{ color: "#71717a", fontSize: "0.72rem", marginTop: "0.15rem" }}>Vehicles</div>
            </div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button className="glow-btn" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem" }}
                onClick={() => { setEditMode(!editMode); setSaveMsg(""); setTab("details"); }}>
                {editMode ? "✕ Cancel" : "✏ Edit Profile"}
              </button>
              <button className="ghost-btn" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem" }} onClick={() => navigate("/bookings")}>
                📋 My Bookings
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem" }}>
          {[
            ["details",  "👤 Details"],
            ["rides",    "🚗 My Rides"],
            ["vehicles", "🚘 My Vehicles"],
          ].map(([k, l]) => (
            <button key={k} className={`tab-btn ${tab === k ? "on" : "off"}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <AlertBanner message={saveMsg} type={saveMsg.startsWith("Error") ? "err" : "ok"} />

        {/* ════════════════════════════════════════
            TAB: Details
        ════════════════════════════════════════ */}
        {tab === "details" && (
          <div className="card-dark fade-up" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#f4f4f5", margin: "0 0 1.25rem 0" }}>
              {editMode ? "Edit Your Information" : "Account Information"}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: "1.25rem" }}>
              {[
                ["Full Name",      "name",    "text",  user.name],
                ["Email Address",  "email",   "email", user.email],
                ["Contact Number", "contact", "text",  user.contact || "Not set"],
              ].map(([labelTxt, key, type, displayVal]) => (
                <div key={key}>
                  <label>{labelTxt}</label>
                  {editMode
                    ? <input className="input-field" type={type} value={editForm[key]} onChange={setField(key)} />
                    : <div className="field-display" style={!user[key] ? { color: "#52525b" } : {}}>{displayVal}</div>}
                </div>
              ))}
              <div>
                <label>Member ID</label>
                <div className="field-display" style={{ color: "#52525b", fontFamily: "monospace" }}>
                  RS-{String(user.id).padStart(6, "0")}
                </div>
              </div>
            </div>

            {editMode && (
              <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button className="ghost-btn" style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem" }}
                  onClick={() => { setEditMode(false); setEditForm({ name: user.name, email: user.email, contact: user.contact || "" }); }}>
                  Cancel
                </button>
                <button className="glow-btn" style={{ padding: "0.65rem 1.4rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  onClick={handleSave} disabled={saving}>
                  {saving && <span style={{ width: 13, height: 13, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {!editMode && (
              <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <button className="glow-btn"  style={{ padding: "0.6rem 1.2rem", fontSize: "0.82rem" }} onClick={() => navigate("/post-ride")}>🚗 Post a New Ride</button>
                <button className="ghost-btn" style={{ padding: "0.6rem 1.2rem", fontSize: "0.82rem" }} onClick={() => navigate("/bookings")}>📋 My Bookings</button>
                <button className="ghost-btn" style={{ padding: "0.6rem 1.2rem", fontSize: "0.82rem" }} onClick={() => navigate("/rides")}>🔍 Browse All Rides</button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: My Rides
        ════════════════════════════════════════ */}
        {tab === "rides" && (
          <div className="fade-up">
            {ridesLoading ? (
              <div className="card-dark" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ width: 24, height: 24, border: "3px solid rgba(231,226,71,0.2)", borderTopColor: "#e7e247", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 0.75rem" }} />
                <div style={{ color: "#52525b", fontSize: "0.85rem" }}>Loading rides…</div>
              </div>
            ) : myRides.length === 0 ? (
              <div className="card-dark" style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚗</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#71717a", marginBottom: "0.4rem" }}>No rides posted yet</div>
                <div style={{ color: "#52525b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>Share your journey and earn back fuel costs</div>
                <button className="glow-btn" style={{ padding: "0.65rem 1.5rem", fontSize: "0.85rem" }} onClick={() => navigate("/post-ride")}>
                  Post Your First Ride →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {myRides.map((ride) => {
                  const dt     = new Date(ride.departureTime);
                  const isPast = dt < new Date();
                  const seats  = ride.availableSeats;
                  const isOpen = passengersOpen[ride.id];

                  return (
                    <div key={ride.id} className="ride-row">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                        {/* Route */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 180 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }} />
                            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
                            <div style={{ width: 8, height: 8, background: "#e7e247", borderRadius: 2 }} />
                          </div>
                          <div>
                            <div style={{ color: "#a1a1aa", fontSize: "0.8rem" }}>{ride.origin}</div>
                            <div style={{ color: "#f4f4f5", fontSize: "0.85rem", fontWeight: 500 }}>{ride.destination}</div>
                          </div>
                        </div>

                        {/* Info chips */}
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "0.25rem 0.6rem", color: "#a1a1aa", fontSize: "0.75rem" }}>
                            🕐 {ride.departureTime.split("T")[0]} · {ride.departureTime.split("T")[1].substring(0, 5)}
                          </span>
                          <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "0.25rem 0.6rem", color: "#a1a1aa", fontSize: "0.75rem" }}>
                            💺 {seats} seat{seats !== 1 ? "s" : ""}
                          </span>
                          {ride.vehicle && (
                            <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "0.25rem 0.6rem", color: "#a1a1aa", fontSize: "0.75rem" }}>
                              🚘 {ride.vehicle.model}
                            </span>
                          )}
                          <span style={{
                            borderRadius: 6, fontSize: "0.7rem", fontWeight: 500, padding: "0.18rem 0.55rem",
                            background: seats === 0 ? "rgba(239,68,68,0.1)" : isPast ? "rgba(113,113,122,0.1)" : "rgba(34,197,94,0.12)",
                            color: seats === 0 ? "#fca5a5" : isPast ? "#71717a" : "#86efac",
                            border: `1px solid ${seats === 0 ? "rgba(239,68,68,0.2)" : isPast ? "rgba(113,113,122,0.15)" : "rgba(34,197,94,0.2)"}`,
                          }}>
                            {seats === 0 ? "Full" : isPast ? "Past" : "Active"}
                          </span>
                        </div>

                        {/* Price + passengers toggle */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#e7e247" }}>₹{ride.price}</div>
                            <div style={{ color: "#52525b", fontSize: "0.7rem" }}>per seat</div>
                          </div>
                          <button
                            className="ghost-btn"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", whiteSpace: "nowrap" }}
                            onClick={() => togglePassengers(ride.id)}
                          >
                            {isOpen ? "▲ Hide" : "👥 Passengers"}
                          </button>
                        </div>
                      </div>

                      {/* Passengers panel (expanded) */}
                      {isOpen && (
                        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <PassengersPanel rideId={ride.id} />
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
                  <button className="glow-btn" style={{ padding: "0.65rem 1.5rem", fontSize: "0.85rem" }} onClick={() => navigate("/post-ride")}>
                    + Post Another Ride
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: My Vehicles
        ════════════════════════════════════════ */}
        {tab === "vehicles" && (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#f4f4f5", margin: 0 }}>My Vehicles</p>
                <p style={{ color: "#71717a", fontSize: "0.82rem", margin: "0.2rem 0 0 0" }}>Vehicles you use when posting rides</p>
              </div>
              {!showAddVehicle && (
                <button className="glow-btn" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem" }}
                  onClick={() => { setShowAddVehicle(true); setAddError(""); }}>
                  + Add Vehicle
                </button>
              )}
            </div>

            {showAddVehicle && (
              <AddVehicleForm
                onAdd={handleAddVehicle}
                adding={adding}
                addError={addError}
                onCancel={() => { setShowAddVehicle(false); setAddError(""); }}
              />
            )}

            {vehiclesLoading ? (
              <div className="card-dark" style={{ padding: "3rem", textAlign: "center", marginTop: "1rem" }}>
                <div style={{ width: 24, height: 24, border: "3px solid rgba(231,226,71,0.2)", borderTopColor: "#e7e247", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 0.75rem" }} />
                <div style={{ color: "#52525b", fontSize: "0.85rem" }}>Loading vehicles…</div>
              </div>
            ) : vehicles.length === 0 && !showAddVehicle ? (
              <div className="card-dark" style={{ padding: "3.5rem 2rem", textAlign: "center", marginTop: "1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚘</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#71717a", marginBottom: "0.4rem" }}>No vehicles added yet</div>
                <div style={{ color: "#52525b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>Add a vehicle to start posting rides</div>
                <button className="glow-btn" style={{ padding: "0.65rem 1.5rem", fontSize: "0.85rem" }}
                  onClick={() => setShowAddVehicle(true)}>
                  Add Your First Vehicle →
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem", marginTop: "1rem" }}>
                {vehicles.map((v) => (
                  <div key={v.id} className="vehicle-card">
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ width: 36, height: 36, background: "rgba(231,226,71,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                          🚘
                        </div>
                        <div>
                          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f4f4f5" }}>{v.model}</div>
                          <div style={{ color: "#52525b", fontSize: "0.73rem", fontFamily: "monospace", marginTop: "0.1rem" }}>{v.plateNumber}</div>
                        </div>
                      </div>
                      <span style={{ background: "rgba(231,226,71,0.08)", border: "1px solid rgba(231,226,71,0.15)", borderRadius: 6, padding: "0.15rem 0.45rem", fontSize: "0.7rem", color: "#e7e247", flexShrink: 0 }}>
                        #{v.id}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "0.2rem 0.55rem", color: "#a1a1aa", fontSize: "0.75rem" }}>
                        🎨 {v.color}
                      </span>
                      <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "0.2rem 0.55rem", color: "#a1a1aa", fontSize: "0.75rem" }}>
                        💺 {v.seatCapacity} seats
                      </span>
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
