import { useState } from "react";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .font-display { font-family: 'Syne', sans-serif; }
  .yellow { color: #e7e247; }
  .bg-yellow { background-color: #e7e247; }
  .card-dark {
    background: rgba(61,59,48,0.3);
    border: 1px solid rgba(231,226,71,0.1);
    backdrop-filter: blur(12px);
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
  }
  .glow-btn:hover {
    box-shadow: 0 0 30px rgba(231,226,71,0.35);
    transform: translateY(-1px);
  }
  .page-bg {
    background:
      radial-gradient(ellipse 70% 60% at 80% 20%, rgba(231,226,71,0.08) 0%, transparent 65%),
      radial-gradient(ellipse 50% 70% at 10% 90%, rgba(77,80,97,0.35) 0%, transparent 60%),
      #1a1a16;
    min-height: 100vh;
  }
  .grid-bg {
    background-image:
      linear-gradient(rgba(231,226,71,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(231,226,71,0.035) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .social-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #a1a1aa;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
    width: 100%;
  }
  .social-btn:hover {
    border-color: rgba(231,226,71,0.3);
    background: rgba(231,226,71,0.05);
    color: #e7e247;
  }
  label { display: block; font-size: 0.8rem; color: #71717a; margin-bottom: 0.4rem; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; }
  a { color: #e7e247; text-decoration: none; }
  a:hover { text-decoration: underline; }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="page-bg grid-bg" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <style>{SHARED_STYLES}</style>

      {/* Nav Logo */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(26,26,22,0.7)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(231,226,71,0.07)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: "#e7e247", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#1a1a16" }}>R</span>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#f4f4f5" }}>RideShare</span>
        </div>
        <a href="#" style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>Don't have an account? <span style={{ color: "#e7e247" }}>Sign up →</span></a>
      </div>

      {/* Card */}
      <div style={{ marginTop: "4.5rem", width: "100%", maxWidth: 440 }}>
        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(61,59,48,0.5)", border: "1px solid rgba(231,226,71,0.12)", borderRadius: "9999px", padding: "0.35rem 0.85rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 7, height: 7, background: "#e7e247", borderRadius: "50%" }}></div>
            <span style={{ color: "#a1a1aa", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Secure Sign In</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", margin: 0, lineHeight: 1.15 }}>Welcome back</h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem", marginTop: "0.5rem" }}>Sign in to manage your rides</p>
        </div>

        <div className="card-dark" style={{ borderRadius: 20, padding: "2rem" }}>

          {/* Social logins */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1.5rem" }}>
            <button className="social-btn">
              <span style={{ fontSize: "1rem" }}>G</span> Google
            </button>
            <button className="social-btn">
              <span style={{ fontSize: "1rem" }}>◆</span> Apple
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}></div>
            <span style={{ color: "#52525b", fontSize: "0.75rem" }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}></div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label>Email address</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label style={{ margin: 0 }}>Password</label>
                <a href="#" style={{ fontSize: "0.78rem", color: "#e7e247" }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-field"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "0.65rem 1rem", color: "#fca5a5", fontSize: "0.82rem" }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="glow-btn"
              style={{ marginTop: "0.25rem", padding: "0.9rem", borderRadius: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", width: "100%" }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span style={{ width: 14, height: 14, border: "2px solid #1a1a16", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }}></span>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.82rem", marginTop: "1.5rem", marginBottom: 0 }}>
            New to RideShare? <a href="#">Create an account</a>
          </p>
        </div>

        {/* Trust line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginTop: "1.5rem" }}>
          {["🔒 Encrypted", "🛡️ Verified", "⚡ Instant"].map(t => (
            <span key={t} style={{ color: "#3f3f46", fontSize: "0.75rem" }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
