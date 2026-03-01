import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import AuthNavbar from "../components/AuthNavbar";
import { AlertBanner, PageShell } from "../components/ui";
import { AUTH_STYLES } from "../styles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }

    setLoading(true);
    try {
      // Clear any old token first
      localStorage.removeItem("token");

      const token = await apiRequest("/api/auth/login", "POST", { email, password }).then((r) =>
        r.text()
      );
      localStorage.setItem("token", token);
      navigate("/rides");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <style>{AUTH_STYLES}</style>
      <AuthNavbar rightLabel="Don't have an account? Sign up →" rightHref="/register" />

      <div style={{ marginTop: "4.5rem", width: "100%", maxWidth: 440 }}>
        {/* Badge + heading */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(61,59,48,0.5)", border: "1px solid rgba(231,226,71,0.12)", borderRadius: "9999px", padding: "0.35rem 0.85rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 7, height: 7, background: "#e7e247", borderRadius: "50%" }} />
            <span style={{ color: "#a1a1aa", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Secure Sign In</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", margin: 0, lineHeight: 1.15 }}>
            Welcome back
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem", marginTop: "0.5rem" }}>Sign in to manage your rides</p>
        </div>

        <div className="card-dark" style={{ borderRadius: 20, padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label>Email address</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label style={{ margin: 0 }}>Password</label>
                <a href="#" style={{ fontSize: "0.78rem" }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-field"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <AlertBanner message={error} type="err" />

            <button
              type="submit"
              className="glow-btn"
              style={{ marginTop: "0.25rem", padding: "0.9rem", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", width: "100%", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              disabled={loading}
            >
              {loading && (
                <span style={{ width: 14, height: 14, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              )}
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.82rem", marginTop: "1.5rem", marginBottom: 0 }}>
            New to RideShare? <a href="/register">Create an account</a>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginTop: "1.5rem" }}>
          {["🔒 Encrypted", "🛡️ Verified", "⚡ Instant"].map((t) => (
            <span key={t} style={{ color: "#3f3f46", fontSize: "0.75rem" }}>{t}</span>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
