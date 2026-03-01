// ─── Shared UI Primitives ─────────────────────────────────────────────────────

/** Inline spinning loader */
export function Spinner({ size = 14 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: "2px solid rgba(26,26,22,0.35)",
        borderTopColor: "#1a1a16",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

/** Full-page loading screen */
export function LoadingScreen({ message = "Loading…" }) {
  return (
    <div
      className="page-bg grid-bg"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 28,
            height: 28,
            border: "3px solid rgba(231,226,71,0.2)",
            borderTopColor: "#e7e247",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        <div style={{ color: "#52525b", fontSize: "0.85rem" }}>{message}</div>
      </div>
    </div>
  );
}

/**
 * Alert / flash banner.
 * type: "ok" | "err"
 */
export function AlertBanner({ message, type = "ok" }) {
  if (!message) return null;
  const isErr = type === "err";
  return (
    <div
      style={{
        background: isErr ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.08)",
        border: `1px solid ${isErr ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.2)"}`,
        borderRadius: 10,
        padding: "0.65rem 1rem",
        color: isErr ? "#fca5a5" : "#86efac",
        fontSize: "0.82rem",
        marginBottom: "1rem",
      }}
    >
      {isErr ? "⚠ " : "✅ "}
      {message}
    </div>
  );
}

/** RideShare logo mark (the yellow circle with R) */
export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div
        style={{
          width: 32,
          height: 32,
          background: "#e7e247",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#1a1a16" }}
        >
          R
        </span>
      </div>
      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#f4f4f5" }}>
        RideShare
      </span>
    </div>
  );
}

/** Page wrapper — applies page-bg + grid-bg classes */
export function PageShell({ children, style = {} }) {
  return (
    <div className="page-bg grid-bg" style={{ minHeight: "100vh", ...style }}>
      {children}
    </div>
  );
}
