import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import AuthNavbar from "../components/AuthNavbar";
import { AlertBanner, PageShell } from "../components/ui";
import { AUTH_STYLES } from "../styles";

// ─── Extra styles scoped to this page ─────────────────────────────────────────
const OTP_STYLES = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(231,226,71,0.4); }
    70%  { box-shadow: 0 0 0 10px rgba(231,226,71,0); }
    100% { box-shadow: 0 0 0 0 rgba(231,226,71,0); }
  }
  @keyframes success-pop {
    0%   { transform: scale(0.5); opacity: 0; }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  .otp-box-wrap { display: flex; gap: 0.6rem; justify-content: center; }
  .otp-box {
    width: 52px; height: 60px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px; color: #f4f4f5;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.4rem;
    text-align: center; outline: none; caret-color: #e7e247;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
  }
  .otp-box:focus {
    border-color: rgba(231,226,71,0.6);
    background: rgba(231,226,71,0.05);
    transform: translateY(-2px);
    animation: pulse-ring 1.2s ease;
  }
  .otp-box.filled {
    border-color: rgba(231,226,71,0.35);
    background: rgba(231,226,71,0.04);
  }
  .otp-box.error-box {
    border-color: rgba(239,68,68,0.5);
    animation: shake 0.45s ease;
  }
  .otp-box.success-box {
    border-color: rgba(34,197,94,0.5);
    background: rgba(34,197,94,0.05);
    color: #86efac;
  }
  .success-icon {
    width: 64px; height: 64px;
    background: rgba(34,197,94,0.12);
    border: 1.5px solid rgba(34,197,94,0.3);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; margin: 0 auto 1.25rem;
    animation: success-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .resend-btn {
    background: none; border: none; cursor: pointer;
    color: #e7e247; font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
    text-decoration: underline; padding: 0;
    transition: opacity 0.2s;
  }
  .resend-btn:disabled { color: #52525b; text-decoration: none; cursor: not-allowed; opacity: 0.6; }
  .email-chip {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(231,226,71,0.08); border: 1px solid rgba(231,226,71,0.15);
    border-radius: 999px; padding: 0.25rem 0.75rem;
    color: #e7e247; font-size: 0.8rem; margin-top: 0.4rem;
  }
  .verify-btn {
    width: 100%; padding: 0.9rem; border-radius: 12px;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem;
  }
  .countdown-bar {
    height: 2px; border-radius: 99px; background: rgba(231,226,71,0.15);
    overflow: hidden; margin-top: 1rem;
  }
  .countdown-fill {
    height: 100%; background: #e7e247;
    transition: width 1s linear;
  }
`;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OtpVerification() {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");
  const [hasShaken, setHasShaken] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // ── Retrieve email stored during registration ──────────────────────────────
  const email = localStorage.getItem("pendingEmail") || "";

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect to login after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login"), 2200);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // ── OTP box key handling ────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    // Allow only a single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  // Handle paste — spread digits across boxes
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const otpValue = digits.join("");
  const isComplete = otpValue.length === OTP_LENGTH;

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!isComplete) { setError("Please fill in all 6 digits."); return; }
    if (!email) { setError("Session expired. Please register again."); return; }

    setLoading(true);
    setError("");
    try {
      await apiRequest("/api/auth/verify-otp", "POST", { email, otp: otpValue });
      setSuccess(true);
      localStorage.removeItem("pendingEmail");
    } catch {
      setError("Invalid or expired OTP. Please try again.");
      setHasShaken(true);
      setTimeout(() => setHasShaken(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all digits filled
  useEffect(() => {
    if (isComplete && !loading && !success) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, otpValue]);

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  // NOTE: The backend does not currently expose POST /api/auth/resend-otp.
  // This wires up to that endpoint so it will work as soon as the backend adds it.
  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendMsg("");
    setError("");
    try {
      await apiRequest("/api/auth/resend-otp", "POST", { email });
      setResendMsg("A new OTP has been sent to your email.");
      setResendCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setError("Could not resend OTP. Please try again.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <PageShell style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <style>{AUTH_STYLES + OTP_STYLES}</style>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div className="card-dark" style={{ padding: "2.5rem 2rem" }}>
            <div className="success-icon">✅</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#f4f4f5", margin: "0 0 0.5rem" }}>
              Email Verified!
            </h2>
            <p style={{ color: "#71717a", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              Your account is ready. Redirecting you to login…
            </p>
            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#e7e247", animation: `pulse-ring 1.4s ease ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <style>{AUTH_STYLES + OTP_STYLES}</style>
      <AuthNavbar rightLabel="Back to login →" rightHref="/login" />

      <div style={{ marginTop: "5rem", width: "100%", maxWidth: 440, paddingBottom: "2rem" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(61,59,48,0.5)", border: "1px solid rgba(231,226,71,0.12)", borderRadius: "9999px", padding: "0.35rem 0.85rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 7, height: 7, background: "#e7e247", borderRadius: "50%", animation: "pulse-ring 2s ease infinite" }} />
            <span style={{ color: "#a1a1aa", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Check your inbox</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#f4f4f5", margin: 0, lineHeight: 1.15 }}>
            Verify Your Email
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            We sent a 6-digit code to
          </p>
          {email && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span className="email-chip">
                <span>✉</span>
                {email}
              </span>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="card-dark" style={{ padding: "2rem" }}>

          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* OTP Boxes */}
            <div>
              <label style={{ textAlign: "center", display: "block", marginBottom: "1rem" }}>
                Enter OTP
              </label>
              <div className="otp-box-wrap" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    className={[
                      "otp-box",
                      d ? "filled" : "",
                      hasShaken && error ? "error-box" : "",
                    ].join(" ")}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    autoComplete="one-time-code"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="countdown-bar">
                <div className="countdown-fill" style={{ width: `${(digits.filter(Boolean).length / OTP_LENGTH) * 100}%` }} />
              </div>
            </div>

            {/* Feedback */}
            <AlertBanner message={error} type="err" />
            <AlertBanner message={resendMsg} type="ok" />

            {/* Submit */}
            <button
              type="submit"
              className="glow-btn verify-btn"
              disabled={loading || !isComplete}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {loading && (
                <span style={{ width: 14, height: 14, border: "2px solid rgba(26,26,22,0.4)", borderTopColor: "#1a1a16", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              )}
              {loading ? "Verifying…" : "✓ Verify OTP"}
            </button>

          </form>

          {/* Resend */}
          <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#52525b", fontSize: "0.82rem" }}>
            Didn't receive the code?{" "}
            {resendCooldown > 0 ? (
              <span style={{ color: "#71717a" }}>Resend in {resendCooldown}s</span>
            ) : (
              <button className="resend-btn" onClick={handleResend} type="button">
                Resend OTP
              </button>
            )}
          </div>

          <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.82rem", marginTop: "1rem", marginBottom: 0 }}>
            Wrong account? <a href="/register">Register again</a>
          </p>
        </div>

        {/* Tips row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "1.25rem" }}>
          {[["📧", "Check spam folder"], ["⏱", "Valid for 10 mins"], ["🔒", "Don't share OTP"]].map(([icon, txt]) => (
            <div key={txt} style={{ textAlign: "center", padding: "0.6rem", background: "rgba(61,59,48,0.2)", borderRadius: 10, border: "1px solid rgba(231,226,71,0.06)" }}>
              <div style={{ fontSize: "1rem" }}>{icon}</div>
              <div style={{ color: "#52525b", fontSize: "0.7rem", marginTop: "0.2rem" }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
