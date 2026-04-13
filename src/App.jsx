import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ───────────────────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Relevamiento Campo Lote 14 — Pergamino",
    date: "2026-03-15",
    status: "Entregado",
    type: "Fotogrametría",
    thumbnail: null,
    budget: 285000,
    invoiced: true,
  },
  {
    id: 2,
    name: "Inspección Paneles Solares — Parque Eólico Sur",
    date: "2026-04-01",
    status: "En revisión",
    type: "Video + Fotogrametría",
    thumbnail: null,
    budget: 410000,
    invoiced: false,
  },
  {
    id: 3,
    name: "Obra Civil Barrio Los Álamos — Etapa 2",
    date: "2026-04-10",
    status: "En proceso",
    type: "Fotogrametría",
    thumbnail: null,
    budget: 195000,
    invoiced: false,
  },
];

const MOCK_OBSERVATIONS = [
  { id: 1, time: "00:32", text: "Revisar encuadre en esta toma, se ve el horizonte inclinado.", author: "Cliente", date: "2026-04-08" },
  { id: 2, time: "01:15", text: "Excelente transición. Mantener este estilo.", author: "Cliente", date: "2026-04-09" },
];

// ─── ICONS (inline SVG) ─────────────────────────────────────────────
const Icons = {
  Drone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
      <path d="M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4"/>
      <path d="M2 2h4M18 2h4M2 22h4M18 22h4"/>
    </svg>
  ),
  Map: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z"/><path d="M9 4v13M15 7v13"/>
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="2" y="4" width="15" height="16" rx="2"/><path d="M17 10l5-3v10l-5-3"/>
    </svg>
  ),
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 3v12M12 15l-4-4M12 15l4-4M4 19h16"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3.5-7 7-7s7 3 7 7"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
    </svg>
  ),
  Invoice: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h4"/>
      <path d="M14 14l1 1 3-3"/>
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M5 12l5 5L20 7"/>
    </svg>
  ),
  Layers: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  ZoomIn: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M11 8v6M8 11h6"/>
    </svg>
  ),
  Crosshair: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
    </svg>
  ),
};

// ─── ORTHO MAP VIEWER ────────────────────────────────────────────────
function OrthoViewer() {
  const canvasRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState("ortho");
  const [zoom, setZoom] = useState(1);
  const [measuring, setMeasuring] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    if (activeLayer === "ortho") {
      // Simulated orthomosaic
      for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
          const noise = Math.sin(x * 0.02) * Math.cos(y * 0.015) * 30;
          const field = Math.sin((x + y) * 0.005) > 0;
          const r = field ? 85 + noise : 60 + noise;
          const g = field ? 140 + noise : 100 + noise;
          const b = field ? 65 + noise : 55 + noise;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 4, 4);
        }
      }
      // Simulated road
      ctx.strokeStyle = "#8B7355";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.4);
      ctx.bezierCurveTo(w * 0.3, h * 0.35, w * 0.6, h * 0.55, w, h * 0.5);
      ctx.stroke();
      // Grid overlay
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    } else if (activeLayer === "dsm") {
      // Simulated DSM (elevation)
      for (let y = 0; y < h; y += 3) {
        for (let x = 0; x < w; x += 3) {
          const elev = Math.sin(x * 0.01 + 1) * Math.cos(y * 0.008) * 0.5 + 0.5;
          const hue = (1 - elev) * 240;
          ctx.fillStyle = `hsl(${hue}, 70%, ${40 + elev * 30}%)`;
          ctx.fillRect(x, y, 3, 3);
        }
      }
    } else if (activeLayer === "pointcloud") {
      // Simulated point cloud
      ctx.fillStyle = "#0a0e14";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 8000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const elev = Math.sin(x * 0.01) * Math.cos(y * 0.008) * 0.5 + 0.5;
        const hue = elev * 120;
        const size = 1 + Math.random() * 2;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
        ctx.fillRect(x, y, size, size);
      }
    }
  }, [activeLayer, zoom]);

  const layers = [
    { id: "ortho", label: "Ortofoto", icon: <Icons.Map /> },
    { id: "dsm", label: "MDS / Elevación", icon: <Icons.Layers /> },
    { id: "pointcloud", label: "Nube de Puntos", icon: <Icons.Crosshair /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
        {layers.map(l => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: activeLayer === l.id ? "rgba(0, 230, 118, 0.15)" : "transparent",
              color: activeLayer === l.id ? "#00e676" : "rgba(255,255,255,0.5)",
              border: activeLayer === l.id ? "1px solid rgba(0,230,118,0.3)" : "1px solid transparent",
            }}
          >
            {l.icon} {l.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setMeasuring(!measuring)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-all"
          style={{
            background: measuring ? "rgba(255,171,0,0.15)" : "transparent",
            color: measuring ? "#ffab00" : "rgba(255,255,255,0.4)",
            border: measuring ? "1px solid rgba(255,171,0,0.3)" : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          📐 Medir
        </button>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>−</button>
          <span className="text-xs w-12 text-center" style={{ color: "rgba(255,255,255,0.5)" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>+</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden cursor-crosshair" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setInfo({ x: Math.round(x), y: Math.round(y), lat: (-33.8 + y * 0.0001).toFixed(6), lng: (-60.5 + x * 0.0001).toFixed(6), elev: (120 + Math.sin(x * 0.01) * 15).toFixed(1) });
      }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }} />
        {info && (
          <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(0,0,0,0.85)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ color: "#00e676" }}>LAT</span> {info.lat} &nbsp; <span style={{ color: "#00e676" }}>LNG</span> {info.lng} &nbsp; <span style={{ color: "#ffab00" }}>ELEV</span> {info.elev}m
          </div>
        )}
        {measuring && (
          <div className="absolute top-3 left-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.2)" }}>
            Click dos puntos en el mapa para medir distancia
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VIDEO REVIEWER ──────────────────────────────────────────────────
function VideoReviewer() {
  const [observations, setObservations] = useState(MOCK_OBSERVATIONS);
  const [newObs, setNewObs] = useState("");
  const [currentTime, setCurrentTime] = useState("00:00");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showWatermark, setShowWatermark] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 100; }
        const next = p + 0.5;
        const totalSec = Math.floor(next * 1.8);
        setCurrentTime(`${String(Math.floor(totalSec / 60)).padStart(2, "0")}:${String(totalSec % 60).padStart(2, "0")}`);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  const addObservation = () => {
    if (!newObs.trim()) return;
    setObservations([...observations, {
      id: observations.length + 1,
      time: currentTime,
      text: newObs,
      author: "Cliente",
      date: new Date().toISOString().split("T")[0],
    }]);
    setNewObs("");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Video area */}
      <div className="flex-1 flex flex-col">
        {/* Simulated video player */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ background: "#0a0e14" }}>
          {/* Simulated aerial footage */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse at ${30 + progress * 0.4}% ${40 + Math.sin(progress * 0.1) * 10}%, rgba(76,175,80,0.3), transparent 60%),
              radial-gradient(ellipse at ${60 - progress * 0.2}% ${50 + Math.cos(progress * 0.08) * 15}%, rgba(139,115,85,0.4), transparent 50%),
              linear-gradient(135deg, #1a2a1a 0%, #0d1b0d 100%)
            `
          }} />
          
          {showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.15 }}>
              <div className="text-6xl font-bold tracking-widest" style={{ color: "white", transform: "rotate(-30deg)" }}>
                DESDEDRONE.AR
              </div>
            </div>
          )}

          <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs" style={{ background: "rgba(255,0,0,0.8)", color: "white" }}>
            MUESTRA
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}>
            {/* Progress bar */}
            <div className="w-full h-1 rounded-full mb-2 cursor-pointer" style={{ background: "rgba(255,255,255,0.15)" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setProgress(pct);
                const totalSec = Math.floor(pct * 1.8);
                setCurrentTime(`${String(Math.floor(totalSec / 60)).padStart(2, "0")}:${String(totalSec % 60).padStart(2, "0")}`);
              }}
            >
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#00e676" }} />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setPlaying(!playing)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <span style={{ color: "white", fontSize: "14px" }}>{playing ? "⏸" : "▶"}</span>
              </button>
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.7)" }}>{currentTime} / 03:00</span>
              <div className="flex-1" />
              <button
                onClick={() => alert("Descarga de muestra con marca de agua iniciada")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ background: "rgba(0,230,118,0.15)", color: "#00e676", border: "1px solid rgba(0,230,118,0.3)" }}
              >
                <Icons.Download /> Descargar muestra
              </button>
            </div>
          </div>

          {/* Observation markers on timeline */}
          {observations.map(obs => {
            const timeParts = obs.time.split(":");
            const sec = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
            const pos = (sec / 180) * 100;
            return (
              <div key={obs.id} className="absolute bottom-12 w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2"
                style={{ left: `${pos}%`, background: "#ffab00", border: "2px solid rgba(0,0,0,0.5)" }}
                title={obs.text}
              />
            );
          })}
        </div>
      </div>

      {/* Observations panel */}
      <div className="w-full lg:w-80 flex flex-col border-l" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}>
        <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Icons.Chat />
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>Observaciones</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
            {observations.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {observations.map(obs => (
            <div key={obs.id} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(0,230,118,0.1)", color: "#00e676" }}>
                  {obs.time}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{obs.date}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{obs.text}</p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newObs}
              onChange={e => setNewObs(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addObservation()}
              placeholder={`Observación en ${currentTime}...`}
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button onClick={addObservation} className="px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "#00e676", color: "#0a0e14" }}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#060a10" }}>
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(0,230,118,0.08), transparent 40%),
          radial-gradient(circle at 80% 20%, rgba(0,176,255,0.06), transparent 40%)
        `
      }} />
      {/* Grid BG */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <div className="relative w-full max-w-sm mx-4 p-8 rounded-2xl" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)"
      }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)" }}>
            <span className="text-2xl" style={{ color: "#00e676" }}>◈</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "white", fontFamily: "'Instrument Sans', sans-serif" }}>
            DESDEDRONE<span style={{ color: "#00e676" }}>.AR</span>
          </h1>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>Portal de Proyectos</p>
        </div>

        <div className="space-y-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <button onClick={onLogin} className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all"
            style={{ background: "#00e676", color: "#0a0e14" }}
          >
            Ingresar
          </button>
        </div>
        <p className="text-xs text-center mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
          ¿No tenés cuenta? <span style={{ color: "#00e676", cursor: "pointer" }}>Contactanos</span>
        </p>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────
export default function DesdeDroneApp() {
  const [view, setView] = useState("landing"); // landing | login | dashboard | ortho | video
  const [selectedProject, setSelectedProject] = useState(null);
  const [animateIn, setAnimateIn] = useState(true);

  useEffect(() => {
    setAnimateIn(true);
    const t = setTimeout(() => setAnimateIn(false), 600);
    return () => clearTimeout(t);
  }, [view]);

  // ─── LANDING PAGE ────────────────────────────
  if (view === "landing") {
    return (
      <div className="min-h-screen" style={{ background: "#060a10", fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(circle at 15% 85%, rgba(0,230,118,0.07), transparent 35%),
            radial-gradient(circle at 85% 15%, rgba(0,176,255,0.05), transparent 35%),
            radial-gradient(circle at 50% 50%, rgba(0,230,118,0.02), transparent 60%)
          `
        }} />
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        {/* Nav */}
        <nav className="relative flex items-center justify-between px-6 lg:px-12 py-5">
          <div className="flex items-center gap-2">
            <span className="text-lg" style={{ color: "#00e676" }}>◈</span>
            <span className="text-sm font-bold tracking-tight" style={{ color: "white" }}>
              DESDEDRONE<span style={{ color: "#00e676" }}>.AR</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Servicios", "Tecnología", "Proyectos", "Contacto"].map(item => (
              <a key={item} href="#" className="text-xs tracking-wide transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => e.target.style.color = "#00e676"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >{item}</a>
            ))}
          </div>
          <button onClick={() => setView("login")} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ border: "1px solid rgba(0,230,118,0.3)", color: "#00e676" }}
            onMouseEnter={e => { e.target.style.background = "rgba(0,230,118,0.1)"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; }}
          >
            <Icons.User /> Portal Clientes
          </button>
        </nav>

        {/* Hero */}
        <section className="relative px-6 lg:px-12 pt-20 pb-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.15)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e676", boxShadow: "0 0 8px rgba(0,230,118,0.5)" }} />
              <span className="text-xs" style={{ color: "#00e676" }}>Servicios con drones de alta precisión</span>
            </div>
            
            <h1 className="text-4xl lg:text-7xl font-bold leading-none tracking-tight mb-6" style={{ color: "white" }}>
              Visión aerea{" "}
              <span style={{ color: "#00e676" }}>para deciciones</span>
              <br />
              estratégicas
            </h1>
            
            <p className="text-base lg:text-lg max-w-xl mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
              Fotogrametría, ortomosaicos, modelos de elevación y video aéreo profesional. 
              Entregamos datos precisos en una plataforma donde visualizás, medís y revisás todo online.
            </p>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setView("login")} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#00e676", color: "#0a0e14" }}
              >
                Ver mis proyectos <Icons.Arrow />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Solicitar presupuesto
              </button>
            </div>
          </div>

          {/* Floating stats */}
          <div className="absolute right-12 top-32 hidden xl:flex flex-col gap-4">
            {[
              { n: "2.4M", l: "hectáreas relevadas", c: "#00e676" },
              { n: "340+", l: "proyectos entregados", c: "#00b0ff" },
              { n: "±2cm", l: "precisión GSD", c: "#ffab00" },
            ].map((s, i) => (
              <div key={i} className="px-5 py-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
                <div className="text-2xl font-bold font-mono" style={{ color: s.c }}>{s.n}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="relative px-6 lg:px-12 pb-24">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <Icons.Map />,
                title: "Fotogrametría & Ortomosaicos",
                desc: "Ortomosaicos de alta resolución, modelos de superficie, curvas de nivel. Visualizá y medí directo en la plataforma.",
                features: ["Ortofoto georreferenciada", "Modelo Digital de Superficie", "Nube de puntos 3D", "Curvas de nivel"],
              },
              {
                icon: <Icons.Video />,
                title: "Video Aéreo Profesional",
                desc: "Filmación 4K con drones de última generación. Edición profesional con revisión online y descarga con marca de agua.",
                features: ["Filmación 4K/60fps", "Edición profesional", "Revisión con observaciones", "Descarga de muestra"],
              },
              {
                icon: <Icons.Grid />,
                title: "Inspección & Monitoreo",
                desc: "Inspección de infraestructura, paneles solares, líneas de alta tensión. Reportes detallados con hallazgos geolocalizados.",
                features: ["Inspección térmica", "Detección de anomalías", "Seguimiento temporal", "Reportes automáticos"],
              },
            ].map((s, i) => (
              <div key={i} className="group p-6 rounded-2xl transition-all cursor-default" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,230,118,0.2)"; e.currentTarget.style.background = "rgba(0,230,118,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(0,230,118,0.1)", color: "#00e676" }}>
                  {s.icon}
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "white" }}>{s.title}</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>{s.desc}</p>
                <div className="space-y-1.5">
                  {s.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <span style={{ color: "#00e676" }}><Icons.Check /></span> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform preview */}
        <section className="relative px-6 lg:px-12 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold mb-3" style={{ color: "white" }}>
              Tu plataforma de <span style={{ color: "#00e676" }}>entregables</span>
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              Accedé a tus mapas, medí distancias, revisá videos y dejá comentarios. Todo en un solo lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div onClick={() => { setSelectedProject(MOCK_PROJECTS[0]); setView("ortho"); }}
              className="relative p-6 rounded-2xl cursor-pointer overflow-hidden group transition-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", minHeight: "200px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,230,118,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
            >
              <div className="absolute inset-0" style={{
                background: "radial-gradient(circle at 70% 70%, rgba(76,175,80,0.15), transparent 60%)"
              }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3" style={{ color: "#00e676" }}>
                  <Icons.Map /> <span className="text-xs font-semibold tracking-wide">VISUALIZADOR DE MAPAS</span>
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Ortomosaicos, DSM, nube de puntos. Medí distancias y áreas directo en el browser.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: "#00e676" }}>
                  Probar demo <Icons.Arrow />
                </div>
              </div>
            </div>

            <div onClick={() => { setSelectedProject(MOCK_PROJECTS[1]); setView("video"); }}
              className="relative p-6 rounded-2xl cursor-pointer overflow-hidden group transition-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", minHeight: "200px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,176,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
            >
              <div className="absolute inset-0" style={{
                background: "radial-gradient(circle at 30% 70%, rgba(0,176,255,0.1), transparent 60%)"
              }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3" style={{ color: "#00b0ff" }}>
                  <Icons.Video /> <span className="text-xs font-semibold tracking-wide">REVISIÓN DE VIDEO</span>
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Revisá el video editado, dejá observaciones con timestamp y descargá muestra con marca de agua.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: "#00b0ff" }}>
                  Probar demo <Icons.Arrow />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative px-6 lg:px-12 py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span style={{ color: "#00e676" }}>◈</span>
              <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>DESDEDRONE.AR</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              © 2026 DesdeDrone. Servicios aéreos con drones. Argentina.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // ─── LOGIN ─────────────────────────────────
  if (view === "login") {
    return (
      <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <LoginScreen onLogin={() => setView("dashboard")} />
        <button onClick={() => setView("landing")} className="fixed top-4 left-4 text-xs px-3 py-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}>
          ← Volver
        </button>
      </div>
    );
  }

  // ─── APP SHELL (dashboard, ortho, video) ──
  return (
    <div className="min-h-screen flex" style={{ background: "#0a0e14", fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div className="w-16 lg:w-56 flex-shrink-0 flex flex-col border-r" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
        <div className="p-4 flex items-center gap-2">
          <span className="text-lg" style={{ color: "#00e676" }}>◈</span>
          <span className="hidden lg:inline text-xs font-bold tracking-tight" style={{ color: "white" }}>DESDEDRONE</span>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: "dashboard", icon: <Icons.Grid />, label: "Proyectos" },
            { id: "ortho", icon: <Icons.Map />, label: "Mapas" },
            { id: "video", icon: <Icons.Video />, label: "Videos" },
            { id: "invoices", icon: <Icons.Invoice />, label: "Facturación" },
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all"
              style={{
                background: view === item.id ? "rgba(0,230,118,0.1)" : "transparent",
                color: view === item.id ? "#00e676" : "rgba(255,255,255,0.4)",
              }}
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={() => setView("landing")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <Icons.Lock />
            <span className="hidden lg:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "white" }}>
              {view === "dashboard" && "Mis Proyectos"}
              {view === "ortho" && (selectedProject?.name || "Visualizador de Mapas")}
              {view === "video" && (selectedProject?.name || "Revisión de Video")}
              {view === "invoices" && "Presupuestos & Facturación"}
            </h2>
            {selectedProject && (view === "ortho" || view === "video") && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{selectedProject.date} · {selectedProject.type}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(0,230,118,0.15)", color: "#00e676" }}>
              C
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* DASHBOARD */}
          {view === "dashboard" && (
            <div className="p-6 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Proyectos activos", value: "3", color: "#00e676" },
                  { label: "En revisión", value: "1", color: "#ffab00" },
                  { label: "Facturado", value: "$285K", color: "#00b0ff" },
                  { label: "Pendiente", value: "$605K", color: "rgba(255,255,255,0.5)" },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                    <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Project list */}
              <div className="space-y-2">
                {MOCK_PROJECTS.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,230,118,0.2)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                  >
                    {/* Thumbnail placeholder */}
                    <div className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(0,230,118,0.05)" }}>
                      <span style={{ color: "#00e676" }}><Icons.Map /></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate" style={{ color: "white" }}>{p.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{p.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          background: p.status === "Entregado" ? "rgba(0,230,118,0.1)" : p.status === "En revisión" ? "rgba(255,171,0,0.1)" : "rgba(0,176,255,0.1)",
                          color: p.status === "Entregado" ? "#00e676" : p.status === "En revisión" ? "#ffab00" : "#00b0ff",
                        }}>
                          {p.status}
                        </span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{p.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.type.includes("Fotogrametría") && (
                        <button onClick={() => { setSelectedProject(p); setView("ortho"); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                          style={{ background: "rgba(0,230,118,0.08)", color: "#00e676", border: "1px solid rgba(0,230,118,0.15)" }}
                        >
                          <Icons.Map /> Mapas
                        </button>
                      )}
                      {p.type.includes("Video") && (
                        <button onClick={() => { setSelectedProject(p); setView("video"); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                          style={{ background: "rgba(0,176,255,0.08)", color: "#00b0ff", border: "1px solid rgba(0,176,255,0.15)" }}
                        >
                          <Icons.Video /> Video
                        </button>
                      )}
                    </div>
                    <div className="text-right hidden lg:block">
                      <div className="text-sm font-mono font-medium" style={{ color: "white" }}>
                        ${(p.budget / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs" style={{ color: p.invoiced ? "#00e676" : "rgba(255,255,255,0.3)" }}>
                        {p.invoiced ? "Facturado" : "Pendiente"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORTHO VIEWER */}
          {view === "ortho" && (
            <div className="h-full" style={{ minHeight: "calc(100vh - 60px)" }}>
              <OrthoViewer />
            </div>
          )}

          {/* VIDEO REVIEWER */}
          {view === "video" && (
            <div className="h-full" style={{ minHeight: "calc(100vh - 60px)" }}>
              <VideoReviewer />
            </div>
          )}

          {/* INVOICES */}
          {view === "invoices" && (
            <div className="p-6 space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {MOCK_PROJECTS.map(p => (
                  <div key={p.id} className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: "white" }}>{p.name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{p.type} · {p.date}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{
                        background: p.invoiced ? "rgba(0,230,118,0.1)" : "rgba(255,171,0,0.1)",
                        color: p.invoiced ? "#00e676" : "#ffab00",
                      }}>
                        {p.invoiced ? "✓ Facturado" : "Pendiente"}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Presupuesto</div>
                        <div className="text-2xl font-bold font-mono" style={{ color: "white" }}>${p.budget.toLocaleString("es-AR")}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          Ver detalle
                        </button>
                        {!p.invoiced && (
                          <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(0,230,118,0.1)", color: "#00e676", border: "1px solid rgba(0,230,118,0.2)" }}>
                            Generar factura
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
