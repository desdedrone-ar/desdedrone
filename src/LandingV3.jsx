import { useState, useEffect, useRef } from "react";
import { Counter, Ic, LeafletMap } from "./App.jsx";

// ───────────────────────────────────────────────────────────────────
// REVEAL — fade-in/slide-up al entrar en viewport
// ───────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} className={`v3-reveal ${shown ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

// ───────────────────────────────────────────────────────────────────
// SERVICE TILE — video al 88% con overlay elegante + detalles abajo on-scroll
// ───────────────────────────────────────────────────────────────────
function ServiceTile({ id, idx, color, label, titleA, titleB, sector, descLong, descShort, items, metrics, videoSrc }) {
  const numStr = String(idx).padStart(2, "0");
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  return (
    <section id={id} className="dd3-tile-section" style={{ "--accent": color }}>
      <div className="dd3-tile-wrap">

        <Reveal>
          <header className="dd3-tile-meta">
            <span className="dd3-tile-num">{numStr}</span>
            <span className="dd3-tile-rule" aria-hidden="true" />
            <span className="dd3-tile-label">{label}</span>
          </header>
        </Reveal>

        <Reveal delay={120}>
          <div className="dd3-tile-video">
            <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
              <source src={videoSrc} type="video/mp4" />
            </video>
            <div className="dd3-tile-scrim" />
            <div className="dd3-tile-corner top-left" aria-hidden="true">
              <span className="dd3-corner-num">{numStr}</span>
            </div>
            <button
              type="button"
              className="dd3-tile-play"
              onClick={togglePlay}
              aria-label={playing ? "Pausar video" : "Reproducir video"}
              title={playing ? "Pausar" : "Reproducir"}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1"/>
                  <rect x="14" y="5" width="4" height="14" rx="1"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <path d="M7 4.5v15a1 1 0 001.55.83l11-7.5a1 1 0 000-1.66l-11-7.5A1 1 0 007 4.5z"/>
                </svg>
              )}
            </button>
            <div className="dd3-tile-overlay">
              <h2 className="dd3-tile-title">
                <span className="light">{titleA}</span>
                <span className="strong">{titleB}</span>
              </h2>
              <div className="dd3-tile-sector">{sector}</div>
            </div>
          </div>
        </Reveal>

        <div className="dd3-tile-detail">
          <Reveal>
            <p className="dd3-tile-desc dd3-desktop">{descLong}</p>
            <p className="dd3-tile-desc dd3-mobile">{descShort}</p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="dd3-tile-list">
              {items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </Reveal>
          <Reveal delay={240} className="dd3-tile-metrics-wrap">
            <div className="dd3-tile-metrics">
              {metrics.map((m, i) => (
                <div key={i} className="dd3-metric">
                  <div className="dd3-metric-val">{m.val}</div>
                  <div className="dd3-metric-lbl">{m.lbl}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────
// LANDING V3 — hero idéntico a la foto + secciones 80% con scroll-reveal
// ───────────────────────────────────────────────────────────────────
export default function LandingV3({ onNavigate, darkMode, setDarkMode }) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { if (scrollY > 10) setMobileMenuOpen(false); }, [scrollY]);

  const dm = darkMode;

  // ─── tokens ────────────────────────────────────────────────────
  const t = dm ? {
    bg:        "#0E1726",
    bgAlt:     "#0A111E",
    bgDeep:    "#000000",
    textPri:   "#F5F5F2",
    textMed:   "#A8A8A0",
    textFade:  "#6B6B66",
    divider:   "rgba(255,255,255,0.08)",
    cardBg:    "rgba(0,0,0,0.42)",
    cardBorder:"rgba(255,255,255,0.10)",
    inputBg:   "rgba(255,255,255,0.03)",
    inputBgFc: "rgba(255,255,255,0.05)",
    heroScrim: "linear-gradient(135deg, rgba(14,23,38,0.78) 0%, rgba(14,23,38,0.5) 100%)",
    navBg:     "rgba(10,17,30,0.75)",
    navBgScroll:"rgba(10,17,30,0.94)",
    tileShadow:"0 30px 80px rgba(0,0,0,0.5)",
  } : {
    bg:        "#F4F1EA",
    bgAlt:     "#EFECE3",
    bgDeep:    "#E5E2D8",
    textPri:   "#0E0E0C",
    textMed:   "#43403B",
    textFade:  "#A6A39C",
    divider:   "rgba(20,18,15,0.10)",
    cardBg:    "rgba(255,253,247,0.6)",
    cardBorder:"rgba(20,18,15,0.10)",
    inputBg:   "rgba(20,18,15,0.03)",
    inputBgFc: "rgba(20,18,15,0.06)",
    heroScrim: "linear-gradient(135deg, rgba(48,48,46,0.55) 0%, rgba(48,48,46,0.30) 100%)",
    navBg:     "rgba(244,241,234,0.78)",
    navBgScroll:"rgba(244,241,234,0.95)",
    tileShadow:"0 24px 60px rgba(20,18,15,0.18)",
  };

  const gold     = "#C4A478";
  const goldSoft = "#E8DCC4";
  const goldDeep = dm ? "#8A6F48" : "#7a5e3a";
  const ctaBg    = dm ? goldSoft : "#111110";
  const ctaText  = dm ? "#0E1726" : "#ffffff";

  const C_FPV  = "#b89878";
  const C_OBRA = "#8fb4c4";
  const C_FOTO = gold;

  const NAV_ITEMS = [
    { t: "Servicios",    href: "#servicios"      },
    { t: "Casos de Uso", nav:  "casos"           },
    { t: "Presupuesto",  nav:  "presupuesto"     },
    { t: "Plataforma",   nav:  "login"           },
    { t: "Contacto",     href: "#contacto"       },
  ];

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navScrolled = scrollY > 60;

  return (
    <div className="dd3" style={{ background: t.bg, color: t.textPri }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      <style>{`
        .dd3 {
          font-family: 'DM Sans', sans-serif;
          line-height: 1.55;
          --gold: ${gold};
          --gold-soft: ${goldSoft};
          --gold-deep: ${goldDeep};
          --bg: ${t.bg};
          --bg-alt: ${t.bgAlt};
          --bg-deep: ${t.bgDeep};
          --text-pri: ${t.textPri};
          --text-med: ${t.textMed};
          --text-fade: ${t.textFade};
          --divider: ${t.divider};
          --card-bg: ${t.cardBg};
          --card-border: ${t.cardBorder};
        }
        .dd3-mono { font-family: 'IBM Plex Mono', monospace; }

        /* ── Reveals ─────────────────────────────────────────── */
        .v3-reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s ease, transform .8s ease; }
        .v3-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .dd3-fadeup { opacity: 0; transform: translateY(28px); animation: dd3FadeUp .8s ease forwards; }
        .dd3-fadeup.d1 { animation-delay: .1s; }
        .dd3-fadeup.d2 { animation-delay: .25s; }
        .dd3-fadeup.d3 { animation-delay: .4s; }
        @keyframes dd3FadeUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes dd3Float {
          0%, 100% { transform: rotate(180deg) translateY(0); }
          50%      { transform: rotate(180deg) translateY(-8px); }
        }

        /* ── NAV ────────────────────────────────────────────── */
        .dd3-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 3rem;
          background: ${navScrolled ? t.navBgScroll : t.navBg};
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid ${navScrolled ? t.divider : "transparent"};
          transition: padding .3s ease, background .3s ease, border-color .3s ease;
        }
        .dd3-nav.scrolled { padding: .85rem 3rem; }
        .dd3-logo {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .82rem; letter-spacing: .08em; font-weight: 500;
          color: ${t.textPri};
          cursor: pointer;
          background: transparent; border: none;
        }
        .dd3-logo-diamond {
          display: inline-flex; align-items: center; justify-content: center;
          color: ${gold};
          line-height: 0;
        }
        .dd3-logo-name { display: inline-flex; align-items: baseline; }
        .dd3-logo-name .accent { color: ${gold}; }
        .dd3-logo-dot { color: ${gold}; font-size: .55rem; line-height: 1; }
        .dd3-nav-links { display: flex; align-items: center; gap: 2.25rem; }
        .dd3-nav-links a {
          font-size: .9rem; font-weight: 400;
          color: ${t.textMed}; text-decoration: none;
          position: relative; transition: color .2s;
        }
        .dd3-nav-links a::after {
          content: ""; position: absolute; bottom: -4px; left: 0;
          width: 0; height: 1px; background: ${gold};
          transition: width .3s ease;
        }
        .dd3-nav-links a:hover { color: ${t.textPri}; }
        .dd3-nav-links a:hover::after { width: 100%; }

        .dd3-cta {
          background: ${ctaBg}; color: ${ctaText};
          border: none; padding: .72rem 1.6rem;
          border-radius: 1rem; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: .88rem; font-weight: 500;
          transition: all .2s ease;
        }
        .dd3-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(196,164,120,0.28); background: ${gold}; color: ${dm ? "#0E1726" : "#fff"}; }

        .dd3-cta-secondary {
          background: transparent;
          border: 1.5px solid ${gold};
          color: ${gold};
          padding: .68rem 1.55rem;
          border-radius: 1rem; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: .88rem; font-weight: 500;
          transition: background .2s ease;
        }
        .dd3-cta-secondary:hover { background: rgba(196,164,120,0.10); }

        .dd3-portal-btn {
          background: transparent;
          border: 1px solid ${gold};
          color: ${t.textPri};
          padding: .58rem 1.2rem;
          border-radius: 1rem;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: .82rem; font-weight: 500;
          letter-spacing: .01em;
          transition: all .25s ease;
        }
        .dd3-portal-btn:hover {
          background: ${gold};
          color: ${dm ? "#0E1726" : "#fff"};
          border-color: ${gold};
        }

        .dd3-theme-btn {
          width: 38px; height: 38px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: ${dm ? "rgba(196,164,120,0.08)" : "rgba(17,17,16,0.04)"};
          color: ${dm ? gold : "#111110"};
          border: 1px solid ${dm ? "rgba(196,164,120,0.2)" : "rgba(17,17,16,0.18)"};
          cursor: pointer; transition: transform .2s, background .2s;
        }
        .dd3-theme-btn:hover { transform: rotate(15deg); }

        .dd3-burger {
          display: none;
          width: 38px; height: 38px;
          border-radius: 12px;
          align-items: center; justify-content: center;
          background: ${dm ? "rgba(255,255,255,0.04)" : "rgba(17,17,16,0.04)"};
          color: ${t.textMed};
          border: 1px solid ${t.divider};
          cursor: pointer;
        }
        .dd3-mobile-menu {
          display: none;
          padding: 0 1.25rem 1.1rem;
          border-top: 1px solid ${t.divider};
          background: ${t.navBgScroll};
          backdrop-filter: blur(14px);
          animation: dd3Slide .22s ease;
        }
        .dd3-mobile-menu.open { display: block; }
        @keyframes dd3Slide { from {opacity:0; transform:translateY(-8px);} to {opacity:1; transform:translateY(0);} }
        .dd3-mobile-menu a {
          display: flex; align-items: center; justify-content: space-between;
          padding: .9rem .25rem;
          font-size: .95rem; color: ${t.textMed};
          text-decoration: none; border-bottom: 1px solid ${t.divider};
        }
        .dd3-mobile-menu a:last-of-type { border-bottom: none; }
        .dd3-mobile-menu .dd3-cta,
        .dd3-mobile-menu .dd3-portal-btn { width: 100%; margin-top: .8rem; padding: .9rem 1rem; }

        /* ── HERO ───────────────────────────────────────────── */
        .dd3-hero {
          position: relative;
          min-height: 100vh;
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: clamp(6rem, 14vh, 10rem);
          text-align: center;
          overflow: hidden;
        }
        .dd3-hero-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .dd3-hero-scrim {
          position: absolute; inset: 0;
          background: ${t.heroScrim};
          z-index: 1;
        }
        .dd3-hero-content {
          position: relative; z-index: 2;
          max-width: 1100px;
          padding: 0 1.5rem;
        }
        .dd3-eyebrow-hero {
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(.6rem, 1.4vw, .72rem);
          color: ${dm ? goldDeep : "#7a5e3a"};
          letter-spacing: .15em;
          margin-bottom: 2rem;
          text-transform: uppercase;
        }
        .dd3-eyebrow-hero .dashes-d { display: inline; }
        .dd3-eyebrow-hero .dashes-m { display: none; }

        .dd3-hero h1 {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(2.4rem, 6.4vw, 5rem);
          font-weight: 300;
          line-height: 1.12;
          margin-bottom: 2.6rem;
          color: ${t.textPri};
          letter-spacing: -.01em;
        }
        .dd3-hero h1 span {
          color: ${gold};
          font-weight: 500;
          display: block;
        }

        .dd3-hero-ctas {
          display: flex; gap: 1.25rem;
          justify-content: center; flex-wrap: wrap;
        }

        .dd3-scroll-hint {
          position: absolute; bottom: 2.4rem; left: 50%; transform: translateX(-50%) rotate(180deg);
          writing-mode: vertical-rl;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .65rem; letter-spacing: .15em;
          color: ${t.textFade};
          animation: dd3Float 2.2s ease-in-out infinite;
          z-index: 3;
        }

        /* ── SERVICES INTRO + GRID ──────────────────────────── */
        .dd3-services {
          background: ${t.bgAlt};
          padding: clamp(72px, 10vw, 120px) 1.5rem;
        }
        .dd3-services-intro {
          max-width: 720px; margin: 0 auto 4rem;
          text-align: center;
        }
        .dd3-services-intro .dd3-eyebrow {
          display: inline-flex; align-items: center; gap: .55rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .7rem; letter-spacing: .15em;
          color: ${gold}; margin-bottom: 1rem;
          text-transform: uppercase;
        }
        .dd3-services-intro p {
          color: ${t.textMed};
          font-size: clamp(1rem, 1.6vw, 1.15rem);
          font-weight: 300; line-height: 1.7;
        }
        .dd3-services-grid {
          display: flex;
          width: 80%;
          max-width: 1280px; margin: 0 auto;
          border: 1px solid ${t.divider};
          border-radius: 16px;
          overflow: hidden;
          background: ${dm ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.5)"};
        }
        .dd3-service-card {
          flex: 1; padding: 2.4rem 1.9rem;
          color: ${t.textPri};
          text-decoration: none;
          border-right: 1px solid ${t.divider};
          transition: background .35s ease, transform .35s ease;
          cursor: pointer; background: transparent;
        }
        .dd3-service-card:last-child { border-right: none; }
        .dd3-service-card:hover { background: ${dm ? "rgba(196,164,120,0.05)" : "rgba(196,164,120,0.07)"}; }
        .dd3-service-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.8rem;
        }
        .dd3-service-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .68rem;
          color: ${gold};
          letter-spacing: .12em;
          padding: .35rem .7rem;
          border: 1px solid ${gold};
          border-radius: 4px;
        }
        .dd3-service-icon {
          width: 42px; height: 42px;
          border: 1px solid ${t.divider};
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          color: ${gold};
          transition: all .3s ease;
        }
        .dd3-service-card:hover .dd3-service-icon {
          background: ${gold};
          color: ${dm ? "#0E1726" : "#fff"};
          border-color: ${gold};
        }
        .dd3-service-title {
          font-size: 1.3rem; font-weight: 500;
          margin-bottom: .9rem; line-height: 1.3;
          color: ${t.textPri};
        }
        .dd3-service-desc {
          font-size: .92rem; color: ${t.textMed};
          line-height: 1.6; font-weight: 300;
          margin-bottom: 1.5rem;
        }
        .dd3-service-tags {
          display: flex; flex-wrap: wrap; gap: .4rem;
          margin-bottom: 1.5rem;
        }
        .dd3-service-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .62rem;
          color: ${t.textFade};
          padding: .3rem .55rem;
          background: ${dm ? "rgba(255,255,255,0.04)" : "rgba(17,17,16,0.04)"};
          border-radius: 4px;
          letter-spacing: .05em;
        }
        .dd3-service-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem;
          color: ${gold};
          letter-spacing: .05em;
          display: inline-flex; align-items: center; gap: .5rem;
          transition: gap .3s ease;
        }
        .dd3-service-card:hover .dd3-service-link { gap: .9rem; }

        /* ── SERVICE TILE (sec 1 + 2) ───────────────────────── */
        .dd3-tile-section {
          padding: clamp(80px, 12vw, 140px) 1.5rem;
          background: ${t.bg};
        }
        .dd3-tile-wrap {
          width: 88%;
          max-width: 1440px;
          margin: 0 auto;
        }
        .dd3-tile-meta {
          display: flex; align-items: center;
          gap: 1.25rem;
          margin-bottom: clamp(1.5rem, 3vw, 2.4rem);
        }
        .dd3-tile-num {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 300;
          line-height: 1;
          color: var(--accent);
          letter-spacing: -.02em;
        }
        .dd3-tile-rule {
          flex: 0 0 64px;
          height: 1px;
          background: var(--accent);
          opacity: .55;
        }
        .dd3-tile-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem;
          letter-spacing: .2em;
          color: ${t.textFade};
          text-transform: uppercase;
        }

        .dd3-tile-video {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 10px;
          overflow: hidden;
          background: ${t.bgDeep};
          box-shadow: ${t.tileShadow};
          border: 1px solid ${t.cardBorder};
        }
        .dd3-tile-video video {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.78;
        }
        .dd3-tile-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.88) 100%);
          pointer-events: none;
        }
        .dd3-tile-corner {
          position: absolute;
          z-index: 2;
          font-family: 'IBM Plex Mono', monospace;
          color: rgba(255,255,255,0.55);
          font-size: .7rem; letter-spacing: .2em;
          pointer-events: none;
        }
        .dd3-tile-corner.top-left {
          top: 1.4rem; left: 1.6rem;
          display: flex; align-items: center; gap: .55rem;
        }
        .dd3-tile-corner.top-left::before {
          content: ""; width: 22px; height: 1px;
          background: rgba(255,255,255,0.4);
        }
        .dd3-corner-num { color: rgba(255,255,255,0.85); font-weight: 500; }

        .dd3-tile-play {
          position: absolute;
          top: clamp(1rem, 2.4vw, 1.6rem);
          right: clamp(1rem, 2.4vw, 1.6rem);
          z-index: 3;
          width: 44px; height: 44px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.42);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.94);
          cursor: pointer;
          transition: background .25s ease, transform .25s ease, border-color .25s ease;
        }
        .dd3-tile-play:hover {
          background: rgba(0,0,0,0.62);
          border-color: var(--accent);
          color: var(--accent);
          transform: scale(1.06);
        }
        .dd3-tile-play:focus-visible {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(196,164,120,0.25);
        }

        .dd3-tile-overlay {
          position: absolute;
          left: clamp(1.5rem, 4vw, 3.5rem);
          right: clamp(1.5rem, 4vw, 3.5rem);
          bottom: clamp(1.5rem, 4vw, 3rem);
          z-index: 2;
          text-align: left;
        }
        .dd3-tile-title {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(1.6rem, 3.6vw, 3rem);
          font-weight: 300;
          line-height: 1.08;
          letter-spacing: -.012em;
          margin: 0 0 1rem 0;
          color: #fff;
          text-shadow: 0 2px 22px rgba(0,0,0,0.5);
        }
        .dd3-tile-title .light  { display: block; font-weight: 300; color: rgba(255,255,255,0.94); }
        .dd3-tile-title .strong { display: block; font-weight: 500; color: var(--accent); }
        .dd3-tile-sector {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem;
          letter-spacing: .15em;
          color: rgba(255,255,255,0.78);
          text-transform: uppercase;
        }

        .dd3-tile-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 4vw, 4rem);
          margin-top: clamp(2.4rem, 5vw, 4rem);
          align-items: start;
        }
        .dd3-tile-desc {
          font-size: clamp(1rem, 1.4vw, 1.15rem);
          font-weight: 300;
          color: ${t.textMed};
          line-height: 1.75;
          max-width: 460px;
          margin: 0;
        }
        .dd3-tile-desc.dd3-mobile { display: none; }
        .dd3-tile-list {
          list-style: none;
          margin: 0; padding: 0;
        }
        .dd3-tile-list li {
          position: relative;
          padding: .95rem 0 .95rem 1.6rem;
          border-bottom: 1px solid ${t.divider};
          color: ${t.textPri};
          font-weight: 300;
          font-size: .98rem;
        }
        .dd3-tile-list li:first-child { padding-top: .35rem; }
        .dd3-tile-list li:last-child  { border-bottom: none; }
        .dd3-tile-list li::before {
          content: "";
          position: absolute;
          left: 0; top: 1.45rem;
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 999px;
        }
        .dd3-tile-list li:first-child::before { top: .85rem; }

        .dd3-tile-metrics-wrap { grid-column: 1 / -1; }
        .dd3-tile-metrics {
          border-top: 1px solid ${t.divider};
          padding-top: 2.4rem;
          margin-top: 1rem;
          display: flex;
          gap: clamp(2rem, 5vw, 5rem);
          flex-wrap: wrap;
        }
        .dd3-metric-val {
          font-size: clamp(1.4rem, 2.2vw, 1.8rem);
          font-weight: 500;
          color: var(--accent);
          letter-spacing: -.01em;
          line-height: 1;
        }
        .dd3-metric-lbl {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .65rem;
          color: ${t.textFade};
          letter-spacing: .15em;
          margin-top: .55rem;
          text-transform: uppercase;
        }

        /* ── FOTOGRAMETRÍA ───────────────────────────────────── */
        .dd3-foto {
          background: ${t.bg};
          padding: clamp(80px, 10vw, 120px) 1.5rem;
        }
        .dd3-foto-wrap {
          width: 80%;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4.5rem);
          align-items: center;
        }
        .dd3-map-card {
          height: 460px;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          border: 1px solid ${t.cardBorder};
          box-shadow: ${t.tileShadow};
          background: ${t.bgAlt};
        }
        .dd3-foto-content { text-align: left; }
        .dd3-foto-eyebrow {
          display: inline-flex; align-items: center; gap: .55rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem; letter-spacing: .15em;
          color: ${gold}; margin-bottom: 1.2rem;
          text-transform: uppercase;
        }
        .dd3-foto-dot { width: 6px; height: 6px; border-radius: 999px; background: ${gold}; }
        .dd3-foto-title {
          font-size: clamp(1.85rem, 3.6vw, 3rem);
          font-weight: 300;
          line-height: 1.15;
          margin: 0 0 1rem;
          color: ${t.textPri};
        }
        .dd3-foto-title .light  { display: block; font-weight: 300; }
        .dd3-foto-title .strong { display: block; font-weight: 500; color: ${C_FOTO}; }
        .dd3-foto-tags {
          font-family: 'IBM Plex Mono', monospace;
          color: ${t.textFade};
          margin-bottom: 1.4rem;
          font-size: .72rem; letter-spacing: .12em;
        }
        .dd3-foto-p {
          color: ${t.textMed};
          line-height: 1.75;
          font-size: clamp(.98rem, 1.4vw, 1.1rem);
          font-weight: 300;
          margin: 0 0 1.6rem 0;
        }
        .dd3-foto-list {
          list-style: none; padding: 0; margin: 0 0 2rem 0;
        }
        .dd3-foto-list li {
          color: ${t.textMed};
          font-weight: 300;
          font-size: .96rem;
          padding: 0 0 .65rem 1.4rem;
          position: relative;
        }
        .dd3-foto-list li::before {
          content: "";
          position: absolute;
          left: 0; top: .55rem;
          width: 6px; height: 6px;
          border-radius: 999px;
          background: ${gold};
        }
        .dd3-foto-metrics {
          display: flex;
          gap: 2rem;
          margin-top: 1.8rem;
          flex-wrap: wrap;
        }
        .dd3-foto-metric .val {
          font-size: clamp(1.2rem, 2vw, 1.55rem);
          font-weight: 600;
          letter-spacing: -.01em;
          color: ${C_FOTO};
        }
        .dd3-foto-metric .lbl {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .62rem;
          color: ${t.textFade};
          letter-spacing: .15em;
          margin-top: .35rem;
          text-transform: uppercase;
        }

        /* ── FOOTER ─────────────────────────────────────────── */
        .dd3-footer {
          background: ${t.bgAlt};
          padding: clamp(80px, 12vw, 120px) 1.5rem clamp(40px, 6vw, 60px);
          text-align: center;
        }
        .dd3-footer .dd3-eyebrow {
          display: inline-flex; align-items: center; gap: .55rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem; letter-spacing: .15em;
          color: ${gold}; margin-bottom: 1.2rem;
          text-transform: uppercase;
          justify-content: center;
        }
        .dd3-footer h2 {
          font-size: clamp(1.85rem, 4.4vw, 3.4rem);
          font-weight: 300;
          margin: 0 0 1rem;
          color: ${t.textPri};
          line-height: 1.15;
        }
        .dd3-footer h2 span { color: ${gold}; font-weight: 500; }
        .dd3-footer-intro {
          color: ${t.textMed};
          max-width: 560px; margin: 0 auto 2.6rem;
          font-size: clamp(.95rem, 1.4vw, 1.05rem);
          line-height: 1.7; font-weight: 300;
        }
        .dd3-form { max-width: 720px; margin: 0 auto; }
        .dd3-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.1rem; margin-bottom: 1.1rem;
        }
        .dd3-form input,
        .dd3-form textarea {
          width: 100%;
          padding: 1rem 1.2rem;
          background: ${t.inputBg};
          color: ${t.textPri};
          border: 1px solid ${t.divider};
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem;
          transition: all .3s ease;
        }
        .dd3-form input::placeholder,
        .dd3-form textarea::placeholder { color: ${t.textFade}; }
        .dd3-form input:focus,
        .dd3-form textarea:focus {
          outline: none;
          border-color: ${gold};
          background: ${t.inputBgFc};
        }
        .dd3-form textarea { resize: vertical; min-height: 130px; }
        .dd3-submit {
          width: 100%;
          padding: 1.1rem 1.6rem;
          font-size: 1rem;
          margin-top: .4rem;
          background: ${ctaBg}; color: ${ctaText};
          border: none; border-radius: 1rem;
          cursor: pointer; font-weight: 500;
          transition: all .25s ease;
        }
        .dd3-submit:hover {
          background: ${gold}; color: ${dm ? "#0E1726" : "#fff"};
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(196,164,120,0.32);
        }
        .dd3-footer-bottom {
          margin: 4rem auto 0;
          padding-top: 2rem;
          border-top: 1px solid ${t.divider};
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1.25rem;
          max-width: 1280px;
        }
        .dd3-footer-copy {
          font-family: 'IBM Plex Mono', monospace;
          color: ${t.textFade}; font-size: .72rem;
        }
        .dd3-footer-links { display: flex; gap: 1.6rem; }
        .dd3-footer-links a {
          font-family: 'IBM Plex Mono', monospace;
          color: ${t.textFade};
          text-decoration: none;
          font-size: .72rem;
          transition: color .2s;
        }
        .dd3-footer-links a:hover { color: ${gold}; }

        /* ── V toggle ───────────────────────────────────────── */
        .dd3-vtoggle {
          position: fixed; bottom: 1rem; right: 1rem; z-index: 120;
          padding: .4rem .8rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .65rem; letter-spacing: .12em;
          background: ${dm ? "rgba(10,17,30,0.7)" : "rgba(244,241,234,0.85)"};
          color: ${dm ? gold : "#0E0E0C"};
          border: 1px solid ${dm ? "rgba(196,164,120,0.25)" : "rgba(20,18,15,0.18)"};
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          opacity: .5; cursor: pointer;
          transition: opacity .2s;
        }
        .dd3-vtoggle:hover { opacity: 1; }

        /* ── RESPONSIVE ─────────────────────────────────────── */
        @media (max-width: 1100px) {
          .dd3-services-grid { width: 92%; }
        }
        @media (max-width: 968px) {
          .dd3-services-grid { flex-direction: column; width: 92%; }
          .dd3-service-card { border-right: none; border-bottom: 1px solid ${t.divider}; }
          .dd3-service-card:last-child { border-bottom: none; }

          .dd3-tile-wrap { width: 92%; }
          .dd3-tile-detail { grid-template-columns: 1fr; gap: 1.5rem; }

          .dd3-foto-wrap { width: 92%; grid-template-columns: 1fr; gap: 2.4rem; }
          .dd3-map-card { height: 360px; }
        }
        @media (max-width: 768px) {
          .dd3-nav { padding: 1rem 1.1rem; }
          .dd3-nav.scrolled { padding: .8rem 1.1rem; }
          .dd3-nav-links { display: none; }
          .dd3-nav .dd3-cta { display: none; }
          .dd3-burger { display: flex; }

          .dd3-hero { padding-bottom: clamp(4.5rem, 12vh, 7rem); }
          .dd3-hero-video { object-position: 41% center; }
          .dd3-hero-content { padding: 0 1.25rem; }
          .dd3-hero h1 {
            font-size: clamp(2rem, 8vw, 2.7rem);
            margin-bottom: 2rem;
            color: rgba(255,255,255,0.96);
            text-shadow: 0 2px 18px rgba(0,0,0,0.35);
          }
          .dd3-eyebrow-hero {
            margin-bottom: 1.5rem;
            font-size: .6rem;
            letter-spacing: .12em;
            color: rgba(255,255,255,0.85);
          }
          .dd3-eyebrow-hero .dashes-d { display: none; }
          .dd3-eyebrow-hero .dashes-m { display: inline; }
          .dd3-hero-ctas { gap: .7rem; flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; margin: 0 auto; }
          .dd3-hero-ctas .dd3-cta,
          .dd3-hero-ctas .dd3-cta-secondary { width: 100%; }
          .dd3-hero-ctas .dd3-cta {
            background: rgba(255,255,255,0.12);
            color: #cececc;
          }
          .dd3-hero-ctas .dd3-cta:hover {
            background: ${gold};
            color: #fff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.32);
          }
          .dd3-hero-ctas .dd3-cta-secondary {
            border-color: rgba(255,255,255,0.12);
            color: rgba(255,255,255,0.96);
          }
          .dd3-hero-ctas .dd3-cta-secondary:hover {
            background: rgba(255,255,255,0.12);
          }
          .dd3-scroll-hint { bottom: 1.4rem; }

          .dd3-services { padding: 64px 1rem; }
          .dd3-services-intro { margin-bottom: 2.6rem; }
          .dd3-service-card { padding: 1.9rem 1.4rem; }
          .dd3-service-title { font-size: 1.18rem; }

          .dd3-tile-section { padding: 64px 0; }
          .dd3-tile-wrap { width: 100%; }
          .dd3-tile-meta { gap: .9rem; margin-bottom: 1.2rem; padding: 0 1rem; }
          .dd3-tile-num { font-size: 2rem; }
          .dd3-tile-rule { flex-basis: 38px; }
          .dd3-tile-label { font-size: .65rem; letter-spacing: .15em; }
          .dd3-tile-video {
            border-radius: 0;
            border-left: none; border-right: none;
            aspect-ratio: 4 / 5;
          }
          .dd3-tile-overlay {
            left: 1rem; right: 1rem; bottom: 1.2rem;
          }
          .dd3-tile-title { font-size: clamp(1.6rem, 7vw, 2.2rem); }
          .dd3-tile-sector { font-size: .65rem; letter-spacing: .12em; }
          .dd3-tile-corner.top-left { top: .9rem; left: .9rem; font-size: .62rem; }
          .dd3-tile-play { top: .9rem; right: .9rem; width: 40px; height: 40px; }
          .dd3-tile-detail { padding: 0 1rem; }
          .dd3-tile-desc.dd3-desktop { display: none; }
          .dd3-tile-desc.dd3-mobile  { display: block; font-size: .96rem; line-height: 1.65; }
          .dd3-tile-list li { font-size: .92rem; }
          .dd3-tile-metrics { gap: 1.5rem; padding-top: 1.8rem; }
          .dd3-metric-val { font-size: 1.3rem; }

          .dd3-foto { padding: 64px 1rem; }
          .dd3-map-card { height: 280px; }

          .dd3-footer { padding: 64px 1rem 36px; }
          .dd3-form-row { grid-template-columns: 1fr; gap: .85rem; margin-bottom: .85rem; }
          .dd3-form input, .dd3-form textarea { padding: .9rem 1rem; font-size: .92rem; }
          .dd3-footer-bottom { margin-top: 2.6rem; padding-top: 1.5rem; flex-direction: column; gap: 1rem; text-align: center; }
          .dd3-footer-links { gap: 1.2rem; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className={`dd3-nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="dd3-logo" onClick={() => onNavigate("landing")} role="button" tabIndex={0}>
          <span className="dd3-logo-diamond" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 3L21 12L12 21L3 12Z"/>
            </svg>
          </span>
          <span className="dd3-logo-name">
            <span>DESDEDRONE</span><span className="accent">.AR</span>
          </span>
        </div>

        <div className="dd3-nav-links">
          {NAV_ITEMS.map(it => (
            <a
              key={it.t}
              href={it.href || "#"}
              onClick={(e) => {
                e.preventDefault();
                if (it.nav) onNavigate(it.nav);
                else scrollTo(it.href);
              }}
            >{it.t}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <button className="dd3-theme-btn" onClick={() => setDarkMode(d => !d)} aria-label={dm ? "Modo claro" : "Modo oscuro"}>
            {dm ? <Ic.Sun /> : <Ic.Moon />}
          </button>
          <button className="dd3-portal-btn" onClick={() => onNavigate("login")}>Portal Clientes</button>
          <button className="dd3-burger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menú">
            {mobileMenuOpen ? <Ic.X /> : <Ic.Menu />}
          </button>
        </div>

        <div className={`dd3-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          {NAV_ITEMS.map(it => (
            <a
              key={it.t}
              href={it.href || "#"}
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                if (it.nav) onNavigate(it.nav);
                else scrollTo(it.href);
              }}
            >
              {it.t}
              <span style={{ color: "rgba(196,164,120,0.4)", fontSize: "11px" }}>→</span>
            </a>
          ))}
          <button className="dd3-portal-btn" onClick={() => { setMobileMenuOpen(false); onNavigate("login"); }}>Portal Clientes</button>
        </div>
      </nav>

      {/* ─── HERO ─── (idéntico a la foto) */}
      <section className="dd3-hero">
        <video className="dd3-hero-video" src="/video/hero.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        <div className="dd3-hero-scrim" />

        <div className="dd3-hero-content">
          <div className="dd3-eyebrow-hero dd3-fadeup">
            <span className="dashes-d">─── </span>
            SERVICIOS CON DRONES · ARGENTINA
            <span className="dashes-d"> ───</span>
          </div>

          <h1 className="dd3-fadeup d1">
            Visión aérea para
            <span>decisiones estratégicas</span>
          </h1>

          <div className="dd3-hero-ctas dd3-fadeup d3">
            <button className="dd3-cta" onClick={() => onNavigate("presupuesto")}>Solicitar presupuesto</button>
            <button className="dd3-cta-secondary" onClick={() => scrollTo("#servicios")}>Ver servicios ↓</button>
          </div>
        </div>

        <div className="dd3-scroll-hint" style={{ opacity: scrollY > 60 ? 0 : 1, transition: "opacity .3s" }}>SCROLL</div>
      </section>

      {/* ─── SERVICES INTRO + GRID ─── */}
      <section id="servicios" className="dd3-services">
        <div className="dd3-services-intro">
          <div className="dd3-eyebrow"><span className="dd3-foto-dot" />Nuestros servicios</div>
          <p>
            Vuelos estabilizados y FPV para Real Estate. Seguimiento de obra.
            Fotogrametría con ortomosaicos georreferenciados y nubes de puntos.
          </p>
        </div>

        <div className="dd3-services-grid">
          <a href="#cine-aereo" className="dd3-service-card" onClick={(e) => { e.preventDefault(); scrollTo("#cine-aereo"); }}>
            <div className="dd3-service-head">
              <span className="dd3-service-num">01</span>
              <div className="dd3-service-icon"><Ic.Camera /></div>
            </div>
            <div className="dd3-service-title">Vuelos FPV y Cine Aéreo</div>
            <p className="dd3-service-desc">Producción audiovisual cinematográfica con drones FPV y aéreos 4K/60fps estabilizados.</p>
            <div className="dd3-service-tags">
              <span className="dd3-service-tag">Real Estate</span>
              <span className="dd3-service-tag">Marketing</span>
              <span className="dd3-service-tag">Arquitectura</span>
            </div>
            <div className="dd3-service-link">Ver más <span>→</span></div>
          </a>

          <a href="#seguimiento-obra" className="dd3-service-card" onClick={(e) => { e.preventDefault(); scrollTo("#seguimiento-obra"); }}>
            <div className="dd3-service-head">
              <span className="dd3-service-num">02</span>
              <div className="dd3-service-icon"><Ic.Building /></div>
            </div>
            <div className="dd3-service-title">Seguimiento de Obra</div>
            <p className="dd3-service-desc">Vuelos periódicos para registrar el avance con evidencia visual georreferenciada.</p>
            <div className="dd3-service-tags">
              <span className="dd3-service-tag">Construcción</span>
              <span className="dd3-service-tag">Arquitectura</span>
              <span className="dd3-service-tag">Ingeniería</span>
            </div>
            <div className="dd3-service-link">Ver más <span>→</span></div>
          </a>

          <a href="#fotogrametria" className="dd3-service-card" onClick={(e) => { e.preventDefault(); scrollTo("#fotogrametria"); }}>
            <div className="dd3-service-head">
              <span className="dd3-service-num">03</span>
              <div className="dd3-service-icon"><Ic.Layers /></div>
            </div>
            <div className="dd3-service-title">Fotogrametría</div>
            <p className="dd3-service-desc">Ortomosaicos GeoTIFF, nubes de puntos densas y modelos de superficie georreferenciados.</p>
            <div className="dd3-service-tags">
              <span className="dd3-service-tag">Agro</span>
              <span className="dd3-service-tag">Minería</span>
              <span className="dd3-service-tag">Catastro</span>
            </div>
            <div className="dd3-service-link">Ver más <span>→</span></div>
          </a>
        </div>
      </section>

      {/* ─── SECCIÓN 01 — FPV / Cine Aéreo ─── */}
      <ServiceTile
        id="cine-aereo"
        idx={1}
        color={C_FPV}
        label="FPV · CINE AÉREO"
        titleA="Vuelos FPV para"
        titleB="Real Estate de alto impacto"
        sector="Real Estate · Marketing · Arquitectura"
        descLong="Producción audiovisual cinematográfica con drones FPV y aéreos 4K/60fps estabilizados. Recorridos inmersivos, color grading D-Log y entregables listos para sala de ventas, redes y campañas digitales."
        descShort="Cine aéreo 4K/60fps con FPV. Listos para sala de ventas y redes."
        items={[
          "Video FPV + aéreo 4K / 60fps",
          "Cortes 60\" para redes (9:16 y 16:9)",
          "Fotos aéreas de alta resolución",
          "Color grading D-Log con LUT custom",
        ]}
        metrics={[
          { val: "4K", lbl: "60fps · D-Log" },
          { val: "2–3", lbl: "días producción" },
          { val: "4", lbl: "formatos entregados" },
        ]}
        videoSrc="/video/fpv.mp4"
      />

      {/* ─── SECCIÓN 02 — Seguimiento de Obra ─── */}
      <ServiceTile
        id="seguimiento-obra"
        idx={2}
        color={C_OBRA}
        label="SEGUIMIENTO DE OBRA"
        titleA="Documentación aérea"
        titleB="fechada de tu obra"
        sector="Construcción · Arquitectura · Ingeniería civil"
        descLong="Vuelos periódicos para registrar el avance de obra con evidencia visual georreferenciada y comparable en el tiempo. Reportes PDF entregables a dirección, cliente y subcontratistas."
        descShort="Avance georreferenciado y comparable. Reportes PDF para cada etapa."
        items={[
          "Vuelo periódico (mensual / quincenal)",
          "Reporte PDF con foto-grilla fechada",
          "Ortomosaico de referencia por vuelo",
          "Comparación temporal entre vuelos",
        ]}
        metrics={[
          { val: "18", lbl: "vuelos / obra" },
          { val: "4.200 m²", lbl: "superficie" },
          { val: "±2 cm", lbl: "precisión" },
        ]}
        videoSrc="/video/seguimiento.mp4"
      />

      {/* ─── SECCIÓN 03 — Fotogrametría (grid con mapa) ─── */}
      <section id="fotogrametria" className="dd3-foto">
        <div className="dd3-foto-wrap">
          <Reveal>
            <div className="dd3-map-card">
              <LeafletMap />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="dd3-foto-content">
              <div className="dd3-foto-eyebrow"><span className="dd3-foto-dot" />FOTOGRAMETRÍA</div>
              <h2 className="dd3-foto-title">
                <span className="light">Ortomosaicos y</span>
                <span className="strong">modelos 3D del terreno</span>
              </h2>
              <div className="dd3-foto-tags">Agro · Minería · Ingeniería civil · Catastro</div>
              <p className="dd3-foto-p">
                Relevamientos aéreos completos. Generamos ortomosaicos
                GeoTIFF, nubes de puntos densas (LAS 1.4), modelos de
                superficie (DSM/MDT) y curvas de nivel. Todo georreferenciado
                con GCPs y proyección UTM.
              </p>
              <ul className="dd3-foto-list">
                <li>Ortomosaico GeoTIFF de alta resolución</li>
                <li>Nube de puntos LAS 1.4 clasificada</li>
                <li>DSM y MDT georreferenciados</li>
                <li>Curvas de nivel con equidistancia configurable</li>
              </ul>
              <div className="dd3-foto-metrics">
                <div className="dd3-foto-metric">
                  <div className="val"><Counter end={243} suffix=" ha" /></div>
                  <div className="lbl">área por vuelo</div>
                </div>
                <div className="dd3-foto-metric">
                  <div className="val">±2 cm</div>
                  <div className="lbl">precisión GSD</div>
                </div>
                <div className="dd3-foto-metric">
                  <div className="val"><Counter end={48} suffix=" M" /></div>
                  <div className="lbl">puntos en nube</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER + CONTACTO ─── */}
      <footer id="contacto" className="dd3-footer">
        <div className="dd3-eyebrow"><span className="dd3-foto-dot" />CONTACTO</div>
        <h2>Hablemos de tu <span>proyecto</span></h2>
        <p className="dd3-footer-intro">
          Contanos qué necesitás y te respondemos con un presupuesto detallado en 24 horas hábiles.
        </p>

        <form className="dd3-form" onSubmit={(e) => { e.preventDefault(); onNavigate("presupuesto"); }}>
          <div className="dd3-form-row">
            <input type="text" placeholder="Nombre y empresa" />
            <input type="text" placeholder="Teléfono / WhatsApp" />
          </div>
          <input type="email" placeholder="Email" style={{ marginBottom: "1.1rem" }} />
          <textarea placeholder="Describí tu proyecto: ubicación, tipo de relevamiento, urgencia…" />
          <button type="submit" className="dd3-submit">Enviar consulta</button>
        </form>

        <div className="dd3-footer-bottom">
          <div className="dd3-logo">
            <span className="dd3-logo-dot">●</span>
            <span>DESDEDRONE.AR</span>
          </div>
          <div className="dd3-footer-copy">© 2026 · Buenos Aires, Argentina</div>
          <div className="dd3-footer-links">
            <a href="#" target="_blank" rel="noreferrer">Instagram</a>
            <a href="#" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="#" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
      </footer>

      {/* ─── V toggle (vuelve a V2) ─── */}
      <button className="dd3-vtoggle" onClick={() => onNavigate("landing-v1")} title="Ver landing original">
        ← V1 · V3
      </button>
    </div>
  );
}
