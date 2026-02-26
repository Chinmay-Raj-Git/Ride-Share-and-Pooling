import { useState } from "react";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .page-bg {
    background:
      radial-gradient(ellipse 70% 60% at 20% 10%, rgba(231,226,71,0.08) 0%, transparent 65%),
      radial-gradient(ellipse 50% 70% at 90% 90%, rgba(77,80,97,0.35) 0%, transparent 60%),
      #1a1a16;
    min-height: 100vh;
  }
  .grid-bg {
    background-image:
      linear-gradient(rgba(231,226,71,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(231,226,71,0.035) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .card-dark {
    background: rgba(61,59,48,0.3);
    border: 1px solid rgba(231,226,71,0.1);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 2rem;
  }
  .input-field {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #f4f4f5;
    width: 100%;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .input-field::placeholder { color: #52525b; }
  .input-field:focus {
    border-color: rgba(231,226,71,0.5);
    background: rgba(255,255,255,0.07);
  }
  .glow-btn {
    background-color: #e7e247;
    color: #1a1a16;
    border: none;
    cursor: pointer;
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    width: 100%;
    padding: 0.9rem;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
  }
  .glow-btn:hover {
    box-shadow: 0 0 30px rgba(231,226,71,0.35);
    transform: translateY(-1px);
  }
  .glow-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  label {
    display: block;
    font-size: 0.78rem;
    color: #71717a;
    margin-bottom: 0.4rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  a { color: #e7e247; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }
  .step-dot { width: 8px; height: 8px; border-radius: 50%; transition: background 0.3s; }
  .step-dot.active { background: #e7e247; }
  .step-dot.done { background: rgba(231,226,71,0.5); }
  .step-dot.pending { background: rgba(255,255,255,0.1); }
  .password-strength-bar {
    height: 3px;
    border-radius: 99px;
    transition: width 0.4s ease, background 0.4s ease;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.35s ease forwards; }
`;

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", contact: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(1); // 1 = personal, 2 = account

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Please enter your full name."); return; }
    if (!form.contact.trim()) { setError("Please enter your contact number."); return; }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email) { setError("Please enter your email."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    if (!agreed) { setError("Please agree to the terms to continue."); return; }
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const strength = getStrength(form.password);

  return (
    <div className="page-bg grid-bg" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <style>{SHARED_STYLES}</style>

      {/* Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(26,26,22,0.7)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(231,226,71,0.07)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: "#e7e247", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#1a1a16" }}>R</span>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#f4f4f5" }}>RideShare</span>
        </div>
        <a href="#" style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>Already have an account? <span style={{ color: "#e7e247" }}>Sign in →</span></a>
      </div>

      <div style={{ marginTop: "5rem", width: "100%", maxWidth: 480, paddingBottom: "2rem" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(61,59,48,0.5)", border: "1px solid rgba(231,226,71,0.12)", borderRadius: "9999px", padding: "0.35rem 0.85rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 7, height: 7, background: "#e7e247", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
            <span style={{ color: "#a1a1aa", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Join 180,000+ riders</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", margin: 0, lineHeight: 1.15 }}>Create your account</h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem", marginTop: "0.5rem" }}>Start sharing rides in minutes</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <div className={`step-dot ${step >= 1 ? (step > 1 ? "done" : "active") : "pending"}`}></div>
          <div style={{ width: 32, height: 1, background: step > 1 ? "rgba(231,226,71,0.4)" : "rgba(255,255,255,0.1)" }}></div>
          <div className={`step-dot ${step >= 2 ? "active" : "pending"}`}></div>
          <div style={{ marginLeft: "0.75rem", color: "#71717a", fontSize: "0.75rem" }}>Step {step} of 2</div>
        </div>

        <div className="card-dark">

          {step === 1 && (
            <form onSubmit={handleNext} className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ marginBottom: "0.25rem" }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#f4f4f5", margin: "0 0 0.25rem 0" }}>Personal Details</p>
                <p style={{ color: "#52525b", fontSize: "0.82rem", margin: 0 }}>Tell us a bit about yourself</p>
              </div>

              <div>
                <label>Full Name</label>
                <input className="input-field" placeholder="Jane Doe" value={form.name} onChange={set("name")} />
              </div>

              <div>
                <label>Contact Number</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.85rem", pointerEvents: "none" }}>📱</div>
                  <input className="input-field" style={{ paddingLeft: "2.5rem" }} placeholder="+1 555 000 0000" value={form.contact} onChange={set("contact")} type="tel" />
                </div>
              </div>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "0.65rem 1rem", color: "#fca5a5", fontSize: "0.82rem" }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" className="glow-btn" style={{ marginTop: "0.25rem" }}>
                Continue →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <button type="button" onClick={() => { setStep(1); setError(""); }} style={{ background: "none", border: "none", color: "#e7e247", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>← Back</button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#f4f4f5", margin: "0 0 0.25rem 0" }}>Account Setup</p>
                  <p style={{ color: "#52525b", fontSize: "0.82rem", margin: 0 }}>Secure your account</p>
                </div>
              </div>

              <div>
                <label>Email Address</label>
                <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              </div>

              <div>
                <label>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input-field"
                    type={showPass ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={set("password")}
                    style={{ paddingRight: "3.5rem" }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "0.78rem" }}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "0.3rem" }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="password-strength-bar" style={{ flex: 1, background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.08)" }}></div>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.73rem", color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                  </div>
                )}
              </div>

              <div>
                <label>Confirm Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  style={{ borderColor: form.confirm && form.confirm !== form.password ? "rgba(239,68,68,0.5)" : "" }}
                />
                {form.confirm && form.confirm !== form.password && (
                  <span style={{ fontSize: "0.75rem", color: "#fca5a5", marginTop: "0.3rem", display: "block" }}>Passwords don't match</span>
                )}
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", cursor: "pointer", textTransform: "none", letterSpacing: 0, fontSize: "0.82rem", color: "#71717a" }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: "0.15rem", accentColor: "#e7e247", flexShrink: 0 }}
                />
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "0.65rem 1rem", color: "#fca5a5", fontSize: "0.82rem" }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" className="glow-btn" disabled={loading} style={{ marginTop: "0.25rem" }}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <span style={{ width: 14, height: 14, border: "2px solid #1a1a16", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }}></span>
                    Creating account...
                  </span>
                ) : "🚗 Create Account"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.82rem", marginTop: "1.5rem", marginBottom: 0 }}>
            Already a member? <a href="#">Sign in here</a>
          </p>
        </div>

        {/* Perks */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "1.25rem" }}>
          {[["🆓", "Free to join"], ["🔒", "Secure & private"], ["🌱", "Eco-friendly"]].map(([icon, txt]) => (
            <div key={txt} style={{ textAlign: "center", padding: "0.6rem", background: "rgba(61,59,48,0.2)", borderRadius: 10, border: "1px solid rgba(231,226,71,0.06)" }}>
              <div style={{ fontSize: "1rem" }}>{icon}</div>
              <div style={{ color: "#52525b", fontSize: "0.7rem", marginTop: "0.2rem" }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
