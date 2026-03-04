import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import { PageShell, AlertBanner } from "../components/ui";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useVehicles } from "../hooks/useVehicles";
import { APP_STYLES } from "../styles";

const EXTRA_STYLES = `
  .seat-btn {
    width: 42px; height: 42px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
    cursor: pointer; transition: all 0.2s;
  }
  .seat-btn.selected { background: #e7e247; color: #1a1a16; border: none; box-shadow: 0 0 14px rgba(231,226,71,0.3); }
  .seat-btn.unselected { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #71717a; }
  .seat-btn.unselected:hover { border-color: rgba(231,226,71,0.4); color: #e7e247; }
  .step-badge { background: rgba(231,226,71,0.1); border: 1px solid rgba(231,226,71,0.2); border-radius: 6px; padding: 0.15rem 0.45rem; font-size: 0.72rem; color: #e7e247; }
  .preview-inner { background: rgba(255,255,255,0.03); border: 1px solid rgba(231,226,71,0.12); border-radius: 12px; padding: 1rem 1.1rem; }
  .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.25s ease; }
  .success-box { background: #22221a; border: 1px solid rgba(34,197,94,0.2); border-radius: 20px; padding: 2.25rem; max-width: 420px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.6); text-align: center; animation: slideUp 0.3s ease; }
  .vehicle-option {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    transition: border-color 0.2s, background 0.2s;
  }
  .vehicle-option:hover { border-color: rgba(231,226,71,0.3); background: rgba(231,226,71,0.04); }
  .vehicle-option.selected {
    border-color: rgba(231,226,71,0.55);
    background: rgba(231,226,71,0.07);
    box-shadow: 0 0 0 1px rgba(231,226,71,0.2);
  }
`;

const EMPTY_FORM   = { origin: "", destination: "", departureTime: "", availableSeats: 1, price: "", vehicleId: null };
const EMPTY_ERRORS = { origin: "", destination: "", departureTime: "", price: "", vehicleId: "" };

export default function PostRidePage() {
  const [form, setForm]               = useState(EMPTY_FORM);
  const [errors, setErrors]           = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting]   = useState(false);
  const [apiError, setApiError]       = useState("");
  const [createdRide, setCreatedRide] = useState(null);

  const { user }                         = useCurrentUser();
  const { vehicles, vehiclesLoading }    = useVehicles();
  const navigate                         = useNavigate();

  const setField = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const selectVehicle = (id) => {
    setForm((f) => ({ ...f, vehicleId: id }));
    setErrors((er) => ({ ...er, vehicleId: "" }));
  };

  const validate = () => {
    const e = { ...EMPTY_ERRORS };
    let valid = true;
    if (!form.origin.trim()) { e.origin = "Origin is required"; valid = false; }
    if (!form.destination.trim()) { e.destination = "Destination is required"; valid = false; }
    else if (form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase()) { e.destination = "Origin and destination can't be the same"; valid = false; }
    if (!form.departureTime) { e.departureTime = "Departure time is required"; valid = false; }
    else if (new Date(form.departureTime) <= new Date()) { e.departureTime = "Departure must be in the future"; valid = false; }
    if (!form.price || isNaN(form.price) || +form.price <= 0) { e.price = "Enter a valid price greater than 0"; valid = false; }
    if (!form.vehicleId) { e.vehicleId = "Please select a vehicle for this ride"; valid = false; }
    setErrors(e);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      const payload = {
        origin:         form.origin.trim(),
        destination:    form.destination.trim(),
        departureTime:  new Date(form.departureTime).toISOString().slice(0, 19),
        availableSeats: form.availableSeats,
        price:          parseFloat(form.price),
        vehicleId:      form.vehicleId,
      };
      const res = await apiRequest("/api/rides/create", "POST", payload);
      if (res.ok) setCreatedRide(await res.json());
      else setApiError("Failed to post ride. Please try again.");
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasRoute    = form.origin && form.destination;
  const hasTime     = !!form.departureTime;
  const hasPrice    = form.price && !isNaN(form.price) && +form.price > 0;
  const hasVehicle  = !!form.vehicleId;
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  const deptPreview = hasTime
    ? new Date(form.departureTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const step1done = !!(form.origin && form.destination);
  const step2done = !!(step1done && form.departureTime);
  const step3done = !!(step2done && form.price);
  const step4done = !!(step3done && form.vehicleId);

  // ── Success screen ──────────────────────────────────────────────────────────
  if (createdRide) {
    const v = createdRide.vehicle;
    return (
      <div className="success-overlay">
        <style>{APP_STYLES + EXTRA_STYLES}</style>
        <div className="success-box">
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎉</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#f4f4f5", margin: "0 0 0.5rem 0" }}>Ride Posted!</h2>
          <p style={{ color: "#71717a", fontSize: "0.88rem", lineHeight: 1.6, margin: "0 0 1.5rem 0" }}>
            Your ride from <strong style={{ color: "#f4f4f5" }}>{createdRide.origin}</strong> to{" "}
            <strong style={{ color: "#f4f4f5" }}>{createdRide.destination}</strong> is now live.
          </p>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
            {[
              ["🕐", "Departure",      `${createdRide.departureTime.split("T")[0]} · ${createdRide.departureTime.split("T")[1].substring(0, 5)}`],
              ["💺", "Seats",          `${createdRide.availableSeats} available`],
              ["💰", "Price per Seat", `₹${createdRide.price}`],
              ...(v ? [["🚘", "Vehicle", `${v.model} · ${v.plateNumber}`]] : []),
              ["🔖", "Ride ID",        `RS-${String(createdRide.id).padStart(5, "0")}`],
            ].map(([icon, k, val]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#71717a", fontSize: "0.8rem" }}>{icon} {k}</span>
                <span style={{ color: "#d4d4d8", fontSize: "0.82rem", fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="ghost-btn" style={{ flex: 1, padding: "0.75rem", fontSize: "0.85rem" }}
              onClick={() => { setCreatedRide(null); setForm(EMPTY_FORM); setErrors(EMPTY_ERRORS); }}>
              + Post Another
            </button>
            <button className="glow-btn" style={{ flex: 1, padding: "0.75rem", fontSize: "0.85rem" }} onClick={() => navigate("/rides")}>
              Browse Rides →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <style>{APP_STYLES + EXTRA_STYLES}</style>
      <Navbar user={user} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.72rem", color: "#e7e247", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.3rem 0" }}>Driver Dashboard</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", lineHeight: 1.15, margin: "0 0 0.4rem 0" }}>Post a Ride</h1>
          <p style={{ color: "#71717a", fontSize: "0.88rem", margin: 0 }}>Fill your empty seats and split the cost of your journey.</p>
        </div>

        {/* Step tracker — now 4 steps */}
        <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
          {[
            [step1done, "Route",   1],
            [step2done, "Time",    2],
            [step3done, "Pricing", 3],
            [step4done, "Vehicle", 4],
          ].map(([done, label, num], i, arr) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.8rem",
                  flexShrink: 0, transition: "all 0.3s",
                  background: done ? "rgba(34,197,94,0.15)" : "transparent",
                  border: `2px solid ${done ? "rgba(34,197,94,0.4)" : "rgba(231,226,71,0.2)"}`,
                  color: done ? "#86efac" : "#71717a",
                }}>
                  {done ? "✓" : num}
                </div>
                <span style={{ fontSize: "0.65rem", color: done ? "#86efac" : "#52525b", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ flex: 1, height: 1, background: done ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)", width: 32, marginBottom: "1rem", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="card-dark fade-up" style={{ padding: "2rem", marginBottom: "1rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* ── Section 01: Route ── */}
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f4f4f5", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="step-badge">01</span> Route Details
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                {[
                  ["origin",      "From — Origin",      "🟢", "e.g. Downtown"],
                  ["destination", "To — Destination",   "🟡", "e.g. Airport"],
                ].map(([key, lbl, icon, ph]) => (
                  <div key={key}>
                    <label>{lbl}</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", pointerEvents: "none" }}>{icon}</span>
                      <input
                        className={`input-field${errors[key] ? " input-error" : ""}`}
                        style={{ paddingLeft: "2.4rem" }}
                        placeholder={ph}
                        value={form[key]}
                        onChange={setField(key)}
                      />
                    </div>
                    {errors[key] && <p className="field-error">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

            {/* ── Section 02: Departure ── */}
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f4f4f5", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="step-badge">02</span> Departure Time
              </p>
              <div>
                <label>Date & Time</label>
                <input
                  className={`input-field${errors.departureTime ? " input-error" : ""}`}
                  type="datetime-local"
                  value={form.departureTime}
                  onChange={setField("departureTime")}
                  min={new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16)}
                />
                {errors.departureTime
                  ? <p className="field-error">{errors.departureTime}</p>
                  : <p style={{ color: "#52525b", fontSize: "0.75rem", marginTop: "0.4rem" }}>Must be at least 5 minutes from now</p>}
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

            {/* ── Section 03: Seats & Price ── */}
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f4f4f5", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="step-badge">03</span> Seats & Pricing
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
                <div>
                  <label>Available Seats</label>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {[1, 2, 3, 4].map((n) => (
                      <button key={n} type="button"
                        className={`seat-btn ${form.availableSeats === n ? "selected" : "unselected"}`}
                        onClick={() => setForm((f) => ({ ...f, availableSeats: n }))}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <p style={{ color: "#52525b", fontSize: "0.73rem", marginTop: "0.45rem" }}>How many empty seats are you offering?</p>
                </div>
                <div>
                  <label>Price per Seat</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontSize: "0.9rem", fontFamily: "Syne, sans-serif", fontWeight: 700, pointerEvents: "none" }}>₹</span>
                    <input
                      className={`input-field${errors.price ? " input-error" : ""}`}
                      style={{ paddingLeft: "1.8rem" }}
                      type="number" min="0" step="0.5" placeholder="0.00"
                      value={form.price}
                      onChange={setField("price")}
                    />
                  </div>
                  {errors.price && <p className="field-error">{errors.price}</p>}
                  <p style={{ color: "#52525b", fontSize: "0.73rem", marginTop: "0.45rem" }}>Set a fair price to attract riders</p>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

            {/* ── Section 04: Vehicle ── */}
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f4f4f5", margin: "0 0 0.4rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="step-badge">04</span> Select Vehicle
              </p>
              <p style={{ color: "#71717a", fontSize: "0.82rem", margin: "0 0 0.9rem 0" }}>Choose which vehicle you're driving for this ride</p>

              {vehiclesLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#52525b", fontSize: "0.82rem" }}>
                  <span style={{ width: 13, height: 13, border: "2px solid rgba(231,226,71,0.2)", borderTopColor: "#e7e247", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Loading vehicles…
                </div>
              ) : vehicles.length === 0 ? (
                <div style={{ background: "rgba(231,226,71,0.05)", border: "1px solid rgba(231,226,71,0.15)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "#e7e247", fontSize: "0.85rem", fontWeight: 500 }}>No vehicles registered</div>
                    <div style={{ color: "#71717a", fontSize: "0.78rem", marginTop: "0.2rem" }}>You need to add a vehicle before posting a ride</div>
                  </div>
                  <button
                    type="button"
                    className="glow-btn"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                    onClick={() => navigate("/profile", { state: { tab: "vehicles" } })}
                  >
                    Go to Profile →
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {vehicles.map((v) => {
                    const isSelected = form.vehicleId === v.id;
                    return (
                      <div
                        key={v.id}
                        className={`vehicle-option ${isSelected ? "selected" : ""}`}
                        onClick={() => selectVehicle(v.id)}
                      >
                        {/* Radio indicator */}
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isSelected ? "#e7e247" : "rgba(255,255,255,0.2)"}`, background: isSelected ? "#e7e247" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                          {isSelected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1a1a16" }} />}
                        </div>

                        <div style={{ fontSize: "1.1rem" }}>🚘</div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#f4f4f5" }}>{v.model}</div>
                          <div style={{ color: "#71717a", fontSize: "0.75rem", marginTop: "0.1rem" }}>
                            {v.plateNumber} · {v.color} · {v.seatCapacity} seats
                          </div>
                        </div>

                        {isSelected && (
                          <span style={{ background: "rgba(231,226,71,0.12)", border: "1px solid rgba(231,226,71,0.3)", borderRadius: 6, padding: "0.15rem 0.5rem", fontSize: "0.7rem", color: "#e7e247", flexShrink: 0 }}>
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.vehicleId && <p className="field-error" style={{ marginTop: "0.5rem" }}>{errors.vehicleId}</p>}
            </div>

            <AlertBanner message={apiError} type="err" />

            <button type="submit" className="glow-btn" disabled={submitting || vehicles.length === 0}
              style={{ padding: "1rem", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginTop: "0.25rem" }}>
              {submitting && <span style={{ width: 15, height: 15, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
              {submitting ? "Posting your ride…" : "🚗 Post This Ride"}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="card-dark">
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.72rem", color: "#71717a", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 1rem 0" }}>Live Preview</p>

            <div className="preview-inner" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: "0.15rem" }}>
                  <div style={{ width: 9, height: 9, background: hasRoute ? "#22c55e" : "rgba(255,255,255,0.12)", borderRadius: "50%", transition: "background 0.3s" }} />
                  <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)" }} />
                  <div style={{ width: 9, height: 9, background: hasRoute ? "#e7e247" : "rgba(255,255,255,0.12)", borderRadius: 2, transition: "background 0.3s" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: form.origin ? "#a1a1aa" : "#3f3f46", fontSize: "0.82rem", marginBottom: "0.35rem", transition: "color 0.2s" }}>{form.origin || "Origin"}</div>
                  <div style={{ color: form.destination ? "#f4f4f5" : "#3f3f46", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.9rem", transition: "color 0.2s" }}>{form.destination || "Destination"}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "0.25rem 0.6rem", color: hasTime ? "#a1a1aa" : "#3f3f46", fontSize: "0.75rem", transition: "color 0.2s" }}>
                  🕐 {deptPreview}
                </span>
                <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "0.25rem 0.6rem", color: "#a1a1aa", fontSize: "0.75rem" }}>
                  💺 {form.availableSeats} seat{form.availableSeats !== 1 ? "s" : ""}
                </span>
                {hasVehicle && selectedVehicle && (
                  <span style={{ background: "rgba(231,226,71,0.07)", border: "1px solid rgba(231,226,71,0.18)", borderRadius: 7, padding: "0.25rem 0.6rem", color: "#e7e247", fontSize: "0.75rem" }}>
                    🚘 {selectedVehicle.model}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, background: "rgba(231,226,71,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.72rem" }}>
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <span style={{ color: "#71717a", fontSize: "0.78rem" }}>{user?.name || "You (Driver)"}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: hasPrice ? "#e7e247" : "#3f3f46", transition: "color 0.3s" }}>
                  {hasPrice ? `₹${parseFloat(form.price).toFixed(2)}` : "₹—"}
                </div>
                <div style={{ color: "#52525b", fontSize: "0.7rem" }}>per seat</div>
              </div>
            </div>

            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: "0.72rem", color: "#52525b", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 0.6rem 0" }}>Driver Tips</p>
              {[
                ["💡", "Cheaper rides fill faster — keep your price fair"],
                ["🕐", "Post at least 1 hour before departure"],
                ["💬", "Respond quickly to booking requests"],
              ].map(([icon, tip]) => (
                <div key={tip} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.78rem", flexShrink: 0, marginTop: "0.05rem" }}>{icon}</span>
                  <span style={{ color: "#52525b", fontSize: "0.76rem", lineHeight: 1.45 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
