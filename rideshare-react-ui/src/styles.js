// ─── RideShare Design System ──────────────────────────────────────────────────
// All CSS is defined once here and imported by components that need it.
// Pages just compose from CORE_STYLES + any page-specific additions.

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`;

// Base reset + typography
export const BASE = `
  ${FONT_IMPORT}
  * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  body { margin: 0; background: #1a1a16; }
  a { color: #e7e247; text-decoration: none; }
  a:hover { text-decoration: underline; }
  label {
    display: block; font-size: 0.75rem; color: #71717a;
    margin-bottom: 0.4rem; font-weight: 500;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
`;

// Page background + grid overlay
export const PAGE_BG = `
  .page-bg {
    background:
      radial-gradient(ellipse 70% 60% at 70% 10%, rgba(231,226,71,0.08) 0%, transparent 65%),
      radial-gradient(ellipse 50% 70% at 10% 90%, rgba(77,80,97,0.35) 0%, transparent 60%),
      #1a1a16;
    min-height: 100vh;
  }
  .grid-bg {
    background-image:
      linear-gradient(rgba(231,226,71,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(231,226,71,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }
`;

// Cards
export const CARDS = `
  .card-dark {
    background: rgba(61,59,48,0.3);
    border: 1px solid rgba(231,226,71,0.1);
    backdrop-filter: blur(12px);
    border-radius: 16px;
  }
`;

// Inputs
export const INPUTS = `
  .input-field {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #f4f4f5; width: 100%;
    padding: 0.82rem 1rem; border-radius: 10px;
    font-size: 0.88rem; outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .input-field::placeholder { color: #52525b; }
  .input-field:focus {
    border-color: rgba(231,226,71,0.5);
    background: rgba(255,255,255,0.07);
  }
  .input-field.input-error { border-color: rgba(239,68,68,0.5); }
  select.input-field option { background: #22221a; color: #f4f4f5; }
  .field-error { color: #fca5a5; font-size: 0.74rem; margin-top: 0.3rem; }
  input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
`;

// Buttons
export const BUTTONS = `
  .glow-btn {
    background-color: #e7e247; color: #1a1a16; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif; font-weight: 700; border-radius: 10px;
    transition: box-shadow 0.3s ease, transform 0.2s ease, opacity 0.2s;
  }
  .glow-btn:hover:not(:disabled) { box-shadow: 0 0 28px rgba(231,226,71,0.35); transform: translateY(-1px); }
  .glow-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .ghost-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #a1a1aa; cursor: pointer; border-radius: 10px;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .ghost-btn:hover, .ghost-btn.active {
    border-color: rgba(231,226,71,0.4); color: #e7e247; background: rgba(231,226,71,0.06);
  }
  .danger-btn {
    background: rgba(239,68,68,0.09); border: 1px solid rgba(239,68,68,0.2);
    color: #fca5a5; cursor: pointer; border-radius: 10px;
    transition: background 0.2s, border-color 0.2s; font-size: 0.78rem;
  }
  .danger-btn:hover:not(:disabled) { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.4); }
  .danger-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// Nav
export const NAV = `
  .nav-blur {
    backdrop-filter: blur(16px);
    background: rgba(26,26,22,0.85);
    border-bottom: 1px solid rgba(231,226,71,0.07);
  }
  .tab-btn {
    padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.82rem;
    cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 600;
    transition: all 0.2s; border: none;
  }
  .tab-btn.on  { background: #e7e247; color: #1a1a16; }
  .tab-btn.off { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1) !important; color: #71717a; }
`;

// Avatar + dropdown
export const AVATAR_DROPDOWN = `
  .avatar-circle {
    display: flex; align-items: center; justify-content: center;
    background: rgba(231,226,71,0.15); color: #e7e247;
    font-family: 'Syne', sans-serif; font-weight: 700;
    border-radius: 50%; cursor: pointer;
    border: 2px solid rgba(231,226,71,0.3);
    transition: border-color 0.2s, background 0.2s;
    flex-shrink: 0; user-select: none;
  }
  .avatar-circle:hover { border-color: #e7e247; background: rgba(231,226,71,0.25); }
  .dropdown-menu {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: #22221a; border: 1px solid rgba(231,226,71,0.15);
    border-radius: 14px; padding: 0.5rem; min-width: 190px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    animation: popIn 0.18s ease; z-index: 100;
  }
  .drop-item {
    padding: 0.55rem 0.8rem; border-radius: 9px; cursor: pointer;
    font-size: 0.83rem; color: #a1a1aa;
    transition: background 0.15s, color 0.15s;
    display: flex; align-items: center; gap: 0.55rem;
  }
  .drop-item:hover { background: rgba(231,226,71,0.08); color: #f4f4f5; }
  .drop-item.danger:hover { background: rgba(239,68,68,0.1); color: #fca5a5; }
  .divider-line { height: 1px; background: rgba(255,255,255,0.07); margin: 0.3rem 0; }
`;

// Animations
export const ANIMATIONS = `
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes popIn   { from { opacity: 0; transform: scale(0.95) translateY(-6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .fade-up { animation: fadeUp 0.38s ease forwards; }
`;

// Modals
export const MODALS = `
  .modal-bg {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.65); backdrop-filter: blur(5px);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: #22221a; border: 1px solid rgba(231,226,71,0.15);
    border-radius: 18px; padding: 1.75rem; max-width: 440px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,0.55); animation: slideUp 0.25s ease;
  }
`;

// Compose: all styles used by authenticated app pages
export const APP_STYLES = [BASE, PAGE_BG, CARDS, INPUTS, BUTTONS, NAV, AVATAR_DROPDOWN, ANIMATIONS, MODALS].join("\n");

// Compose: styles used by auth pages (login/register)
export const AUTH_STYLES = [BASE, PAGE_BG, CARDS, INPUTS, BUTTONS, ANIMATIONS].join("\n");
