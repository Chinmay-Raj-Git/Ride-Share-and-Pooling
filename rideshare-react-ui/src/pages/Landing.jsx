import { useState, useEffect, useRef } from "react";

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

export default function RideShareLanding() {
  const [activeTab, setActiveTab] = useState("post");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const steps = activeTab === "post" ? STEPS_POST : STEPS_GET;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        .yellow { color: #e7e247; }
        .bg-yellow { background-color: #e7e247; }
        .border-yellow { border-color: #e7e247; }
        .hero-grad {
          background: radial-gradient(ellipse 80% 60% at 60% 40%, rgba(231,226,71,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 80% at 10% 80%, rgba(77,80,97,0.4) 0%, transparent 60%),
                      #1a1a16;
        }
        .card-dark { background: rgba(61,59,48,0.35); border: 1px solid rgba(231,226,71,0.1); backdrop-filter: blur(8px); }
        .pill-tab { transition: all 0.3s ease; }
        .pill-tab.active { background-color: #e7e247; color: #1a1a16; }
        .pill-tab:not(.active) { background: rgba(61,59,48,0.5); color: #a1a1aa; }
        .step-num { font-family: 'Syne', sans-serif; font-size: 3.5rem; font-weight: 800; line-height: 1; color: rgba(231,226,71,0.15); }
        .nav-blur {
          backdrop-filter: blur(16px);
          background: rgba(26,26,22,0.85);
          border-bottom: 1px solid rgba(231,226,71,0.08);
        }
        .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .glow-btn {
          box-shadow: 0 0 0 0 rgba(231,226,71,0.4);
          transition: box-shadow 0.3s ease, transform 0.2s ease;
        }
        .glow-btn:hover {
          box-shadow: 0 0 30px rgba(231,226,71,0.35);
          transform: translateY(-2px);
        }
        .stat-card { border-left: 3px solid #e7e247; }
        .diagonal-sep {
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
        .grid-bg {
          background-image: linear-gradient(rgba(231,226,71,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(231,226,71,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      {/* NAV */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow rounded-full flex items-center justify-center">
              <span className="text-zinc-900 font-display font-800 text-sm">R</span>
            </div>
            <span className="font-display font-700 text-xl tracking-tight">RideShare</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l} href="#" className="text-zinc-400 hover:text-yellow text-sm font-medium transition-colors duration-200">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm text-zinc-300 hover:text-white px-4 py-2 transition-colors">Sign In</button>
            <button className="bg-yellow text-zinc-900 font-display font-700 text-sm px-5 py-2.5 rounded-full glow-btn">
              Get Started
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-zinc-300">
            <div className="w-6 h-0.5 bg-current mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current"></div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden nav-blur px-6 pb-6 pt-2 flex flex-col gap-4">
            {NAV_LINKS.map(l => <a key={l} href="#" className="text-zinc-300 text-sm">{l}</a>)}
            <button className="bg-yellow text-zinc-900 font-display font-700 text-sm px-5 py-3 rounded-full w-full mt-2">Get Started</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero-grad diagonal-sep min-h-screen flex items-center pt-20 pb-32 relative overflow-hidden grid-bg">
        <div className="absolute inset-0 grid-bg opacity-60"></div>

        {/* Decorative floating circles */}
        <div className="absolute top-32 right-16 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(231,226,71,0.08) 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-24 left-8 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(77,80,97,0.4) 0%, transparent 70%)" }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-zinc-800 bg-opacity-60 border border-zinc-700 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
              <span className="text-zinc-300 text-xs font-medium tracking-wide">The smarter way to travel together</span>
            </div>

            <h1 className="font-display font-800 text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
              Share the Road.<br />
              <span className="yellow">Split the Cost.</span>
            </h1>

            <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-8">
              RideShare connects drivers with empty seats to riders going the same way. Post a ride, find a ride — it's that simple.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button className="bg-yellow text-zinc-900 font-display font-700 px-7 py-4 rounded-full text-base glow-btn">
                🚗 Post a Ride
              </button>
              <button className="border border-zinc-600 text-zinc-200 hover:border-yellow hover:text-yellow font-display font-600 px-7 py-4 rounded-full text-base transition-all duration-200">
                🔍 Find a Ride
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-slate-500", "bg-yellow", "bg-zinc-500", "bg-slate-600"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-zinc-900`}></div>
                ))}
              </div>
              <p className="text-zinc-400 text-sm"><span className="text-zinc-200 font-medium">12,000+ riders</span> joined this week</p>
            </div>
          </div>

          {/* Hero visual card */}
          <div className="hidden md:block relative">
            <div className="card-dark rounded-2xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Live Rides Near You</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
                  <span className="text-yellow text-xs">Live</span>
                </div>
              </div>

              {[
                { from: "Downtown", to: "Airport", seats: 2, price: "$12", time: "8:30 AM", driver: "A" },
                { from: "Midtown", to: "Business Park", seats: 3, price: "$8", time: "9:00 AM", driver: "B" },
                { from: "Suburbs", to: "City Centre", seats: 1, price: "$15", time: "9:15 AM", driver: "C" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2 hover:bg-zinc-800 hover:bg-opacity-50 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 bg-yellow bg-opacity-20 rounded-full flex items-center justify-center font-display font-700 text-yellow text-sm flex-shrink-0">{r.driver}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm font-medium text-zinc-200">
                      <span className="truncate">{r.from}</span>
                      <span className="text-yellow text-xs">→</span>
                      <span className="truncate">{r.to}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{r.time} · {r.seats} seats left</div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="font-display font-700 text-yellow">{r.price}</span>
                    <div className="text-xs text-zinc-600 text-right">per seat</div>
                  </div>
                </div>
              ))}

              <button className="w-full mt-2 border border-yellow border-opacity-30 text-yellow text-sm py-2.5 rounded-xl hover:bg-yellow hover:bg-opacity-10 transition-colors font-medium">
                View All Rides →
              </button>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-6 card-dark rounded-xl p-3 flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <div>
                <div className="text-xs font-display font-700 text-yellow">2.1 tonnes CO₂</div>
                <div className="text-xs text-zinc-500">saved this week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-zinc-900 py-16 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <AnimSection key={s.label} delay={i * 80}>
              <div className="stat-card pl-4 py-2">
                <div className="font-display font-800 text-3xl text-yellow">{s.value}</div>
                <div className="text-zinc-500 text-sm mt-1">{s.label}</div>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <AnimSection>
            <div className="text-center mb-12">
              <p className="text-yellow text-sm font-medium uppercase tracking-widest mb-3">How It Works</p>
              <h2 className="font-display font-800 text-4xl md:text-5xl text-zinc-100">Two ways to ride with us</h2>
            </div>
          </AnimSection>

          {/* Tabs */}
          <AnimSection delay={100}>
            <div className="flex justify-center gap-3 mb-12">
              <button
                onClick={() => setActiveTab("post")}
                className={`pill-tab font-display font-600 px-6 py-2.5 rounded-full text-sm ${activeTab === "post" ? "active" : ""}`}
              >
                🚗 Post a Ride
              </button>
              <button
                onClick={() => setActiveTab("get")}
                className={`pill-tab font-display font-600 px-6 py-2.5 rounded-full text-sm ${activeTab === "get" ? "active" : ""}`}
              >
                🔍 Get a Ride
              </button>
            </div>
          </AnimSection>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <AnimSection key={step.num} delay={i * 120}>
                <div className="card-dark rounded-2xl p-6 hover-lift h-full">
                  <div className="step-num mb-2">{step.num}</div>
                  <h3 className="font-display font-700 text-xl text-zinc-100 mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>

          <AnimSection delay={400}>
            <div className="flex justify-center mt-10">
              <button className="bg-yellow text-zinc-900 font-display font-700 px-8 py-4 rounded-full glow-btn text-base">
                {activeTab === "post" ? "Post Your First Ride →" : "Find a Ride Now →"}
              </button>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <AnimSection>
            <div className="mb-14">
              <p className="text-yellow text-sm font-medium uppercase tracking-widest mb-3">Platform Features</p>
              <h2 className="font-display font-800 text-4xl md:text-5xl text-zinc-100 max-w-lg leading-tight">
                Built for trust, comfort, and reliability
              </h2>
            </div>
          </AnimSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <AnimSection key={f.title} delay={i * 80}>
                <div className="card-dark rounded-2xl p-6 hover-lift h-full group">
                  <div className="w-12 h-12 bg-yellow bg-opacity-10 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-opacity-20 transition-all">
                    {f.icon}
                  </div>
                  <h3 className="font-display font-700 text-lg text-zinc-100 mb-2">{f.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* WHY RIDESHARE — testimonial/value strip */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(77,80,97,0.2) 0%, transparent 70%)" }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <AnimSection>
            <div>
              <p className="text-yellow text-sm font-medium uppercase tracking-widest mb-3">Why RideShare</p>
              <h2 className="font-display font-800 text-4xl md:text-5xl text-zinc-100 leading-tight mb-6">
                Every seat filled is money saved and fuel saved.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Traditional rideshare apps treat drivers as employees and riders as passengers. We flip the model — on RideShare, drivers are real people going your way, and riders get an affordable, human travel experience.
              </p>
              <div className="flex flex-col gap-3">
                {["No subscriptions. Pay only when you ride.", "Drivers earn back real travel costs.", "Community-driven safety and trust."].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-zinc-900 text-xs font-700">✓</span>
                    </div>
                    <span className="text-zinc-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimSection>

          <AnimSection delay={150}>
            <div className="space-y-4">
              {[
                { quote: "Saved over $200 last month commuting with RideShare. My driver goes the exact same route every day!", name: "Sarah M.", role: "Daily Commuter" },
                { quote: "I fill my car every weekend trip now. Petrol, tolls — covered. And the company makes it fun!", name: "David K.", role: "Weekend Driver" },
              ].map((t, i) => (
                <div key={i} className="card-dark rounded-2xl p-6 hover-lift">
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-yellow bg-opacity-20 rounded-full flex items-center justify-center font-display font-700 text-yellow text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-zinc-200 text-sm font-medium">{t.name}</div>
                      <div className="text-zinc-600 text-xs">{t.role}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, j) => <span key={j} className="text-yellow text-xs">★</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: "#1a1a16" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(231,226,71,0.07) 0%, transparent 70%)" }}></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow to-transparent opacity-20"></div>

        <AnimSection>
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-display font-800 text-5xl md:text-6xl text-zinc-100 leading-tight mb-4">
              Ready to ride <span className="yellow">smarter?</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
              Join over 180,000 drivers and riders who've already made the switch. Your next journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow text-zinc-900 font-display font-700 px-8 py-4 rounded-full text-base glow-btn">
                🚗 Start as a Driver
              </button>
              <button className="border border-zinc-700 hover:border-yellow text-zinc-300 hover:text-yellow font-display font-600 px-8 py-4 rounded-full text-base transition-all duration-200">
                🎒 Start as a Rider
              </button>
            </div>

            <p className="text-zinc-600 text-xs mt-6">Free to join · No monthly fees · Cancel anytime</p>
          </div>
        </AnimSection>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow rounded-full flex items-center justify-center">
              <span className="text-zinc-900 font-display font-800 text-xs">R</span>
            </div>
            <span className="font-display font-700 text-lg">RideShare</span>
          </div>
          <div className="flex gap-6 text-zinc-600 text-sm">
            {["Privacy", "Terms", "Support", "Careers"].map(l => (
              <a key={l} href="#" className="hover:text-zinc-300 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-zinc-700 text-xs">© 2025 RideShare Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
