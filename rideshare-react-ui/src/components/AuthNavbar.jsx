import { useNavigate } from "react-router-dom";
import { Logo } from "./ui";

/**
 * Minimal nav bar for auth pages (login / register).
 * Shows logo + a contextual link on the right.
 *
 * @param {{ rightLabel: string, rightHref: string }} props
 */
export default function AuthNavbar({ rightLabel, rightHref }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "1.25rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(26,26,22,0.7)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(231,226,71,0.07)",
        zIndex: 50,
      }}
    >
      <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <Logo />
      </div>
      <a href={rightHref} style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>
        {rightLabel.split("→")[0]}
        <span style={{ color: "#e7e247" }}>→</span>
      </a>
    </div>
  );
}
