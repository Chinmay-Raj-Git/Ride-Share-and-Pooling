import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Logo } from "../components/ui";
import { BASE, ANIMATIONS } from "../styles";

// ─── Static data ──────────────────────────────────────────────────────────────
const NAV_LINKS = ["How it Works", "Features", "Why RideShare", "Join Us"];

const STATS = [
  { value: "2.4M+", label: "Rides Completed" },
  { value: "180K+", label: "Active Drivers" },
  { value: "94%", label: "Satisfaction Rate" },
  { value: "60+", label: "Cities Covered" },
];

const STEPS_POST = [
  { num: "01", title: "Set Your Route", desc: "Enter your origin, destination, and departure time. You're the captain of your ride." },
  { num: "02", title: "Set Your Price", desc: "Decide a fair price per seat. Keep it reasonable and fill those empty spots." },
  { num: "03", title: "Approve Riders", desc: "Review booking requests and confirm who joins you on the road." },
];

const STEPS_GET = [
  { num: "01", title: "Search a Ride", desc: "Filter by destination, date, price or departure point. Find rides that match your journey." },
  { num: "02", title: "Pick Your Seat", desc: "Browse driver profiles, ratings, and car details before you commit." },
  { num: "03", title: "Book & Pay", desc: "Secure your seat with a seamless in-app payment. No cash, no hassle." },
];

const FEATURES = [
  { icon: "🛡️", title: "Verified Profiles", desc: "Every driver and rider is ID-verified before they hit the road." },
  { icon: "💳", title: "Secure Payments", desc: "End-to-end encrypted payments with instant confirmations." },
  { icon: "🔔", title: "Real-time Alerts", desc: "Live ride tracking and push notifications keep you informed." },
  { icon: "⭐", title: "Rating System", desc: "Two-way ratings build a community of trusted travellers." },
  { icon: "🗺️", title: "Smart Matching", desc: "Intelligent route matching finds the best rides for your journey." },
  { icon: "🌱", title: "Eco Impact", desc: "Track your carbon savings every time you share a ride." },
];

const TESTIMONIALS = [
  { quote: "Saved over $200 last month commuting with RideShare. My driver goes the exact same route every day!", name: "Sarah M.", role: "Daily Commuter" },
  { quote: "I fill my car every weekend trip now. Petrol, tolls — covered. And the company makes it fun!", name: "David K.", role: "Weekend Driver" },
];

const WHY_POINTS = [
  "No subscriptions. Pay only when you ride.",
  "Drivers earn back real travel costs.",
  "Community-driven safety and trust.",
];

const MOCK_RIDES = [
  { from: "Downtown", to: "Airport", seats: 2, price: "₹12", time: "8:30 AM", driver: "A" },
  { from: "Midtown", to: "Business Park", seats: 3, price: "₹8", time: "9:00 AM", driver: "B" },
  { from: "Suburbs", to: "City Centre", seats: 1, price: "₹15", time: "9:15 AM", driver: "C" },
];

// ─── Landing-specific styles ──────────────────────────────────────────────────
const LANDING_STYLES = `
  ${BASE}
  ${ANIMATIONS}
  .font-display { font-family: 'Syne', sans-serif; }
  .yellow { color: #e7e247; }
  .bg-yellow { background-color: #e7e247; }
  .hero-grad {
    background:
      radial-gradient(ellipse 80% 60% at 60% 40%, rgba(231,226,71,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 60% 80% at 10% 80%, rgba(77,80,97,0.4) 0%, transparent 60%),
      #1a1a16;
  }
  .card-dark { background: rgba(61,59,48,0.35); border: 1px solid rgba(231,226,71,0.1); backdrop-filter: blur(8px); }
  .pill-tab { transition: all 0.3s ease; }
  .pill-tab.active { background-color: #e7e247; color: #1a1a16; }
  .pill-tab:not(.active) { background: rgba(61,59,48,0.5); color: #a1a1aa; }
  .step-num { font-family: 'Syne', sans-serif; font-size: 3.5rem; font-weight: 800; line-height: 1; color: rgba(231,226,71,0.15); }
  .nav-blur { backdrop-filter: blur(16px); background: rgba(26,26,22,0.85); border-bottom: 1px solid rgba(231,226,71,0.08); }
  .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
  .glow-btn { box-shadow: 0 0 0 0 rgba(231,226,71,0.4); transition: box-shadow 0.3s ease, transform 0.2s ease; }
  .glow-btn:hover { box-shadow: 0 0 30px rgba(231,226,71,0.35); transform: translateY(-2px); }
  .stat-card { border-left: 3px solid #e7e247; }
  .diagonal-sep { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }
  .grid-bg {
    background-image:
      linear-gradient(rgba(231,226,71,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(231,226,71,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
`;

// ─── useInView animation hook ─────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function AnimSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("post");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePostRide = () => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    navigate("/rides?mode=post");
  };

  const steps = activeTab === "post" ? STEPS_POST : STEPS_GET;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans overflow-x-hidden">
      <style>{LANDING_STYLES}</style>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo /></Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l} href="#" className="text-zinc-400 hover:text-yellow text-sm font-medium transition-colors duration-200">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <button className="text-sm text-zinc-300 hover:text-white px-4 py-2 transition-colors">Sign In</button>
            </Link>
            <Link to="/rides">
              <button className="bg-yellow text-zinc-900 font-display font-700 text-sm px-5 py-2.5 rounded-full glow-btn" style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
                Get Started
              </button>
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-zinc-300">
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current" />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden nav-blur px-6 pb-6 pt-2 flex flex-col gap-4">
            {NAV_LINKS.map((l) => <a key={l} href="#" className="text-zinc-300 text-sm">{l}</a>)}
            <Link to="/rides">
              <button className="bg-yellow text-zinc-900 text-sm px-5 py-3 rounded-full w-full mt-2" style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
                Get Started
              </button>
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-grad diagonal-sep min-h-screen flex items-center pt-20 pb-32 relative overflow-hidden grid-bg">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-32 right-16 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(231,226,71,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-24 left-8 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(77,80,97,0.4) 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-6" style={{ background: "rgba(39,39,42,0.6)", border: "1px solid rgba(63,63,70,1)", borderRadius: 9999, padding: "0.35rem 0.85rem" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e7e247" }} />
              <span className="text-zinc-300 text-xs font-medium tracking-wide">The smarter way to travel together</span>
            </div>

            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }} className="text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Share the Road.<br />
              <span style={{ color: "#e7e247" }}>Split the Cost.</span>
            </h1>

            <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-8">
              RideShare connects drivers with empty seats to riders going the same way. Post a ride, find a ride — it's that simple.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button onClick={handlePostRide} className="glow-btn text-zinc-900 px-7 py-4 rounded-full text-base" style={{ background: "#e7e247", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
                🚗 Post a Ride
              </button>
              <button onClick={() => navigate("/rides")} className="border text-zinc-200 hover:text-yellow font-display px-7 py-4 rounded-full text-base transition-all duration-200" style={{ border: "1px solid rgba(82,82,91,1)", background: "none", color: "#e4e4e7", fontFamily: "Syne, sans-serif", fontWeight: 600, cursor: "pointer" }}>
                🔍 Find a Ride
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#64748b", "#e7e247", "#71717a", "#475569"].map((c, i) => (
                  <div key={i} style={{ width: 32, height: 32, background: c, borderRadius: "50%", border: "2px solid #18181b" }} />
                ))}
              </div>
              <p className="text-zinc-400 text-sm"><span className="text-zinc-200 font-medium">12,000+ riders</span> joined this week</p>
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden md:block relative">
            <div className="card-dark rounded-2xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <span style={{ color: "#71717a", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Rides Near You</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e7e247" }} />
                  <span style={{ color: "#e7e247", fontSize: "0.75rem" }}>Live</span>
                </div>
              </div>

              {MOCK_RIDES.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2 hover:bg-zinc-800 transition-colors cursor-pointer" style={{ borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, background: "rgba(231,226,71,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.85rem", flexShrink: 0 }}>{r.driver}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", fontWeight: 500, color: "#e4e4e7" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.from}</span>
                      <span style={{ color: "#e7e247", fontSize: "0.75rem" }}>→</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.to}</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{r.time} · {r.seats} seats left</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247" }}>{r.price}</span>
                    <div style={{ fontSize: "0.68rem", color: "#52525b" }}>per seat</div>
                  </div>
                </div>
              ))}

              <button onClick={() => navigate("/rides")} style={{ width: "100%", marginTop: 8, border: "1px solid rgba(231,226,71,0.3)", background: "none", color: "#e7e247", fontSize: "0.85rem", padding: "0.65rem", borderRadius: 12, cursor: "pointer" }}>
                View All Rides →
              </button>
            </div>

            <div className="card-dark absolute -bottom-4 -left-6 rounded-xl p-3 flex items-center gap-2">
              <span style={{ fontSize: "1.5rem" }}>🌱</span>
              <div>
                <div style={{ fontSize: "0.75rem", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247" }}>2.1 tonnes CO₂</div>
                <div style={{ fontSize: "0.72rem", color: "#71717a" }}>saved this week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#18181b", padding: "4rem 0", borderBottom: "1px solid rgba(39,39,42,1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "1.5rem" }}>
          {STATS.map((s, i) => (
            <AnimSection key={s.label} delay={i * 80}>
              <div className="stat-card" style={{ paddingLeft: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#e7e247" }}>{s.value}</div>
                <div style={{ color: "#71717a", fontSize: "0.85rem", marginTop: "0.25rem" }}>{s.label}</div>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "6rem 0", background: "#18181b" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <AnimSection>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={{ color: "#e7e247", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>How It Works</p>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "#f4f4f5" }}>Two ways to ride with us</h2>
            </div>
          </AnimSection>

          <AnimSection delay={100}>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "3rem" }}>
              {[["post", "🚗 Post a Ride"], ["get", "🔍 Get a Ride"]].map(([k, l]) => (
                <button key={k} className={`pill-tab ${activeTab === k ? "active" : ""}`}
                  onClick={() => setActiveTab(k)}
                  style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, padding: "0.6rem 1.5rem", borderRadius: 9999, fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                  {l}
                </button>
              ))}
            </div>
          </AnimSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "1.25rem" }}>
            {steps.map((step, i) => (
              <AnimSection key={step.num} delay={i * 120}>
                <div className="card-dark hover-lift" style={{ borderRadius: 20, padding: "1.5rem", height: "100%" }}>
                  <div className="step-num" style={{ marginBottom: "0.5rem" }}>{step.num}</div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#f4f4f5", marginBottom: "0.5rem" }}>{step.title}</h3>
                  <p style={{ color: "#71717a", fontSize: "0.85rem", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>

          <AnimSection delay={400}>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
              <button onClick={() => navigate(activeTab === "post" ? "/post-ride" : "/rides")}
                className="glow-btn"
                style={{ background: "#e7e247", color: "#1a1a16", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, padding: "1rem 2rem", borderRadius: 9999, fontSize: "0.95rem", cursor: "pointer" }}>
                {activeTab === "post" ? "Post Your First Ride →" : "Find a Ride Now →"}
              </button>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "6rem 0", background: "#09090b" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <AnimSection>
            <div style={{ marginBottom: "3.5rem" }}>
              <p style={{ color: "#e7e247", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Platform Features</p>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "#f4f4f5", maxWidth: 480, lineHeight: 1.2 }}>
                Built for trust, comfort, and reliability
              </h2>
            </div>
          </AnimSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "1.25rem" }}>
            {FEATURES.map((f, i) => (
              <AnimSection key={f.title} delay={i * 80}>
                <div className="card-dark hover-lift" style={{ borderRadius: 20, padding: "1.5rem", height: "100%" }}>
                  <div style={{ width: 48, height: 48, background: "rgba(231,226,71,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1rem" }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#f4f4f5", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ color: "#71717a", fontSize: "0.85rem", lineHeight: 1.55 }}>{f.desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY RIDESHARE ── */}
      <section style={{ padding: "6rem 0", background: "#18181b", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(77,80,97,0.2) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "4rem", alignItems: "center" }}>
          <AnimSection>
            <div>
              <p style={{ color: "#e7e247", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Why RideShare</p>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#f4f4f5", lineHeight: 1.25, marginBottom: "1.25rem" }}>
                Every seat filled is money saved and fuel saved.
              </h2>
              <p style={{ color: "#71717a", lineHeight: 1.7, marginBottom: "1.75rem", fontSize: "0.95rem" }}>
                Traditional rideshare apps treat drivers as employees and riders as passengers. We flip the model — on RideShare, drivers are real people going your way, and riders get an affordable, human travel experience.
              </p>
              {WHY_POINTS.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: 20, height: 20, background: "#e7e247", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ color: "#1a1a16", fontSize: "0.7rem", fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ color: "#d4d4d8", fontSize: "0.9rem" }}>{item}</span>
                </div>
              ))}
            </div>
          </AnimSection>

          <AnimSection delay={150}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="card-dark hover-lift" style={{ borderRadius: 20, padding: "1.5rem" }}>
                  <p style={{ color: "#d4d4d8", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "1rem" }}>"{t.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 36, height: 36, background: "rgba(231,226,71,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#e7e247", fontSize: "0.85rem" }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ color: "#e4e4e7", fontSize: "0.85rem", fontWeight: 500 }}>{t.name}</div>
                      <div style={{ color: "#52525b", fontSize: "0.75rem" }}>{t.role}</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                      {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#e7e247", fontSize: "0.75rem" }}>★</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "6rem 0", background: "#1a1a16", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(231,226,71,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(to right, transparent, rgba(231,226,71,0.2), transparent)" }} />
        <AnimSection>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 1.5rem", textAlign: "center", position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "3rem", color: "#f4f4f5", lineHeight: 1.2, marginBottom: "1rem" }}>
              Ready to ride <span style={{ color: "#e7e247" }}>smarter?</span>
            </h2>
            <p style={{ color: "#71717a", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.65 }}>
              Join over 180,000 drivers and riders who've already made the switch. Your next journey starts here.
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                <button onClick={handlePostRide}
                  className="glow-btn"
                  style={{ background: "#e7e247", color: "#1a1a16", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, padding: "1rem 2rem", borderRadius: 9999, fontSize: "0.95rem", cursor: "pointer" }}>
                  🚗 Start as a Driver
                </button>
                <button onClick={() => navigate("/rides")}
                  style={{ border: "1px solid rgba(82,82,91,1)", background: "none", color: "#d4d4d8", fontFamily: "Syne, sans-serif", fontWeight: 600, padding: "1rem 2rem", borderRadius: 9999, fontSize: "0.95rem", cursor: "pointer" }}>
                  🎒 Start as a Rider
                </button>
              </div>
              <p style={{ color: "#3f3f46", fontSize: "0.78rem" }}>Free to join · No monthly fees · Cancel anytime</p>
            </div>
          </div>
        </AnimSection>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#09090b", borderTop: "1px solid rgba(39,39,42,1)", padding: "2.5rem 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Logo />
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy", "Terms", "Support", "Careers"].map((l) => (
              <a key={l} href="#" style={{ color: "#52525b", fontSize: "0.85rem", textDecoration: "none" }}
                onMouseEnter={(e) => e.target.style.color = "#d4d4d8"}
                onMouseLeave={(e) => e.target.style.color = "#52525b"}>
                {l}
              </a>
            ))}
          </div>
          <p style={{ color: "#3f3f46", fontSize: "0.75rem" }}>© 2025 RideShare Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
