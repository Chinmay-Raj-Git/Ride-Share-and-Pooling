import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "./ui";

const NAV_LINKS = [
  ["Browse Rides", "/rides"],
  ["Post a Ride", "/post-ride"],
  ["My Bookings", "/bookings"],
];

/**
 * Authenticated navigation bar with:
 * - Logo (links to /rides)
 * - Page nav links (highlighted by current route)
 * - Avatar with dropdown (profile, bookings, post ride, sign out)
 *
 * @param {{ user: object|null }} props
 */
export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const initials = user
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      className="nav-blur"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <div style={{ cursor: "pointer" }} onClick={() => navigate("/rides")}>
        <Logo />
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "0.3rem" }}>
        {NAV_LINKS.map(([label, path]) => (
          <button
            key={path}
            className={`tab-btn ${location.pathname === path ? "on" : "off"}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Avatar + dropdown */}
      <div style={{ position: "relative" }} ref={ref}>
        <div
          className="avatar-circle"
          style={{ width: 38, height: 38, fontSize: "0.85rem" }}
          onClick={() => setOpen(!open)}
        >
          {initials}
        </div>

        {open && (
          <div className="dropdown-menu">
            {user && (
              <div
                style={{
                  padding: "0.5rem 0.8rem 0.65rem",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  marginBottom: "0.35rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: "#f4f4f5",
                  }}
                >
                  {user.name}
                </div>
                <div style={{ color: "#52525b", fontSize: "0.74rem", marginTop: "0.15rem" }}>
                  {user.email}
                </div>
              </div>
            )}
            <div className="drop-item" onClick={() => { navigate("/profile"); setOpen(false); }}>
              👤 My Profile
            </div>
            <div className="drop-item" onClick={() => { navigate("/bookings"); setOpen(false); }}>
              📋 My Bookings
            </div>
            <div className="drop-item" onClick={() => { navigate("/post-ride"); setOpen(false); }}>
              🚗 Post a Ride
            </div>
            <div className="divider-line" />
            <div className="drop-item danger" onClick={handleLogout}>
              🚪 Sign Out
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
