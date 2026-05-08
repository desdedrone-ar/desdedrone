import { useState, useEffect, useRef } from "react";
import { Counter, TopoCanvas, Ic, LeafletMap } from "./App.jsx";

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
    <Tag ref={ref} className={`v2-reveal ${shown ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

// ───────────────────────────────────────────────────────────────────
// VIDEO VISUAL — video fullbleed + botón play/pause
// ───────────────────────────────────────────────────────────────────
function VideoVisual({ src, color }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(true);
  const toggle = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.play().catch(()=>{}); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };
  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
        autoPlay muted loop playsInline preload="metadata"
        aria-hidden="true"
      />
      <button
        onClick={toggle}
        aria-label={playing ? "Pausar video" : "Reproducir video"}
        className="absolute bottom-6 right-6 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{ background: color, color: "#0a0c10", boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1v12l10-6z"/></svg>
        )}
      </button>
    </>
  );
}

// ───────────────────────────────────────────────────────────────────
// SERVICE SCENE — Variante "overlay" (videos): visual fullbleed +
// copy encima con scrim direccional.
// ───────────────────────────────────────────────────────────────────
function ServiceSceneOverlay({ index, tag, title, titleStrong, sector, desc, deliverables, metrics, color, visual, reverse, dm, textPri, textMed, textFade }) {
  const numStr = String(index).padStart(2, "0");

  // Scrim direccional: oscurece el lado del texto, deja respirar el otro
  const scrim = dm
    ? `linear-gradient(to ${reverse ? "left" : "right"}, rgba(8,10,14,0.88) 0%, rgba(8,10,14,0.6) 35%, rgba(8,10,14,0.15) 70%, rgba(8,10,14,0) 100%)`
    : `linear-gradient(to ${reverse ? "left" : "right"}, rgba(245,245,242,0.92) 0%, rgba(245,245,242,0.7) 35%, rgba(245,245,242,0.2) 70%, rgba(245,245,242,0) 100%)`;

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center mt-16 lg:mt-28">
      {/* Visual: full-width en mobile, 60vw con relación 16:9 centrado en lg+ */}
      <div className="absolute inset-0 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[60vw] lg:aspect-video">
        {visual}
      </div>

      {/* Scrim direccional, alineado con el visual */}
      <div className="absolute inset-0 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[60vw] lg:aspect-video pointer-events-none" style={{ background: scrim }} />

      {/* Watermark del número, discreto */}
      <div
        aria-hidden="true"
        className="dd-mono pointer-events-none select-none absolute font-light leading-none"
        style={{
          fontSize: "clamp(7rem, 14vw, 14rem)",
          color,
          opacity: dm ? 0.08 : 0.1,
          top: "6%",
          [reverse ? "left" : "right"]: "4%",
          letterSpacing: "-0.04em",
          zIndex: 5,
        }}
      >
        {numStr}
      </div>

      {/* Copy overlay — alineado con la banda del video en lg+ */}
      <div className="relative z-10 w-full max-w-7xl lg:max-w-none lg:w-[60vw] mx-auto px-6 lg:px-12 py-24 lg:py-28">
        <Reveal className={reverse ? "lg:ml-auto lg:max-w-md" : "lg:max-w-md"} delay={120}>
          <div className="dd-mono text-xs tracking-widest mb-5 flex items-center gap-3" style={{ color }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {tag}
          </div>

          <h2 className="text-3xl lg:text-5xl leading-tight tracking-tight mb-3" style={{ color: textPri }}>
            <span className="font-light">{title}</span>
            <br />
            <span className="font-semibold" style={{ color }}>{titleStrong}</span>
          </h2>

          <div className="dd-mono text-xs tracking-widest mb-6" style={{ color: textFade }}>
            {sector}
          </div>

          <p className="text-base lg:text-lg leading-relaxed mb-8" style={{ color: textMed, maxWidth: "44ch" }}>
            {desc}
          </p>

          <div className="flex flex-col gap-2.5 mb-8">
            {deliverables.map((d, i) => (
              <div key={i} className="flex items-start gap-3 text-sm" style={{ color: textMed }}>
                <span className="inline-block w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: color }} />
                <span>{d}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-7">
            {metrics.map((m, i) => (
              <div key={i}>
                <div className="text-xl lg:text-2xl font-semibold tracking-tight" style={{ color }}>{m.val}</div>
                <div className="dd-mono text-[10px] tracking-widest mt-1" style={{ color: textFade }}>{m.lbl}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────
// SERVICE SCENE — Variante "card" (ortho): visual en card 7/12 con
// copy al lado en columna 5/12. Layout previo, sin overlay.
// ───────────────────────────────────────────────────────────────────
function ServiceSceneCard({ index, tag, title, titleStrong, sector, desc, deliverables, metrics, color, visual, reverse, dm, textPri, textMed, textFade }) {
  const numStr = String(index).padStart(2, "0");

  return (
    <section className="relative py-28 lg:py-36 overflow-hidden mt-16 lg:mt-28">
      <div
        aria-hidden="true"
        className="dd-mono pointer-events-none select-none absolute font-light leading-none"
        style={{
          fontSize: "clamp(8rem, 16vw, 16rem)",
          color,
          opacity: dm ? 0.06 : 0.08,
          top: "8%",
          [reverse ? "right" : "left"]: "4%",
          letterSpacing: "-0.04em",
        }}
      >
        {numStr}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <Reveal className={`lg:col-span-7 ${reverse ? "lg:order-2" : "lg:order-1"}`} delay={0}>
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                aspectRatio: "16 / 10",
                background: dm ? "#0e1422" : "#1a1d22",
                border: `1px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(17,17,16,0.08)"}`,
                boxShadow: dm ? "0 24px 80px rgba(0,0,0,0.45)" : "0 24px 60px rgba(17,17,16,0.18)",
              }}
            >
              {visual}
            </div>
          </Reveal>

          <Reveal className={`lg:col-span-5 ${reverse ? "lg:order-1" : "lg:order-2"}`} delay={150}>
            <div>
              <div className="dd-mono text-xs tracking-widest mb-5 flex items-center gap-3" style={{ color }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                {tag}
              </div>

              <h2 className="text-3xl lg:text-5xl leading-tight tracking-tight mb-3" style={{ color: textPri }}>
                <span className="font-light">{title}</span>
                <br />
                <span className="font-semibold" style={{ color }}>{titleStrong}</span>
              </h2>

              <div className="dd-mono text-xs tracking-widest mb-6" style={{ color: textFade }}>
                {sector}
              </div>

              <p className="text-base lg:text-lg leading-relaxed mb-8" style={{ color: textMed, maxWidth: "44ch" }}>
                {desc}
              </p>

              <div className="flex flex-col gap-2.5 mb-8">
                {deliverables.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm" style={{ color: textMed }}>
                    <span className="inline-block w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: color }} />
                    <span>{d}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-7">
                {metrics.map((m, i) => (
                  <div key={i}>
                    <div className="text-xl lg:text-2xl font-semibold tracking-tight" style={{ color }}>{m.val}</div>
                    <div className="dd-mono text-[10px] tracking-widest mt-1" style={{ color: textFade }}>{m.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────
// LANDING V2
// ───────────────────────────────────────────────────────────────────
export default function LandingV2({ onNavigate, darkMode, setDarkMode }) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { if (scrollY > 10) setMobileMenuOpen(false); }, [scrollY]);

  const dm = darkMode;
  const bg       = dm ? "#0a0c10" : "#f5f5f2";
  const navBg    = dm ? "rgba(10,12,16,0.92)" : "rgba(245,245,242,0.92)";
  const navBorder= dm ? "rgba(196,164,120,0.06)" : "#e2e2dc";
  const textPri  = dm ? "white" : "#111110";
  const textMed  = dm ? "rgba(255,255,255,0.55)" : "#2e2e2b";
  const textFade = dm ? "rgba(255,255,255,0.35)" : "#5a5a55";
  const textFade2= dm ? "rgba(255,255,255,0.45)" : "#5a5a55";
  const textDim  = dm ? "rgba(255,255,255,0.25)" : "#8a8a82";
  const accent   = "#c4a478";
  const accentStrong = dm ? "#c4a478" : "#111110";
  const ctaBg    = dm ? "#c4a478" : "#111110";
  const ctaText  = dm ? "#0a0c10" : "#ffffff";

  const NAV_ITEMS = [{t:"Servicios",v:"servicios"},{t:"Casos de Uso",v:"casos"},{t:"Presupuesto",v:"presupuesto"},{t:"Plataforma",v:"stack"},{t:"Contacto",v:null}];

  // Service color tokens (one per service, same family used in v1)
  const C_FPV   = "#b89878"; // FPV — tan
  const C_OBRA  = "#8fb4c4"; // Seguimiento — steel
  const C_FOTO  = "#c4a478"; // Fotogrametría — gold

  return (
    <div className="min-h-screen" style={{ background: bg, transition: "background 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        .dd-body { font-family: 'DM Sans', sans-serif; font-size: 17px; line-height: 1.55; }
        .dd-body .text-xs { font-size: 13px; }
        .dd-body .text-sm { font-size: 15.5px; }
        .dd-body .text-base { font-size: 17.5px; }
        .dd-body .text-lg { font-size: 19.5px; }
        .dd-body .text-xl { font-size: 22px; }
        .dd-mono { font-family: 'IBM Plex Mono', monospace; }
        .dd-fade-up { opacity: 0; transform: translateY(30px); animation: ddFadeUp 0.8s ease forwards; }
        .dd-fade-up-d1 { animation-delay: 0.1s; }
        .dd-fade-up-d2 { animation-delay: 0.25s; }
        .dd-fade-up-d3 { animation-delay: 0.4s; }
        .dd-fade-up-d4 { animation-delay: 0.55s; }
        @keyframes ddFadeUp { to { opacity: 1; transform: translateY(0); } }
        .dd-line { width: 0; animation: ddLine 1.5s ease 0.6s forwards; }
        @keyframes ddLine { to { width: 100%; } }
        .dd-glow { box-shadow: 0 0 0 rgba(196,164,120,0); transition: box-shadow 0.4s; }
        .dd-glow:hover { box-shadow: 0 8px 40px rgba(196,164,120,0.12); }
        .dd-mobile-menu { animation: ddSlideDown 0.22s ease; }
        @keyframes ddSlideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .dd-theme-btn { transition: transform 0.2s, background 0.2s; }
        .dd-theme-btn:hover { transform: rotate(15deg); }
        .v2-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .v2-reveal.is-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="dd-body">
        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all" style={{
          background: navBg,
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${navBorder}`,
        }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl" style={{ color: accent }}>◈</span>
              <span className="text-sm font-semibold tracking-wider" style={{ color: textPri }}>DESDEDRONE<span style={{ color: accent }}>.AR</span></span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map(item => (
                <a key={item.t} href="#" onClick={e => { e.preventDefault(); if (item.v) onNavigate(item.v); }}
                  className="text-xs tracking-wider transition-colors"
                  style={{ color: textFade }}
                  onMouseEnter={e => e.target.style.color = accentStrong}
                  onMouseLeave={e => e.target.style.color = textFade}>
                  {item.t}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(d => !d)}
                className="dd-theme-btn w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: dm ? "rgba(196,164,120,0.08)" : "rgba(17,17,16,0.04)", color: dm ? accent : accentStrong, border: `1px solid ${dm ? "rgba(196,164,120,0.2)" : "rgba(17,17,16,0.18)"}` }}
                title={dm ? "Modo claro" : "Modo oscuro"}>
                {dm ? <Ic.Sun /> : <Ic.Moon />}
              </button>

              <button onClick={() => onNavigate("login")}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium tracking-wider transition-all dd-glow"
                style={{ border: `1px solid ${dm ? "rgba(196,164,120,0.25)" : "#111110"}`, color: dm ? accent : accentStrong }}
                onMouseEnter={e => e.currentTarget.style.background = dm ? "rgba(196,164,120,0.06)" : "rgba(17,17,16,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Portal Clientes
              </button>

              <button onClick={() => setMobileMenuOpen(o => !o)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: mobileMenuOpen ? "rgba(196,164,120,0.1)" : "rgba(255,255,255,0.05)", color: textFade, border: `1px solid ${mobileMenuOpen ? "rgba(196,164,120,0.2)" : "rgba(255,255,255,0.08)"}` }}
                aria-label="Menú">
                {mobileMenuOpen ? <Ic.X /> : <Ic.Menu />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="dd-mobile-menu md:hidden px-6 pb-5 pt-1" style={{ borderTop: `1px solid ${navBorder}` }}>
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map(item => (
                  <a key={item.t} href="#"
                    onClick={e => { e.preventDefault(); setMobileMenuOpen(false); if (item.v) onNavigate(item.v); }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: textFade2, background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,164,120,0.06)"; e.currentTarget.style.color = accent; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textFade2; }}>
                    {item.t}
                    <span style={{ color: "rgba(196,164,120,0.3)", fontSize: "10px" }}>→</span>
                  </a>
                ))}
                <div style={{ height: 1, background: navBorder, margin: "6px 0" }} />
                <button onClick={() => { setMobileMenuOpen(false); onNavigate("login"); }}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wider"
                  style={{ background: ctaBg, color: ctaText }}>
                  Portal Clientes
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* ── HERO (igual que v1) ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <video
            className="absolute top-[72px] left-0 right-0 w-full object-cover object-top lg:object-contain"
            src="/video/hero.mp4"
            autoPlay muted loop playsInline preload="auto" aria-hidden="true"
            style={{ opacity: dm ? 0.75 : 0.9, height: "calc(100vh - 72px)" }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: dm
              ? "linear-gradient(180deg, rgba(8,10,14,0.35) 0%, rgba(8,10,14,0.1) 40%, rgba(8,10,14,0.65) 100%)"
              : "linear-gradient(180deg, rgba(245,240,232,0.2) 0%, rgba(245,240,232,0.05) 40%, rgba(245,240,232,0.55) 100%)"
          }} />
          {dm && <TopoCanvas />}
          <div className="absolute inset-0" style={{ background: dm ? "radial-gradient(ellipse at 70% 40%, rgba(196,164,120,0.04), transparent 60%)" : "radial-gradient(ellipse at 70% 40%, rgba(196,164,120,0.08), transparent 60%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-3xl pt-24">
              <div className="dd-fade-up flex items-center gap-4 mb-12">
                <div className="h-px w-12" style={{ background: "rgba(196,164,120,0.3)" }} />
                <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.6)" }}>34°36'S  58°22'W — ARGENTINA</span>
              </div>

              <h1 className="dd-fade-up dd-fade-up-d1 text-4xl lg:text-7xl font-light leading-tight tracking-tight mb-3" style={{ color: dm ? "white" : textPri }}>
                Visión aérea para
              </h1>
              <h1 className="dd-fade-up dd-fade-up-d2 text-4xl lg:text-7xl font-semibold leading-tight tracking-tight mb-10" style={{ color: accentStrong }}>
                decisiones estratégicas
              </h1>

              <div className="dd-fade-up dd-fade-up-d3">
                <div className="dd-line h-px mb-8" style={{ background: "linear-gradient(90deg, rgba(196,164,120,0.3), transparent)" }} />
              </div>

              <p className="dd-fade-up dd-fade-up-d3 text-base lg:text-lg leading-relaxed max-w-xl mb-4" style={{ color: dm ? "rgba(255,255,255,0.45)" : textMed }}>
                Vuelos FPV para Real Estate de alto impacto. Seguimiento de obra. Fotogrametría con ortomosaicos georreferenciados.
              </p>
              <p className="dd-fade-up dd-fade-up-d3 text-sm leading-relaxed max-w-xl mb-12" style={{ color: dm ? "rgba(255,255,255,0.3)" : textFade }}>
                Procesamos y entregamos datos de alta precisión en una plataforma propia diseñada para visualizar, medir y analizar cada proyecto en detalle.
              </p>

              <div className="dd-fade-up dd-fade-up-d4 flex flex-wrap items-center gap-4">
                <button onClick={() => onNavigate("login")} className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all dd-glow" style={{ background: ctaBg, color: ctaText }}>
                  Acceder al portal <Ic.Arrow />
                </button>
                <button onClick={() => onNavigate("presupuesto")} className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{ color: dm ? "rgba(255,255,255,0.5)" : textFade, border: dm ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${accent}20` }}>
                  Solicitar presupuesto
                </button>
              </div>
            </div>

            <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8">
              {[
                { n: <Counter end={24000} />, u: "ha", l: "relevadas" },
                { n: <Counter end={340} suffix="+" />, u: "", l: "proyectos" },
                { n: "±2", u: "cm", l: "precisión GSD" },
              ].map((m, i) => (
                <div key={i} className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-light dd-mono" style={{ color: accentStrong }}>{m.n}</span>
                    <span className="text-xs dd-mono" style={{ color: "rgba(196,164,120,0.5)" }}>{m.u}</span>
                  </div>
                  <span className="text-xs tracking-wider" style={{ color: dm ? "rgba(255,255,255,0.2)" : textFade }}>{m.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" style={{ opacity: scrollY > 100 ? 0 : 0.3, transition: "opacity 0.3s" }}>
            <Ic.ArrowDown />
          </div>
        </section>

        {/* ── SERVICES — 3 escenas ── */}
        <ServiceSceneOverlay
          dm={dm} textPri={textPri} textMed={textMed} textFade={textFade}
          index={1}
          color={C_FPV}
          tag="VUELOS FPV · CINE AÉREO"
          title="Vuelos FPV para"
          titleStrong="Real Estate de alto impacto"
          sector="Real Estate · Marketing · Arquitectura"
          desc="Producción audiovisual cinematográfica con drones FPV y aéreos 4K/60fps estabilizados. Recorridos inmersivos, color grading D-Log y entregables listos para sala de ventas, redes y campañas digitales."
          deliverables={[
            "Video FPV + aéreo editado en 4K / 60fps",
            "Cortes de 60\" para redes sociales (9:16 y 16:9)",
            "Fotos aéreas de alta resolución",
            "Color grading D-Log con LUT custom",
          ]}
          metrics={[
            { val: "4K", lbl: "60fps · D-Log" },
            { val: "2–3", lbl: "días producción" },
            { val: "4", lbl: "formatos entregados" },
          ]}
          reverse={false}
          visual={<VideoVisual src="/video/fpv.mp4" color={C_FPV} />}
        />

        <ServiceSceneOverlay
          dm={dm} textPri={textPri} textMed={textMed} textFade={textFade}
          index={2}
          color={C_OBRA}
          tag="SEGUIMIENTO DE OBRA"
          title="Registro fechado de"
          titleStrong="cada etapa constructiva"
          sector="Constructoras · Desarrolladoras · Inversores"
          desc="Vuelos periódicos con fotogrametría y video 4K. Ortomosaico georreferenciado por etapa con comparativa temporal superpuesta. Material listo para sala de ventas e informes a inversores."
          deliverables={[
            "Ortomosaico GeoTIFF por etapa de avance",
            "Video 4K editado con timestamps por etapa",
            "Comparativa multi-vuelo superpuesta",
            "Reporte de avance PDF para inversores",
          ]}
          metrics={[
            { val: "18", lbl: "vuelos / obra" },
            { val: "4.200 m²", lbl: "superficie" },
            { val: "±2 cm", lbl: "precisión" },
          ]}
          reverse={true}
          visual={<VideoVisual src="/video/seguimiento.mp4" color={C_OBRA} />}
        />

        <ServiceSceneCard
          dm={dm} textPri={textPri} textMed={textMed} textFade={textFade}
          index={3}
          color={C_FOTO}
          tag="FOTOGRAMETRÍA"
          title="Ortomosaicos y"
          titleStrong="modelos 3D del terreno"
          sector="Agro · Minería · Ingeniería civil · Catastro"
          desc="Relevamientos aéreos completos. Generamos ortomosaicos GeoTIFF, nubes de puntos densas (LAS 1.4), modelos de superficie (DSM/MDT) y curvas de nivel. Todo georreferenciado con GCPs y proyección UTM."
          deliverables={[
            "Ortomosaico GeoTIFF de alta resolución",
            "Nube de puntos LAS 1.4 clasificada",
            "DSM y MDT georreferenciados",
            "Curvas de nivel con equidistancia configurable",
          ]}
          metrics={[
            { val: "243 ha", lbl: "área por vuelo" },
            { val: "±2 cm", lbl: "precisión GSD" },
            { val: "48 M", lbl: "puntos en nube" },
          ]}
          reverse={false}
          visual={<div className="absolute inset-0 w-full h-full"><LeafletMap /></div>}
        />

        {/* ── CTA ── */}
        <section className="relative py-32 mt-16 lg:mt-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <span className="dd-mono text-xs tracking-widest block mb-6" style={{ color: "rgba(196,164,120,0.5)" }}>COMENZAR</span>
            <h2 className="text-3xl lg:text-5xl font-light mb-5" style={{ color: textPri }}>
              ¿Necesitás <span className="font-semibold" style={{ color: accentStrong }}>datos aéreos</span> para tu próximo proyecto?
            </h2>
            <p className="text-sm leading-relaxed mb-12" style={{ color: textFade }}>
              Contanos los requerimientos técnicos de tu proyecto y te enviamos una propuesta detallada en menos de 24 horas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => onNavigate("presupuesto")} className="px-8 py-4 rounded-xl text-sm font-semibold tracking-wide dd-glow transition-all" style={{ background: ctaBg, color: ctaText }}>Solicitar presupuesto</button>
              <button onClick={() => onNavigate("login")} className="px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{ color: textFade, border: dm ? "1px solid rgba(255,255,255,0.06)" : `1px solid ${accent}20` }}>Ya tengo cuenta</button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t py-8 px-6 lg:px-12" style={{ borderColor: dm ? "rgba(255,255,255,0.03)" : "rgba(196,164,120,0.1)" }}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><span style={{ color: "#c4a478" }}>◈</span><span className="text-xs font-medium tracking-wider" style={{ color: dm ? "rgba(255,255,255,0.25)" : textDim }}>DESDEDRONE.AR</span></div>
            <p className="dd-mono text-xs" style={{ color: dm ? "rgba(255,255,255,0.12)" : textDim }}>© 2026 — Servicios aéreos con drones de precisión — Argentina</p>
          </div>
        </footer>

        {/* ── V1 / V2 toggle ── */}
        <button onClick={() => onNavigate("landing")}
          className="dd-mono fixed bottom-4 right-4 z-[120] px-3 py-1.5 rounded-full text-[10px] tracking-widest transition-opacity"
          style={{ background: dm ? "rgba(10,12,16,0.7)" : "rgba(245,245,242,0.85)", color: accentStrong, border: `1px solid ${dm ? "rgba(196,164,120,0.25)" : "rgba(17,17,16,0.18)"}`, backdropFilter: "blur(10px)", opacity: 0.45 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
          title="Volver a landing original">
          ← V1 · V2
        </button>
      </div>
    </div>
  );
}
