import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PointCloudViewer from "./PointCloudViewer.jsx";
import { CLOUDS } from "./clouds";
import LandingV3 from "./LandingV3.jsx";

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════
const PROJECTS = [
  { id:1, name:"Relevamiento Campo Lote 14 — Pergamino", date:"2026-03-15", status:"Entregado", type:"Fotogrametría", budget:285000, invoiced:true },
  { id:2, name:"Inspección Paneles Solares — Parque Eólico Sur", date:"2026-04-01", status:"En revisión", type:"Video + Fotogrametría", budget:410000, invoiced:false },
  { id:3, name:"Obra Civil Barrio Los Álamos — Etapa 2", date:"2026-04-10", status:"En proceso", type:"Fotogrametría", budget:195000, invoiced:false },
];
const OBS_INIT = [
  { id:1, time:"00:32", text:"Revisar encuadre en esta toma, se ve el horizonte inclinado.", author:"Cliente", date:"2026-04-08" },
  { id:2, time:"01:15", text:"Excelente transición. Mantener este estilo.", author:"Cliente", date:"2026-04-09" },
];

// ═══════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════
// eslint-disable-next-line react-refresh/only-export-components
export const Ic = {
  Map:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z"/><path d="M9 4v13M15 7v13"/></svg>,
  Video:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><rect x="2" y="4" width="15" height="16" rx="2"/><path d="M17 10l5-3v10l-5-3"/></svg>,
  Grid:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Download:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M12 3v12M12 15l-4-4M12 15l4-4M4 19h16"/></svg>,
  Lock:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>,
  Invoice:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h4"/><path d="M14 14l1 1 3-3"/></svg>,
  Chat:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Arrow:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  ArrowDown:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
  Layers:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  Crosshair:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>,
  Scan:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/></svg>,
  Target:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Drone:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4"/><path d="M2 2h4M18 2h4M2 22h4M18 22h4"/></svg>,
  Cpu:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>,
  Signal:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4"/></svg>,
  Eye:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  Ruler:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M21.9 7.1L16.9 2.1a1 1 0 00-1.4 0l-14 14a1 1 0 000 1.4l5 5a1 1 0 001.4 0l14-14a1 1 0 000-1.4z"/><path d="M14.5 5.5l1 1M11.5 8.5l1 1M8.5 11.5l1 1M5.5 14.5l1 1"/></svg>,
  Building:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01"/></svg>,
  Camera:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Calculator:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="2"/><rect x="7" y="5" width="10" height="4"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/></svg>,
  Package:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v9"/></svg>,
  Check:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M5 13l4 4L19 7"/></svg>,
  File:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M10 13h4M10 17h6"/></svg>,
  Sun:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Moon:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Menu:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  X:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Mail:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  Send:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Phone:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z"/></svg>,
  MapPin:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// ═══════════════════════════════════════════════════════════════════════
// TOPOGRAPHIC CANVAS
// ═══════════════════════════════════════════════════════════════════════
export function TopoCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth * 1.5; c.height = c.offsetHeight * 1.5; };
    resize();
    window.addEventListener("resize", resize);
    let frame = 0, animId;
    const draw = () => {
      frame++;
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      
      // Topographic contour lines
      for (let ring = 0; ring < 12; ring++) {
        const cx = w * 0.55 + Math.sin(frame * 0.003 + ring * 0.5) * 20;
        const cy = h * 0.45 + Math.cos(frame * 0.004 + ring * 0.3) * 15;
        const rx = 80 + ring * 55 + Math.sin(frame * 0.002 + ring) * 10;
        const ry = 50 + ring * 35 + Math.cos(frame * 0.003 + ring) * 8;
        const rot = -0.15 + ring * 0.03 + Math.sin(frame * 0.001) * 0.02;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = `rgba(200, 180, 160, ${0.06 - ring * 0.003})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Subtle grid dots
      const spacing = 40;
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          const dist = Math.sqrt((x - w * 0.5) ** 2 + (y - h * 0.5) ** 2);
          const alpha = Math.max(0, 0.08 - dist * 0.00008);
          ctx.fillStyle = `rgba(180, 160, 140, ${alpha})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Animated measurement line
      const lineProgress = (frame * 0.3) % (w * 0.6);
      const lx1 = w * 0.2;
      const ly = h * 0.7;
      ctx.strokeStyle = "rgba(200, 160, 100, 0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(lx1, ly);
      ctx.lineTo(lx1 + lineProgress, ly - lineProgress * 0.15);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }} />;
}

// ═══════════════════════════════════════════════════════════════════════
// COUNTER
// ═══════════════════════════════════════════════════════════════════════
export function Counter({ end, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const t = Math.min((now - t0) / 2200, 1);
          setVal(Math.floor((1 - Math.pow(1 - t, 4)) * end));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{val.toLocaleString("es-AR")}{suffix}</span>;
}

// ═══════════════════════════════════════════════════════════════════════
// LEAFLET MAP — real georeferenced orthophoto + base map
// ═══════════════════════════════════════════════════════════════════════
export function LeafletMap({ metaUrl = "/maps/juana-manso.json" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [meta, setMeta] = useState(null);
  const [opacity, setOpacity] = useState(0.9);
  const [showPhotos, setShowPhotos] = useState(false);
  const overlayRef = useRef(null);
  const photosLayerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const m = await fetch(metaUrl).then(r => r.json());
      if (cancelled) return;
      setMeta(m);

      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
      mapRef.current = map;

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 22, maxNativeZoom: 19, attribution: "© Esri · World Imagery",
      }).addTo(map);

      const bounds = L.latLngBounds(m.bounds.sw, m.bounds.ne);
      overlayRef.current = L.imageOverlay(m.ortho, bounds, { opacity: 0.9, interactive: true }).addTo(map);

      fetch("/maps/bounds.geojson").then(r => r.json()).then(gj => {
        if (cancelled || !mapRef.current) return;
        L.geoJSON(gj, { style: { color: "#c4a478", weight: 2, fill: false, dashArray: "4 4" } }).addTo(mapRef.current);
      }).catch(() => {});

      map.fitBounds(bounds, { padding: [20, 20] });
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [metaUrl]);

  useEffect(() => {
    if (overlayRef.current) overlayRef.current.setOpacity(opacity);
  }, [opacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (showPhotos && !photosLayerRef.current) {
      fetch("/maps/shots.geojson").then(r => r.json()).then(gj => {
        if (!mapRef.current) return;
        photosLayerRef.current = L.geoJSON(gj, {
          pointToLayer: (_, latlng) => L.circleMarker(latlng, {
            radius: 3, color: "#d4a053", weight: 1, fillColor: "#d4a053", fillOpacity: 0.7,
          }),
        }).addTo(map);
      }).catch(() => {});
    } else if (!showPhotos && photosLayerRef.current) {
      map.removeLayer(photosLayerRef.current);
      photosLayerRef.current = null;
    }
  }, [showPhotos]);

  return (
    <div className="relative w-full h-full" style={{ background: "#0a0c10" }}>
      <div ref={containerRef} className="w-full h-full" />
      {meta && (
        <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2 p-3 rounded-lg" style={{ background: "rgba(10,12,16,0.82)", border: "1px solid rgba(196,164,120,0.18)", backdropFilter: "blur(10px)", minWidth: 220 }}>
          <div>
            <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>{meta.name}</div>
            <div className="text-xs font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{meta.date} · {meta.projection}</div>
          </div>
          <label className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Opacidad ortofoto
            <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="flex-1" style={{ accentColor: "#c4a478" }} />
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "rgba(255,255,255,0.5)" }}>
            <input type="checkbox" checked={showPhotos} onChange={e => setShowPhotos(e.target.checked)} style={{ accentColor: "#c4a478" }} />
            Mostrar tomas GPS
          </label>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ORTHO VIEWER
// ═══════════════════════════════════════════════════════════════════════
const terrainH = (nx, ny) =>
  Math.sin(nx * 1.3) * Math.cos(ny * 1.1) * 0.45 +
  Math.sin(nx * 2.7 + 0.5) * Math.cos(ny * 2.3 + 0.3) * 0.3 +
  Math.sin(nx * 5.1 + 1.2) * Math.cos(ny * 4.9 + 0.8) * 0.15 +
  Math.sin(nx * 9.3 + 0.7) * Math.cos(ny * 8.7 + 1.4) * 0.1;

function OrthoViewer() {
  const canvasRef = useRef(null);
  const [layer, setLayer] = useState("real");
  const [activeCloudId, setActiveCloudId] = useState(CLOUDS[0].id);
  const [zoom, setZoom] = useState(1);
  const [measuring, setMeasuring] = useState(false);
  const [info, setInfo] = useState(null);
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width = cv.offsetWidth, h = cv.height = cv.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    // Build shared terrain grid (scale factor S = 3px per sample)
    const S = 3;
    const cols = Math.ceil(w / S) + 1, rows = Math.ceil(h / S) + 1;
    let mn = Infinity, mx = -Infinity;
    const grid = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const v = terrainH(c / cols * 6, r / rows * 6);
        if (v < mn) mn = v; if (v > mx) mx = v;
        return v;
      })
    );
    const norm = grid.map(row => row.map(v => (v - mn) / (mx - mn)));
    const getE = (x, y) => norm[Math.min(Math.floor(y / S), rows - 1)][Math.min(Math.floor(x / S), cols - 1)];

    if (layer === "ortho") {
      // Agricultural field simulation with shared terrain for micro-relief
      const img = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const e = getE(x, y);
        const fx = Math.floor(x / (w / 8)), fy = Math.floor(y / (h / 6));
        const fs = (fx * 17 + fy * 11) % 5;
        let r, g, b;
        if (fs === 0) { r = 85 + e * 35; g = 145 + e * 40; b = 55 + e * 20; }       // cultivo verde
        else if (fs === 1) { r = 165 + e * 30; g = 130 + e * 25; b = 75 + e * 20; } // cosechado marrón
        else if (fs === 2) { r = 55 + e * 25; g = 105 + e * 35; b = 45 + e * 15; }  // cultivo denso
        else if (fs === 3) { r = 185 + e * 20; g = 158 + e * 18; b = 108 + e * 15; }// suelo
        else { r = 118 + e * 25; g = 162 + e * 28; b = 78 + e * 18; }               // pastizal
        const i = (y * w + x) * 4;
        img.data[i] = Math.min(255, r | 0); img.data[i + 1] = Math.min(255, g | 0); img.data[i + 2] = Math.min(255, b | 0); img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      // Field borders
      ctx.strokeStyle = "rgba(70,50,30,0.5)"; ctx.lineWidth = 1.5;
      for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i * w / 8, 0); ctx.lineTo(i * w / 8, h); ctx.stroke(); }
      for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, i * h / 6); ctx.lineTo(w, i * h / 6); ctx.stroke(); }
      // Roads
      ctx.strokeStyle = "rgba(210,190,145,0.75)"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.375, 0); ctx.lineTo(w * 0.375, h); ctx.stroke();
      // Subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    } else if (layer === "dsm") {
      // Rainbow heatmap: blue (low) → cyan → green → yellow → red (high)
      const img = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const e = getE(x, y);
        let r, g, b;
        if (e < 0.25) { const t = e / 0.25; r = 0; g = t * 255 | 0; b = 255; }
        else if (e < 0.5) { const t = (e - 0.25) / 0.25; r = 0; g = 255; b = (255 - t * 255) | 0; }
        else if (e < 0.75) { const t = (e - 0.5) / 0.25; r = t * 255 | 0; g = 255; b = 0; }
        else { const t = (e - 0.75) / 0.25; r = 255; g = (255 - t * 255) | 0; b = 0; }
        const i = (y * w + x) * 4; img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    } else if (layer === "pointcloud") {
      // Deterministic point cloud colored by elevation, with painter's sort
      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, w, h);
      const pts = [];
      const pw = 160, ph = 100;
      for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
        const e = (terrainH(i / pw * 6, j / ph * 6) - mn) / (mx - mn);
        pts.push({ x: (i / pw) * w + (e - 0.5) * 30, y: (j / ph) * h - e * 70, e });
      }
      pts.sort((a, b) => a.y - b.y);
      for (const p of pts) {
        const e = p.e;
        let r, g, b;
        if (e < 0.25) { const t = e / 0.25; r = 0; g = t * 150 | 0; b = (150 + t * 105) | 0; }
        else if (e < 0.5) { const t = (e - 0.25) / 0.25; r = t * 80 | 0; g = (150 + t * 80) | 0; b = (255 - t * 200) | 0; }
        else if (e < 0.75) { const t = (e - 0.5) / 0.25; r = (80 + t * 175) | 0; g = (230 - t * 30) | 0; b = Math.max(0, (55 - t * 55)) | 0; }
        else { const t = (e - 0.75) / 0.25; r = 255; g = (200 + t * 55) | 0; b = (20 + t * 235) | 0; }
        ctx.fillStyle = `rgba(${r},${g},${b},0.88)`;
        ctx.fillRect(p.x, p.y, 1.5 + e * 1.5, 1.5 + e * 1.5);
      }

    } else if (layer === "nivelacion") {
      // Topographic contour map: filled bands + marching-squares isolines
      const LEVELS = 12;
      const img = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const e = getE(x, y);
        let rv, gv, bv;
        if (e < 0.2) { const t = e / 0.2; rv = 20 + t * 40; gv = 100 + t * 60; bv = 40 + t * 20; }
        else if (e < 0.4) { const t = (e - 0.2) / 0.2; rv = 60 + t * 80; gv = 160 + t * 30; bv = 60 - t * 20; }
        else if (e < 0.6) { const t = (e - 0.4) / 0.2; rv = 140 + t * 60; gv = 190 - t * 50; bv = 40 - t * 10; }
        else if (e < 0.8) { const t = (e - 0.6) / 0.2; rv = 200 + t * 30; gv = 140 - t * 60; bv = 30 - t * 15; }
        else { const t = (e - 0.8) / 0.2; rv = 230 + t * 25; gv = 80 + t * 80; bv = 15 + t * 155; }
        const i = (y * w + x) * 4;
        img.data[i] = Math.min(255, Math.max(0, rv | 0)); img.data[i + 1] = Math.min(255, Math.max(0, gv | 0));
        img.data[i + 2] = Math.min(255, Math.max(0, bv | 0)); img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      // Contour isolines via simplified marching squares
      for (let lv = 1; lv < LEVELS; lv++) {
        const t = lv / LEVELS;
        const isMajor = lv % 3 === 0;
        ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.28)";
        ctx.lineWidth = isMajor ? 1.5 : 0.7;
        ctx.beginPath();
        for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) {
          const v00 = norm[r][c], v10 = norm[r][c + 1], v01 = norm[r + 1][c], v11 = norm[r + 1][c + 1];
          const x0 = c * S, y0 = r * S; const pts2 = [];
          if ((v00 < t) !== (v10 < t)) { const f = (t - v00) / (v10 - v00); pts2.push({ x: x0 + f * S, y: y0 }); }
          if ((v10 < t) !== (v11 < t)) { const f = (t - v10) / (v11 - v10); pts2.push({ x: x0 + S, y: y0 + f * S }); }
          if ((v01 < t) !== (v11 < t)) { const f = (t - v01) / (v11 - v01); pts2.push({ x: x0 + f * S, y: y0 + S }); }
          if ((v00 < t) !== (v01 < t)) { const f = (t - v00) / (v01 - v00); pts2.push({ x: x0, y: y0 + f * S }); }
          if (pts2.length >= 2) { ctx.moveTo(pts2[0].x, pts2[0].y); ctx.lineTo(pts2[1].x, pts2[1].y); }
        }
        ctx.stroke();
      }
      // Elevation labels on major contours
      ctx.font = "bold 9px monospace";
      for (let lv = 3; lv < LEVELS; lv += 3) {
        const elev = Math.round(118 + (lv / LEVELS) * 86);
        const ty = Math.round((lv / LEVELS) * h);
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(6, ty - 9, 36, 12);
        ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fillText(`${elev}m`, 8, ty);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
  }, [layer, zoom]);

  const LAYERS = [
    { id: "real",       label: "Mapa Real",      icon: <Ic.Crosshair /> },
    { id: "ortho",      label: "Ortofoto",      icon: <Ic.Map /> },
    { id: "pointcloud", label: "Nube de Puntos", icon: <Ic.Crosshair /> },
    { id: "dsm",        label: "Elevación DSM",  icon: <Ic.Layers /> },
    { id: "nivelacion", label: "Mapa de Nivel",  icon: <Ic.Target /> },
  ];

  const META = {
    real:       [["Proyecto","Juana Manso"],["Ubicación","Puerto Madero, CABA"],["Fecha vuelo","2026-02-27"],["Proyección","UTM 21S / WGS84"],["Puntos","12.36 M"],["GSD","5 cm"],["Elev. mín","-15.33 m"],["Elev. máx","21.99 m"],["Archivo","odm_orthophoto.tif"]],
    ortho:      [["Resolución","1.8 cm/px"],["Fecha vuelo","2026-03-15"],["Área","243 ha"],["GSD","1.82 cm"],["Altitud","65 m AGL"],["Cámara","DJI Air 2S"],["Archivo","lote14_ortho.tif"],["Tamaño","2.4 GB"]],
    pointcloud: [["Puntos","48.2 M"],["Densidad","12.4 pts/m²"],["Formato","LAS 1.4"],["Clases","Suelo · Veg. · Edificios"],["Archivo","lote14_cloud.laz"],["Tamaño","890 MB"]],
    dsm:        [["Resolución","5 cm/px"],["Elev. mín","118.3 m"],["Elev. máx","203.7 m"],["Diferencia","85.4 m"],["Fecha","2026-03-15"],["Archivo","lote14_dsm.tif"],["Tamaño","320 MB"]],
    nivelacion: [["Curvas","12 niveles"],["Equidistancia","1 m"],["Elev. mín","118 m"],["Elev. máx","204 m"],["Área cubierta","243 ha"],["Archivo","lote14_curvas.shp"],["Tamaño","4.2 MB"]],
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const v = terrainH(x / rect.width * 6, y / rect.height * 6);
    const elev = (118 + Math.min(1, Math.max(0, (v + 1) / 2)) * 86).toFixed(1);
    setInfo({ lat: (-33.8 + y * 0.0001).toFixed(6), lng: (-60.5 + x * 0.0001).toFixed(6), elev });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2.5 border-b flex-wrap" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
        {LAYERS.map(l => (
          <button key={l.id} onClick={() => setLayer(l.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{ background: layer === l.id ? "rgba(196,164,120,0.15)" : "transparent", color: layer === l.id ? "#c4a478" : "rgba(255,255,255,0.45)", border: layer === l.id ? "1px solid rgba(196,164,120,0.25)" : "1px solid transparent" }}>
            {l.icon}{l.label}
          </button>
        ))}
        {layer === "pointcloud" && (
          <select
            value={activeCloudId}
            onChange={(e) => setActiveCloudId(e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs font-medium ml-2"
            style={{
              background: "rgba(196,164,120,0.08)",
              color: "#c4a478",
              border: "1px solid rgba(196,164,120,0.2)",
            }}
          >
            {CLOUDS.map((c) => (
              <option key={c.id} value={c.id} style={{ background: "#0a0d14" }}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex-1" />
        <button onClick={() => setMeasuring(!measuring)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs"
          style={{ background: measuring ? "rgba(196,164,120,0.12)" : "transparent", color: measuring ? "#c4a478" : "rgba(255,255,255,0.4)", border: measuring ? "1px solid rgba(196,164,120,0.2)" : "1px solid rgba(255,255,255,0.08)" }}>
          <Ic.Ruler /> Medir
        </button>
        <button onClick={() => setShowPanel(p => !p)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs"
          style={{ background: showPanel ? "rgba(196,164,120,0.08)" : "transparent", color: showPanel ? "#c4a478" : "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Ic.Eye /> Info
        </button>
        <div className="flex items-center gap-1 ml-1">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>−</button>
          <span className="text-xs w-12 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>+</button>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs ml-1" style={{ background: "rgba(196,164,120,0.08)", color: "#c4a478", border: "1px solid rgba(196,164,120,0.15)" }}>
          <Ic.Download /> Exportar
        </button>
      </div>

      {/* Canvas area + metadata panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-hidden cursor-crosshair" onClick={layer === "real" ? undefined : handleClick}>
          {layer === "real" ? (
            <LeafletMap />
          ) : layer === "pointcloud" ? (
            <PointCloudViewer key={activeCloudId} cloudId={activeCloudId} />
          ) : (
            <canvas ref={canvasRef} className="w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }} />
          )}
          {info && (
            <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg text-xs font-mono" style={{ background: "rgba(0,0,0,0.85)", color: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color: "#c4a478" }}>LAT</span> {info.lat} &nbsp;
              <span style={{ color: "#c4a478" }}>LNG</span> {info.lng} &nbsp;
              <span style={{ color: "#d4a053" }}>ELEV</span> {info.elev}m
            </div>
          )}
          {measuring && (
            <div className="absolute top-3 left-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(196,164,120,0.08)", color: "#c4a478", border: "1px solid rgba(196,164,120,0.15)" }}>
              Modo medición — click dos puntos para calcular distancia
            </div>
          )}
          {/* Color scale for elevation layers */}
          {(layer === "dsm" || layer === "nivelacion") && (
            <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.82)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>204m</span>
              <div style={{ width: 10, height: 72, background: layer === "dsm" ? "linear-gradient(to bottom,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff)" : "linear-gradient(to bottom,#e8b870,#c87844,#8aba6a,#3e7028)", borderRadius: 4 }} />
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>118m</span>
            </div>
          )}
        </div>

        {/* Metadata panel */}
        {showPanel && (
          <div className="w-52 border-l flex flex-col" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.18)" }}>
            <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="text-xs font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>Metadatos</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{LAYERS.find(l => l.id === layer)?.label}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {META[layer].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: "rgba(255,255,255,0.22)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <button className="w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5" style={{ background: "rgba(196,164,120,0.08)", color: "#c4a478", border: "1px solid rgba(196,164,120,0.15)" }}>
                <Ic.Download /> Descargar archivo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIDEO REVIEWER
// ═══════════════════════════════════════════════════════════════════════
function VideoReviewer() {
  const [obs, setObs] = useState(OBS_INIT);
  const [newObs, setNewObs] = useState("");
  const [time, setTime] = useState("00:00");
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(()=>{setProg(p=>{if(p>=100){setPlaying(false);return 100;}const n=p+0.5;const s=Math.floor(n*1.8);setTime(`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`);return n;});},100);
    return ()=>clearInterval(iv);
  }, [playing]);
  const add=()=>{if(!newObs.trim())return;setObs([...obs,{id:obs.length+1,time,text:newObs,author:"Cliente",date:new Date().toISOString().split("T")[0]}]);setNewObs("");};
  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{background:"#080c12"}}>
          <div className="absolute inset-0" style={{background:`radial-gradient(ellipse at ${30+prog*0.4}% ${40+Math.sin(prog*0.1)*10}%, rgba(196,164,120,0.12), transparent 60%), radial-gradient(ellipse at ${60-prog*0.2}% ${50+Math.cos(prog*0.08)*15}%, rgba(100,90,75,0.3), transparent 50%), linear-gradient(135deg, #0c1208 0%, #080c12 100%)`}}/>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{opacity:0.08}}><div className="text-5xl font-bold tracking-widest" style={{color:"white",transform:"rotate(-25deg)"}}>DESDEDRONE.AR</div></div>
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-medium tracking-wider" style={{background:"rgba(180,60,40,0.8)",color:"white"}}>MUESTRA</div>
          <div className="absolute bottom-0 left-0 right-0 p-4" style={{background:"linear-gradient(transparent, rgba(0,0,0,0.85))"}}>
            <div className="w-full h-1 rounded-full mb-3 cursor-pointer" style={{background:"rgba(255,255,255,0.1)"}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const p=((e.clientX-r.left)/r.width)*100;setProg(p);const s=Math.floor(p*1.8);setTime(`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`);}}>
              <div className="h-full rounded-full transition-all" style={{width:`${prog}%`,background:"#c4a478"}}/>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>setPlaying(!playing)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.1)",backdropFilter:"blur(8px)"}}><span style={{color:"white",fontSize:"13px"}}>{playing?"⏸":"▶"}</span></button>
              <span className="text-xs font-mono" style={{color:"rgba(255,255,255,0.6)"}}>{time} / 03:00</span>
              <div className="flex-1"/>
              <button onClick={()=>alert("Descarga de muestra iniciada")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium tracking-wide" style={{background:"rgba(196,164,120,0.12)",color:"#c4a478",border:"1px solid rgba(196,164,120,0.2)"}}><Ic.Download/> Descargar muestra</button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-80 flex flex-col border-l" style={{borderColor:"rgba(255,255,255,0.05)",background:"rgba(0,0,0,0.12)"}}>
        <div className="p-3 border-b flex items-center gap-2" style={{borderColor:"rgba(255,255,255,0.05)"}}><Ic.Chat/><span className="text-sm font-medium" style={{color:"rgba(255,255,255,0.85)"}}>Observaciones</span><span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.35)"}}>{obs.length}</span></div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {obs.map(o=><div key={o.id} className="p-3 rounded-xl" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}><div className="flex items-center gap-2 mb-1.5"><span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{background:"rgba(196,164,120,0.08)",color:"#c4a478"}}>{o.time}</span><span className="text-xs" style={{color:"rgba(255,255,255,0.25)"}}>{o.date}</span></div><p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.65)"}}>{o.text}</p></div>)}
        </div>
        <div className="p-3 border-t" style={{borderColor:"rgba(255,255,255,0.05)"}}>
          <div className="flex gap-2">
            <input type="text" value={newObs} onChange={e=>setNewObs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder={`Observación en ${time}...`} className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{background:"rgba(255,255,255,0.04)",color:"white",border:"1px solid rgba(255,255,255,0.08)"}}/>
            <button onClick={add} className="px-4 py-2 rounded-lg text-xs font-medium" style={{background:"#c4a478",color:"#0a0c10"}}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════
function Login({ onLogin, onBack }) {
  const [e,setE]=useState("");const [p,setP]=useState("");
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background:"#0a0c10"}}>
      <div className="absolute inset-0" style={{background:"radial-gradient(circle at 30% 70%, rgba(196,164,120,0.04), transparent 50%), radial-gradient(circle at 70% 30%, rgba(160,140,120,0.03), transparent 50%)"}}/>
      <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(196,164,120,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(196,164,120,0.012) 1px, transparent 1px)",backgroundSize:"60px 60px"}}/>
      <div className="relative w-full max-w-sm mx-4 p-10 rounded-3xl" style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(196,164,120,0.1)",backdropFilter:"blur(20px)"}}>
        <div className="text-center mb-10">
          <div className="text-3xl mb-3" style={{color:"#c4a478"}}>◈</div>
          <h1 className="text-lg font-semibold tracking-wider" style={{color:"white"}}>DESDEDRONE<span style={{color:"#c4a478"}}>.AR</span></h1>
          <p className="text-xs mt-2 tracking-widest" style={{color:"rgba(255,255,255,0.25)"}}>PORTAL DE PROYECTOS</p>
        </div>
        <div className="space-y-3">
          <input type="email" value={e} onChange={ev=>setE(ev.target.value)} placeholder="Email" className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all" style={{background:"rgba(255,255,255,0.03)",color:"white",border:"1px solid rgba(255,255,255,0.06)"}}/>
          <input type="password" value={p} onChange={ev=>setP(ev.target.value)} placeholder="Contraseña" className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all" style={{background:"rgba(255,255,255,0.03)",color:"white",border:"1px solid rgba(255,255,255,0.06)"}}/>
          <button onClick={onLogin} className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wider transition-all" style={{background:"#c4a478",color:"#0a0c10"}}>INGRESAR</button>
        </div>
        <p className="text-xs text-center mt-5" style={{color:"rgba(255,255,255,0.2)"}}>¿No tenés cuenta? <span style={{color:"#c4a478",cursor:"pointer"}}>Solicitar acceso</span></p>
      </div>
      <button onClick={onBack} className="fixed top-5 left-5 text-xs px-3 py-1.5 rounded-lg" style={{color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)"}}>← Volver</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CASOS DE USO PAGE
// ═══════════════════════════════════════════════════════════════════════
function CasosDeUsoPage({ onBack, onContacto }) {
  const [activeCaso, setActiveCaso] = useState(null);

  const casos = [
    {
      id: "obra-civil",
      sector: "Constructoras · Desarrolladoras",
      tag: "Seguimiento de Obra",
      title: "Torres residenciales en ejecución",
      problem: "Los inversores en pozo necesitan ver el avance real sin desplazarse a obra. Los jefes de obra necesitan registro fechado de cada etapa para control de subcontratistas.",
      solution: "Vuelos quincenales con fotogrametría y video 4K. Ortomosaico georeferenciado + comparativa temporal entre etapas. Material listo para sala de ventas.",
      deliverables: ["Ortomosaico GeoTIFF por etapa", "Video 4K editado con timestamps", "Comparativa multi-vuelo superpuesta", "Reporte de avance PDF para inversores"],
      metrics: [["Vuelos realizados", "18"], ["Etapas documentadas", "6"], ["Superficie relevada", "4.200 m²"], ["Precisión GSD", "±2 cm"]],
      highlight: "Obra Civil Barrio Los Álamos — Etapa 2",
      color: "#c4a478",
      icon: <Ic.Building />,
    },
    {
      id: "inspeccion-termica",
      sector: "Energía Renovable · Infraestructura",
      tag: "Inspección Termográfica",
      title: "Parques solares y eólicos",
      problem: "Las celdas fotovoltaicas con fallas (hot spots, bypass shunt) no son visibles a simple vista. Detectarlas manualmente requiere días de trabajo en campo.",
      solution: "Vuelo combinado RGB + sensor térmico FLIR radiométrico. Mapa de temperatura de cada panel, identificación automática de anomalías y coordenadas GPS exactas.",
      deliverables: ["Ortomosaico térmico radiométrico", "Mapa de anomalías con coordenadas GPS", "Informe técnico de fallas clasificadas", "Archivo KMZ para geolocalización"],
      metrics: [["Paneles inspeccionados", "3.200"], ["Anomalías detectadas", "47"], ["Superficie cubierta", "8 ha"], ["Tiempo de vuelo", "2 hs"]],
      highlight: "Inspección Paneles Solares — Parque Eólico Sur",
      color: "#d4a053",
      icon: <Ic.Signal />,
    },
    {
      id: "movimiento-suelos",
      sector: "Ingeniería Civil · Vialidad",
      tag: "Fotogrametría · Volúmenes",
      title: "Excavación y movimiento de suelos",
      problem: "Cuantificar volúmenes excavados requiere topógrafos manuales, es lento y costoso. Sin datos precisos, los presupuestos de relleno y retiro de material tienen grandes márgenes de error.",
      solution: "Vuelos de fotogrametría con GCPs (puntos de control GPS). Nube de puntos densa + MDS para cálculo exacto de volúmenes entre vuelos. Comparativa antes/después.",
      deliverables: ["Nube de puntos LAS 1.4 clasificada", "MDS y MDT en GeoTIFF", "Cálculo de volúmenes por polígono", "Curvas de nivel con equidistancia 0.5 m"],
      metrics: [["Área relevada", "243 ha"], ["Puntos en nube", "48 M pts"], ["Volumen calculado", "12.400 m³"], ["Precisión absoluta", "±3 cm"]],
      highlight: "Relevamiento Campo Lote 14 — Pergamino",
      color: "#8fb4c4",
      icon: <Ic.Layers />,
    },
    {
      id: "real-estate",
      sector: "Real Estate · Marketing",
      tag: "Video FPV · Aéreo",
      title: "Diferenciación en pozo y preventa",
      problem: "Mostrar el potencial de un proyecto en construcción es difícil con renders estáticos. Los compradores necesitan sentir el producto antes de que exista.",
      solution: "Video FPV inmersivo + aéreo 4K con estabilización de 3 ejes. Edición profesional con color grading, música y narración. Material listo para redes y sala de ventas.",
      deliverables: ["Video FPV + aéreo editado 4K", "Corte de 60\" para redes sociales", "Fotos aéreas alta resolución", "Material con marca de agua para pre-lanzamiento"],
      metrics: [["Duración producción", "2-3 días"], ["Formatos entregados", "4"], ["Resolución", "4K / 60fps"], ["Color grading", "D-Log / LUT custom"]],
      highlight: "Producción aérea para desarrolladoras CABA",
      color: "#b89878",
      icon: <Ic.Camera />,
    },
    {
      id: "infraestructura",
      sector: "Municipios · Gobierno · Vialidad",
      tag: "Monitoreo de Infraestructura",
      title: "Puentes, rutas y obra pública",
      problem: "Inspeccionar puentes, viaductos y pavimentos manualmente es peligroso y lleva semanas. Las grietas, deterioros y patologías en zonas de difícil acceso quedan sin registrar.",
      solution: "Vuelos de inspección con cámara 4K + zoom óptico 28x. Geolocalización de cada patología detectada. Informe técnico con evidencia fotográfica y mapa de hallazgos.",
      deliverables: ["Registro fotográfico georeferenciado", "Mapa de patologías con severidad", "Informe técnico con evidencia visual", "Seguimiento temporal de deterioro"],
      metrics: [["Km inspeccionados", "38 km"], ["Puntos registrados", "124"], ["Tiempo vs. método manual", "–80%"], ["Costo operativo", "–65%"]],
      highlight: "Inspección de infraestructura vial — GBA",
      color: "#a0b890",
      icon: <Ic.Scan />,
    },
  ];

  const featuredCaso = casos[0];
  const catColor = { "Constructoras · Desarrolladoras": "#c4a478", "Energía Renovable · Infraestructura": "#d4a053", "Ingeniería Civil · Vialidad": "#8fb4c4", "Real Estate · Marketing": "#b89878", "Municipios · Gobierno · Vialidad": "#a0b890" };

  return (
    <div className="min-h-screen" style={{ background: "#0a0c10" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`.dd-body{font-family:'DM Sans',sans-serif}.dd-mono{font-family:'IBM Plex Mono',monospace}`}</style>

      <div className="dd-body">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl" style={{ color: "#c4a478" }}>◈</span>
            <span className="text-sm font-semibold tracking-wider" style={{ color: "white" }}>DESDEDRONE<span style={{ color: "#c4a478" }}>.AR</span></span>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => e.target.style.color = "#c4a478"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}>
            ← Volver al inicio
          </button>
        </nav>

        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20">

          {/* Header */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12" style={{ background: "rgba(196,164,120,0.3)" }} />
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.5)" }}>CASOS DE USO</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-light mb-3" style={{ color: "white" }}>
              Soluciones para cada <span className="font-semibold" style={{ color: "#c4a478" }}>industria</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.35)" }}>
              Proyectos reales de fotogrametría, inspección y producción aérea en Argentina. Datos concretos de cada aplicación para que puedas evaluar el retorno en tu caso específico.
            </p>
          </div>

          {/* Featured — Constructoras */}
          <div className="mb-8 p-8 lg:p-10 rounded-3xl relative overflow-hidden" style={{ background: "rgba(196,164,120,0.03)", border: "1px solid rgba(196,164,120,0.1)" }}>
            <div className="absolute top-0 right-0 w-96 h-96 opacity-5" style={{ background: "radial-gradient(circle, #c4a478, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(196,164,120,0.08)", border: "1px solid rgba(196,164,120,0.15)", color: "#c4a478" }}><Ic.Building /></div>
                <div>
                  <span className="dd-mono text-xs tracking-widest block" style={{ color: "rgba(196,164,120,0.6)" }}>CASO DESTACADO</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{featuredCaso.sector}</span>
                </div>
                <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(196,164,120,0.06)", border: "1px solid rgba(196,164,120,0.1)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c4a478" }} />
                  <span className="dd-mono text-xs" style={{ color: "#c4a478" }}>En producción</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-10">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-semibold mb-4" style={{ color: "white" }}>{featuredCaso.title}</h2>
                  <div className="mb-6">
                    <div className="dd-mono text-xs tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>PROBLEMA</div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{featuredCaso.problem}</p>
                  </div>
                  <div className="mb-6">
                    <div className="dd-mono text-xs tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>SOLUCIÓN</div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{featuredCaso.solution}</p>
                  </div>
                  <div>
                    <div className="dd-mono text-xs tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>ENTREGABLES</div>
                    <div className="space-y-2">
                      {featuredCaso.deliverables.map((d, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#c4a478" }} />
                          <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    {featuredCaso.metrics.map(([label, value], i) => (
                      <div key={i} className="p-4 rounded-2xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="text-xl font-semibold dd-mono mb-1" style={{ color: "#c4a478" }}>{value}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(196,164,120,0.03)", border: "1px solid rgba(196,164,120,0.08)" }}>
                    <Ic.Map />
                    <div>
                      <div className="text-xs font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Proyecto de referencia</div>
                      <div className="text-xs dd-mono" style={{ color: "rgba(196,164,120,0.6)" }}>{featuredCaso.highlight}</div>
                    </div>
                  </div>

                  <button onClick={onContacto} className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2" style={{ background: "#c4a478", color: "#0a0c10" }}>
                    Solicitar propuesta para mi obra <Ic.Arrow />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de casos */}
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            {casos.slice(1).map((caso, i) => (
              <div key={caso.id}
                className="p-7 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: activeCaso === caso.id ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.01)",
                  border: `1px solid ${activeCaso === caso.id ? `${caso.color}20` : "rgba(255,255,255,0.04)"}`,
                }}
                onMouseEnter={() => setActiveCaso(caso.id)}
                onMouseLeave={() => setActiveCaso(null)}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${caso.color}0c`, border: `1px solid ${caso.color}18`, color: caso.color }}>{caso.icon}</div>
                  <div>
                    <span className="dd-mono text-xs block mb-0.5" style={{ color: caso.color }}>{caso.tag}</span>
                    <h3 className="text-base font-semibold" style={{ color: "white" }}>{caso.title}</h3>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{caso.sector}</span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>{caso.problem}</p>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  {caso.metrics.slice(0, 4).map(([label, value], j) => (
                    <div key={j} className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div className="text-sm font-semibold dd-mono" style={{ color: caso.color }}>{value}</div>
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {caso.deliverables.slice(0, 3).map((d, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: caso.color }} />
                      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tabla comparativa sectores */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-8" style={{ background: "rgba(196,164,120,0.2)" }} />
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.4)" }}>CUADRO COMPARATIVO POR SECTOR</span>
            </div>
            <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {["Sector", "Tipo de vuelo", "Entregable principal", "Frecuencia típica", "Valor clave"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 dd-mono text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Constructoras", "Fotogrametría", "Ortomosaico + Video 4K", "Quincenal / mensual", "Reporte inversores"],
                    ["Energía Renovable", "Termografía RGB", "Mapa de anomalías", "Anual / post-tormenta", "Reducción de pérdidas"],
                    ["Ingeniería Civil", "Fotogrametría GCPs", "Nube de puntos + MDS", "Por etapa de obra", "Cálculo de volúmenes"],
                    ["Real Estate", "Video FPV + aéreo", "Video editado 4K", "Por proyecto", "Material de ventas"],
                    ["Gobierno / Vialidad", "Inspección + zoom", "Mapa de patologías", "Semestral / anual", "Ahorro en inspección"],
                  ].map(([sector, ...rest], i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.025)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.005)" }}>
                      <td className="px-5 py-3.5 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{sector}</td>
                      {rest.map((cell, j) => (
                        <td key={j} className="px-5 py-3.5 dd-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="p-10 rounded-3xl text-center" style={{ background: "rgba(196,164,120,0.02)", border: "1px solid rgba(196,164,120,0.07)" }}>
            <span className="dd-mono text-xs tracking-widest block mb-4" style={{ color: "rgba(196,164,120,0.4)" }}>SIGUIENTE PASO</span>
            <h2 className="text-2xl lg:text-3xl font-light mb-3" style={{ color: "white" }}>
              ¿Tu proyecto encaja en alguno de estos <span className="font-semibold" style={{ color: "#c4a478" }}>casos</span>?
            </h2>
            <p className="text-sm leading-relaxed max-w-lg mx-auto mb-8" style={{ color: "rgba(255,255,255,0.3)" }}>
              Contanos qué obra o proyecto tenés en mente. En menos de 24 hs te enviamos una propuesta con frecuencia de vuelo, entregables y precio por etapa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={onContacto} className="px-8 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2 transition-all" style={{ background: "#c4a478", color: "#0a0c10" }}>
                Solicitar presupuesto <Ic.Arrow />
              </button>
              <button onClick={onBack} className="px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(196,164,120,0.15)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                Ver plataforma demo
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t py-8 px-6 lg:px-12" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><span style={{ color: "#c4a478" }}>◈</span><span className="text-xs font-medium tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>DESDEDRONE.AR</span></div>
            <p className="dd-mono text-xs" style={{ color: "rgba(255,255,255,0.12)" }}>© 2026 — Servicios aéreos con drones de precisión — Argentina</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PRESUPUESTO PAGE — Módulo comercial para Constructoras
// ═══════════════════════════════════════════════════════════════════════
function PresupuestoPage({ onBack, onContacto }) {
  const [superficie, setSuperficie] = useState(5000);
  const [frecuencia, setFrecuencia] = useState("quincenal");
  const [meses, setMeses] = useState(6);
  const [extras, setExtras] = useState({ video: true, informe: true, comparativa: true, gcps: false, marketing: false });
  const [paqueteActivo, setPaqueteActivo] = useState("estandar");

  const fmt = n => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);

  // Cálculo de precios (ARS, valores estimados Marzo 2026)
  const baseVuelo = 85000;
  const precioM2 = superficie <= 3000 ? 28 : superficie <= 10000 ? 22 : 16;
  const vueloUnit = Math.round(baseVuelo + superficie * precioM2);
  const vuelosPorMes = frecuencia === "mensual" ? 1 : frecuencia === "quincenal" ? 2 : 4;
  const costoVuelos = vueloUnit * vuelosPorMes;
  const extraCosto = (extras.video ? 120000 : 0) + (extras.informe ? 40000 : 0) + (extras.comparativa ? 60000 : 0) + (extras.gcps ? 80000 : 0) + (extras.marketing ? 100000 : 0);
  const costoMensual = costoVuelos + extraCosto;
  const descuentoMeses = meses >= 12 ? 0.15 : meses >= 6 ? 0.08 : 0;
  const totalMensual = Math.round(costoMensual * (1 - descuentoMeses));
  const totalProyecto = totalMensual * meses;

  const paquetes = [
    {
      id: "basico", nombre: "Seguimiento Básico", sub: "Obra hasta 3.000 m²",
      frec: "Vuelo mensual", vuelos: 1, precio: 240000,
      color: "#8fb4c4",
      incluye: [
        "1 vuelo mensual de fotogrametría",
        "Ortomosaico GeoTIFF de obra",
        "Video aéreo 4K editado (60 seg)",
        "Reporte PDF de avance para inversores",
        "Galería web con acceso compartido",
        "Archivo en la nube por 12 meses",
      ],
      excluye: ["Informe técnico detallado", "Comparativa multi-vuelo", "Puntos de control GPS (GCPs)"],
      ideal: "Desarrolladores con 1-2 obras pequeñas. Ideal para salas de venta y reportes a inversores.",
    },
    {
      id: "estandar", nombre: "Seguimiento Estándar", sub: "Obra hasta 10.000 m²", destacado: true,
      frec: "Vuelo quincenal", vuelos: 2, precio: 450000,
      color: "#c4a478",
      incluye: [
        "2 vuelos mensuales de fotogrametría",
        "Ortomosaico GeoTIFF + MDS por etapa",
        "Video aéreo 4K editado (90-120 seg)",
        "Comparativa temporal superpuesta",
        "Informe técnico de avance",
        "Nube de puntos LAS descargable",
        "Portal cliente con visor geoespacial",
        "Observaciones timestamped sobre video",
      ],
      excluye: ["GCPs topográficos de precisión"],
      ideal: "Obras en ejecución con cronograma activo. Balance óptimo entre costo y calidad de documentación.",
    },
    {
      id: "premium", nombre: "Seguimiento Premium", sub: "Obra > 10.000 m² o múltiples frentes",
      frec: "Vuelo semanal + extras", vuelos: 4, precio: 890000,
      color: "#d4a053",
      incluye: [
        "4 vuelos mensuales de fotogrametría",
        "Ortomosaico + MDS + MDT por vuelo",
        "Video 4K + versión redes sociales",
        "Comparativa multi-vuelo todas las etapas",
        "Cálculo de volúmenes y movimientos",
        "Puntos de control GPS (GCPs) calibrados",
        "Informe técnico mensual con evidencia",
        "Reunión mensual de revisión on-site",
        "Archivo histórico ilimitado",
        "Respuesta 24hs para re-vuelos",
      ],
      excluye: [],
      ideal: "Obras grandes o complejos con varios frentes. Para constructoras que priorizan control total y trazabilidad.",
    },
  ];

  const entregables = [
    {
      id: "ortomosaico", nombre: "Ortomosaico GeoTIFF", tag: "Cartografía georeferenciada",
      desc: "Imagen aérea corregida geométricamente. Permite mediciones reales de distancias, áreas y perímetros con precisión centimétrica.",
      specs: [["Resolución", "1-3 cm/pixel"], ["Formato", "GeoTIFF + KMZ"], ["Sistema", "WGS84 / POSGAR 2007"], ["Tamaño típico", "200-800 MB"]],
      uso: "Control de avance, replanteo, documentación fechada de obra",
      icon: <Ic.Map />, color: "#c4a478",
    },
    {
      id: "video", nombre: "Video Aéreo 4K editado", tag: "Producción audiovisual",
      desc: "Material editado con color grading profesional. Múltiples formatos: master 4K, cortes para redes, versión con marca de agua para pre-lanzamiento.",
      specs: [["Resolución", "4K @ 30/60fps"], ["Duración", "60-180 seg"], ["Formatos", "MP4, MOV, H.265"], ["Entrega", "Master + redes"]],
      uso: "Sala de ventas, redes sociales, reportes a inversores",
      icon: <Ic.Video />, color: "#8fb4c4",
    },
    {
      id: "mds", nombre: "Modelo Digital de Superficie", tag: "MDS · MDT · Curvas",
      desc: "Representación 3D del terreno y las estructuras. Permite generar perfiles, curvas de nivel y calcular volúmenes excavados o rellenados.",
      specs: [["Resolución", "5-10 cm"], ["Formato", "GeoTIFF · LAS 1.4"], ["Equidistancia", "0.25 / 0.5 / 1 m"], ["Precisión", "±3 cm con GCPs"]],
      uso: "Movimiento de suelos, topografía, certificaciones",
      icon: <Ic.Layers />, color: "#b89878",
    },
    {
      id: "comparativa", nombre: "Comparativa Temporal", tag: "Análisis multi-vuelo",
      desc: "Superposición de vuelos entre etapas. Visualización lado a lado o blend animado para identificar avances, atrasos y desvíos del cronograma.",
      specs: [["Mínimo 2 vuelos", "Georeferenciados"], ["Output", "Video + web interactivo"], ["Periodicidad", "Por etapa"], ["Exportación", "PDF + MP4"]],
      uso: "Control de cronograma, reuniones de obra, arbitrajes",
      icon: <Ic.Grid />, color: "#a0b890",
    },
    {
      id: "informe", nombre: "Informe técnico PDF", tag: "Documentación profesional",
      desc: "Reporte estructurado con evidencia fotográfica, mediciones, cuantificaciones y observaciones técnicas. Listo para presentar a dirección de obra.",
      specs: [["Formato", "PDF A4 · 15-30 pág"], ["Incluye", "Planos · Cotas · Fotos"], ["Frecuencia", "Por vuelo / mensual"], ["Firma", "Responsable técnico"]],
      uso: "Auditorías, certificaciones, reportes a dirección",
      icon: <Ic.File />, color: "#d4a053",
    },
    {
      id: "portal", nombre: "Portal Cliente Web", tag: "Acceso multiusuario",
      desc: "Plataforma privada con visor geoespacial, reproductor de video con observaciones y descarga de entregables. Login por usuario.",
      specs: [["Usuarios", "Ilimitados"], ["Retención", "24 meses"], ["Visor", "Leaflet + MapLibre"], ["Export", "GeoJSON · PDF · PNG"]],
      uso: "Consulta permanente, trabajo colaborativo con BIM/CAD",
      icon: <Ic.Signal />, color: "#c4a478",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0c10" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`.dd-body{font-family:'DM Sans',sans-serif}.dd-mono{font-family:'IBM Plex Mono',monospace}`}</style>

      <div className="dd-body">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl" style={{ color: "#c4a478" }}>◈</span>
            <span className="text-sm font-semibold tracking-wider" style={{ color: "white" }}>DESDEDRONE<span style={{ color: "#c4a478" }}>.AR</span></span>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => e.target.style.color = "#c4a478"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}>
            ← Volver al inicio
          </button>
        </nav>

        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20">

          {/* Header */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12" style={{ background: "rgba(196,164,120,0.3)" }} />
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.5)" }}>PRESUPUESTO · CONSTRUCTORAS</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-light mb-3" style={{ color: "white" }}>
              Propuesta comercial para <span className="font-semibold" style={{ color: "#c4a478" }}>obra en ejecución</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.35)" }}>
              Paquetes mensuales de seguimiento aéreo con frecuencia fija, entregables definidos y precio cerrado. Valores de referencia en pesos argentinos, ajustables por IPC trimestral.
            </p>
          </div>

          {/* ═══ PAQUETES ═══ */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.5)" }}>PAQUETES MENSUALES</span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {paquetes.map(p => (
                <div key={p.id} onClick={() => setPaqueteActivo(p.id)} className="relative p-7 rounded-2xl cursor-pointer transition-all" style={{
                  background: paqueteActivo === p.id ? `${p.color}06` : "rgba(255,255,255,0.01)",
                  border: `1px solid ${paqueteActivo === p.id ? p.color + "30" : "rgba(255,255,255,0.04)"}`,
                  transform: p.destacado ? "scale(1.02)" : "none",
                }}>
                  {p.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full dd-mono text-xs tracking-widest" style={{ background: "#c4a478", color: "#0a0c10" }}>
                      MÁS ELEGIDO
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: `${p.color}0a`, border: `1px solid ${p.color}20`, color: p.color }}>
                    <Ic.Package />
                  </div>
                  <span className="dd-mono text-xs tracking-widest block mb-2" style={{ color: p.color }}>{p.frec.toUpperCase()}</span>
                  <h3 className="text-xl font-semibold mb-1" style={{ color: "white" }}>{p.nombre}</h3>
                  <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>{p.sub}</p>

                  <div className="mb-6 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-baseline gap-2">
                      <span className="dd-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>$</span>
                      <span className="text-3xl font-light" style={{ color: "white" }}>{fmt(p.precio)}</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>/mes</span>
                    </div>
                    <span className="dd-mono text-xs mt-1 block" style={{ color: "rgba(255,255,255,0.2)" }}>ARS · sin IVA</span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {p.incluye.map((it, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                        <span style={{ color: p.color, marginTop: "2px" }}><Ic.Check /></span>
                        <span>{it}</span>
                      </li>
                    ))}
                    {p.excluye.map((it, i) => (
                      <li key={`x${i}`} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.18)", textDecoration: "line-through" }}>
                        <span style={{ marginTop: "2px" }}>·</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
                    <span className="dd-mono text-xs tracking-widest block mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>IDEAL PARA</span>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{p.ideal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ CALCULADORA ═══ */}
          <div className="mb-24 p-8 lg:p-10 rounded-3xl" style={{ background: "rgba(196,164,120,0.02)", border: "1px solid rgba(196,164,120,0.08)" }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(196,164,120,0.08)", border: "1px solid rgba(196,164,120,0.15)", color: "#c4a478" }}>
                <Ic.Calculator />
              </div>
              <div>
                <span className="dd-mono text-xs tracking-widest block" style={{ color: "rgba(196,164,120,0.6)" }}>CALCULADORA INTERACTIVA</span>
                <h2 className="text-xl font-semibold" style={{ color: "white" }}>Estimador de presupuesto a medida</h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Controles */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="dd-mono text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>SUPERFICIE DE OBRA</label>
                    <span className="dd-mono text-sm font-semibold" style={{ color: "#c4a478" }}>{fmt(superficie)} m²</span>
                  </div>
                  <input type="range" min="500" max="50000" step="500" value={superficie} onChange={e => setSuperficie(+e.target.value)}
                    className="w-full" style={{ accentColor: "#c4a478" }} />
                  <div className="flex justify-between mt-2 dd-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <span>500 m²</span><span>50.000 m²</span>
                  </div>
                </div>

                <div>
                  <label className="dd-mono text-xs tracking-widest block mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>FRECUENCIA DE VUELO</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "mensual", label: "Mensual", desc: "1×/mes" },
                      { id: "quincenal", label: "Quincenal", desc: "2×/mes" },
                      { id: "semanal", label: "Semanal", desc: "4×/mes" },
                    ].map(f => (
                      <button key={f.id} onClick={() => setFrecuencia(f.id)} className="p-3 rounded-xl transition-all text-left" style={{
                        background: frecuencia === f.id ? "rgba(196,164,120,0.08)" : "rgba(255,255,255,0.01)",
                        border: `1px solid ${frecuencia === f.id ? "rgba(196,164,120,0.3)" : "rgba(255,255,255,0.04)"}`,
                      }}>
                        <span className="text-sm font-semibold block" style={{ color: frecuencia === f.id ? "#c4a478" : "white" }}>{f.label}</span>
                        <span className="dd-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="dd-mono text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>DURACIÓN DEL CONTRATO</label>
                    <span className="dd-mono text-sm font-semibold" style={{ color: "#c4a478" }}>{meses} {meses === 1 ? "mes" : "meses"}</span>
                  </div>
                  <input type="range" min="1" max="24" step="1" value={meses} onChange={e => setMeses(+e.target.value)}
                    className="w-full" style={{ accentColor: "#c4a478" }} />
                  <div className="flex justify-between mt-2 dd-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <span>1 mes</span><span>24 meses</span>
                  </div>
                  {descuentoMeses > 0 && (
                    <p className="text-xs mt-2" style={{ color: "#a0b890" }}>
                      ✓ Descuento por duración aplicado: –{(descuentoMeses * 100).toFixed(0)}%
                    </p>
                  )}
                </div>

                <div>
                  <label className="dd-mono text-xs tracking-widest block mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>EXTRAS</label>
                  <div className="space-y-2">
                    {[
                      { k: "video", label: "Video 4K editado", precio: 120000 },
                      { k: "informe", label: "Informe técnico PDF", precio: 40000 },
                      { k: "comparativa", label: "Comparativa temporal multi-vuelo", precio: 60000 },
                      { k: "gcps", label: "Puntos de control GPS (GCPs)", precio: 80000 },
                      { k: "marketing", label: "Material marketing (redes + sala venta)", precio: 100000 },
                    ].map(e => (
                      <label key={e.k} className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all" style={{
                        background: extras[e.k] ? "rgba(196,164,120,0.04)" : "rgba(255,255,255,0.01)",
                        border: `1px solid ${extras[e.k] ? "rgba(196,164,120,0.2)" : "rgba(255,255,255,0.04)"}`,
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded flex items-center justify-center" style={{
                            background: extras[e.k] ? "#c4a478" : "transparent",
                            border: `1px solid ${extras[e.k] ? "#c4a478" : "rgba(255,255,255,0.2)"}`,
                            color: "#0a0c10",
                          }}>
                            {extras[e.k] && <Ic.Check />}
                          </div>
                          <span className="text-sm" style={{ color: extras[e.k] ? "white" : "rgba(255,255,255,0.5)" }}>{e.label}</span>
                        </div>
                        <span className="dd-mono text-xs" style={{ color: extras[e.k] ? "#c4a478" : "rgba(255,255,255,0.3)" }}>+${fmt(e.precio)}</span>
                        <input type="checkbox" className="hidden" checked={extras[e.k]} onChange={() => setExtras(p => ({ ...p, [e.k]: !p[e.k] }))} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="lg:sticky lg:top-8 self-start">
                <div className="p-7 rounded-2xl" style={{ background: "rgba(10,12,16,0.6)", border: "1px solid rgba(196,164,120,0.15)" }}>
                  <span className="dd-mono text-xs tracking-widest block mb-6" style={{ color: "rgba(196,164,120,0.6)" }}>RESUMEN DEL PRESUPUESTO</span>

                  <div className="space-y-3 pb-6 mb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <Row label={`Vuelo de fotogrametría (${fmt(superficie)} m²)`} value={`$${fmt(vueloUnit)}`} />
                    <Row label={`× ${vuelosPorMes} ${vuelosPorMes === 1 ? "vuelo/mes" : "vuelos/mes"}`} value={`$${fmt(costoVuelos)}`} />
                    {extraCosto > 0 && <Row label="Extras seleccionados" value={`+$${fmt(extraCosto)}`} />}
                    {descuentoMeses > 0 && <Row label={`Descuento contrato ${meses} meses`} value={`–${(descuentoMeses * 100).toFixed(0)}%`} accent />}
                  </div>

                  <div className="mb-5">
                    <span className="dd-mono text-xs tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>MENSUAL (ARS)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="dd-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>$</span>
                      <span className="text-3xl font-light" style={{ color: "#c4a478" }}>{fmt(totalMensual)}</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>/mes</span>
                    </div>
                  </div>

                  <div className="pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <span className="dd-mono text-xs tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>TOTAL PROYECTO ({meses} {meses === 1 ? "MES" : "MESES"})</span>
                    <div className="flex items-baseline gap-2">
                      <span className="dd-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>$</span>
                      <span className="text-4xl font-light" style={{ color: "white" }}>{fmt(totalProyecto)}</span>
                    </div>
                    <span className="dd-mono text-xs mt-1 block" style={{ color: "rgba(255,255,255,0.25)" }}>Valores sin IVA · Ajustables por IPC trimestral</span>
                  </div>

                  <button onClick={onContacto} className="w-full mt-7 px-6 py-3.5 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all" style={{ background: "#c4a478", color: "#0a0c10" }}>
                    Solicitar propuesta formal <Ic.Arrow />
                  </button>
                  <p className="text-xs text-center mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>Respuesta en menos de 24 hs hábiles</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ EJEMPLOS DE ENTREGABLES ═══ */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.5)" }}>EJEMPLOS DE ENTREGABLES</span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>

            <h2 className="text-2xl lg:text-3xl font-light mb-3" style={{ color: "white" }}>
              Qué recibe la <span className="font-semibold" style={{ color: "#c4a478" }}>constructora</span>
            </h2>
            <p className="text-sm leading-relaxed mb-10 max-w-2xl" style={{ color: "rgba(255,255,255,0.35)" }}>
              Cada vuelo produce un set de entregables digitales, compatibles con herramientas BIM/CAD y listos para presentar a dirección de obra, inversores o auditores.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              {entregables.map(e => (
                <div key={e.id} className="p-7 rounded-2xl transition-all" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={ev => ev.currentTarget.style.borderColor = `${e.color}20`}
                  onMouseLeave={ev => ev.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${e.color}0a`, border: `1px solid ${e.color}20`, color: e.color }}>
                      {e.icon}
                    </div>
                    <span className="dd-mono text-xs tracking-widest" style={{ color: `${e.color}99` }}>{e.tag.toUpperCase()}</span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2" style={{ color: "white" }}>{e.nombre}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>{e.desc}</p>

                  <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    {e.specs.map((s, i) => (
                      <div key={i}>
                        <span className="dd-mono text-xs tracking-widest block mb-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{s[0].toUpperCase()}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{s[1]}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <span className="dd-mono text-xs tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>CASOS DE USO</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{e.uso}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ CONDICIONES ═══ */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.5)" }}>CONDICIONES COMERCIALES</span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { t: "Forma de pago", d: "50% al inicio del contrato, saldo mensual contra entrega. Factura A emitida por monotributo o responsable inscripto según corresponda." },
                { t: "Plazos de entrega", d: "Material editado y publicado en portal cliente en un plazo máximo de 72 hs hábiles desde cada vuelo. Entregables crudos disponibles a las 24 hs." },
                { t: "Re-vuelos y climatología", d: "Incluidos sin costo ante condiciones no aptas (viento > 10 m/s, lluvia, cobertura nubosa total). Se coordinan en ventana de ±48 hs." },
                { t: "Confidencialidad", d: "Acuerdo NDA estándar firmado al inicio. Material no se difunde sin autorización escrita. Portal cliente con acceso por usuario y registro de descargas." },
                { t: "Seguros y habilitaciones", d: "Pilotos con licencia ANAC vigente. Seguro de responsabilidad civil por USD 100.000. Permisos de vuelo gestionados por DesdeDrone." },
                { t: "Propiedad intelectual", d: "Material crudo y entregables son propiedad del cliente. DesdeDrone retiene derecho de uso de material editado en portafolio con anonimización." },
              ].map((c, i) => (
                <div key={i} className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: "#c4a478" }}>{c.t}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{c.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-10 rounded-3xl text-center" style={{ background: "rgba(196,164,120,0.02)", border: "1px solid rgba(196,164,120,0.07)" }}>
            <span className="dd-mono text-xs tracking-widest block mb-4" style={{ color: "rgba(196,164,120,0.4)" }}>PROPUESTA FORMAL</span>
            <h2 className="text-2xl lg:text-3xl font-light mb-3" style={{ color: "white" }}>
              Convertimos tu obra en <span className="font-semibold" style={{ color: "#c4a478" }}>documentación profesional</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-lg mx-auto mb-8" style={{ color: "rgba(255,255,255,0.3)" }}>
              Enviamos propuesta personalizada con cronograma de vuelos, cobertura exacta y precios cerrados en menos de 24 hs. Visita técnica sin cargo a obra en CABA y GBA.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={onContacto} className="px-8 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2 transition-all" style={{ background: "#c4a478", color: "#0a0c10" }}>
                Solicitar visita técnica <Ic.Arrow />
              </button>
              <button onClick={onBack} className="px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(196,164,120,0.15)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                Ver casos de uso
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t py-8 px-6 lg:px-12" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><span style={{ color: "#c4a478" }}>◈</span><span className="text-xs font-medium tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>DESDEDRONE.AR</span></div>
            <p className="dd-mono text-xs" style={{ color: "rgba(255,255,255,0.12)" }}>© 2026 — Servicios aéreos con drones de precisión — Argentina</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span className="dd-mono text-xs" style={{ color: accent ? "#a0b890" : "rgba(255,255,255,0.8)" }}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICIOS PAGE — con apartado de leads
// ═══════════════════════════════════════════════════════════════════════
function ServiciosPage({ onBack, onPresupuesto, dark, onToggleTheme }) {
  const dm = dark;
  // Light-mode palette mirrors tarifario_v2 editorial system.
  const bg = dm ? "#0a0c10" : "#f5f5f2";
  const textPri = dm ? "white" : "#111110";
  const textMed = dm ? "rgba(255,255,255,0.55)" : "#2e2e2b";
  const textFade = dm ? "rgba(255,255,255,0.35)" : "#5a5a55";
  const textDim = dm ? "rgba(255,255,255,0.25)" : "#8a8a82";
  const cardBg = dm ? "rgba(255,255,255,0.01)" : "#ffffff";
  const cardBorder = dm ? "rgba(255,255,255,0.04)" : "#e2e2dc";
  const accent = "#c4a478";
  const ctaBg = dm ? accent : "#111110";
  const ctaText = dm ? "#0a0c10" : "#ffffff";

  const [form, setForm] = useState({ nombre: "", email: "", empresa: "", telefono: "", servicio: "", obra: "", mensaje: "" });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const servicios = [
    { icon: <Ic.Map />, tag: "Fotogrametría", title: "Ortomosaicos georeferenciados", desc: "Mapas aéreos corregidos con precisión centimétrica. GeoTIFF listo para AutoCAD, QGIS, ArcGIS.", specs: ["GSD 1-3 cm", "WGS84 / POSGAR", "GeoTIFF + KMZ"], color: "#c4a478" },
    { icon: <Ic.Layers />, tag: "Topografía 3D", title: "Modelos digitales MDS · MDT", desc: "Nubes de puntos LAS, modelos de elevación y curvas de nivel. Cálculo de volúmenes por polígono.", specs: ["LAS 1.4", "Curvas 0.25-1 m", "Volumetría"], color: "#8fb4c4" },
    { icon: <Ic.Video />, tag: "Video Aéreo 4K", title: "Producción audiovisual profesional", desc: "Video editado con color grading, música, tipografía y versiones para redes sociales.", specs: ["4K @ 60fps", "D-Log / LUT", "Master + redes"], color: "#b89878" },
    { icon: <Ic.Drone />, tag: "FPV Inmersivo", title: "Vuelos FPV para Real Estate", desc: "Recorridos cinematográficos de alto impacto. Diferencial para pre-ventas y obras en pozo.", specs: ["Velocidad hasta 150 km/h", "Master 4K", "Custom soundtrack"], color: "#d4a053" },
    { icon: <Ic.Signal />, tag: "Inspección Termográfica", title: "Sensor FLIR radiométrico", desc: "Detección de fallas en paneles solares, puntos calientes en infraestructura y pérdidas energéticas.", specs: ["FLIR radiométrico", "Informe clasificado", "GPS por anomalía"], color: "#a0b890" },
    { icon: <Ic.Building />, tag: "Seguimiento de Obra", title: "Monitoreo periódico para constructoras", desc: "Vuelos mensuales, quincenales o semanales con comparativa temporal. Portal cliente incluido.", specs: ["Portal cliente web", "Comparativa multi-vuelo", "Reporte PDF"], color: "#c4a478" },
  ];

  const industrias = [
    { n: "Constructoras · Desarrolladoras", desc: "Seguimiento fechado de obra, documentación para inversores y salas de venta." },
    { n: "Ingeniería Civil · Vialidad", desc: "Movimiento de suelos, volumetrías, perfiles y certificaciones topográficas." },
    { n: "Energía Renovable", desc: "Inspección térmica de parques solares y eólicos. Detección de fallas y hot spots." },
    { n: "Real Estate · Marketing", desc: "Producción aérea, FPV inmersivo y material multiformato para campañas." },
    { n: "Municipios · Gobierno", desc: "Catastro aéreo, monitoreo vial, inspección de puentes e infraestructura pública." },
    { n: "Agro · Forestal", desc: "Relevamientos multiespectrales, análisis de vigor vegetativo y planificación sanitaria." },
  ];

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.servicio) e.servicio = "Elegí un servicio";
    if (!form.mensaje.trim() || form.mensaje.trim().length < 10) e.mensaje = "Contanos un poco más (mín. 10 caracteres)";
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      try {
        const leads = JSON.parse(localStorage.getItem("dd_leads") || "[]");
        leads.push({ ...form, ts: new Date().toISOString() });
        localStorage.setItem("dd_leads", JSON.stringify(leads));
      } catch {}
      setSent(true);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    background: dm ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)",
    border: `1px solid ${hasError ? "rgba(212,80,80,0.4)" : dm ? "rgba(255,255,255,0.06)" : "rgba(196,164,120,0.15)"}`,
    color: textPri,
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border 0.2s",
  });

  return (
    <div className="min-h-screen" style={{ background: bg, transition: "background 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`.dd-body{font-family:'DM Sans',sans-serif}.dd-mono{font-family:'IBM Plex Mono',monospace}
        .dd-input:focus { border-color: ${accent} !important; }
        .dd-input::placeholder { color: ${textDim}; }
      `}</style>

      <div className="dd-body">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b" style={{ borderColor: dm ? "rgba(255,255,255,0.04)" : "rgba(196,164,120,0.12)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl" style={{ color: accent }}>◈</span>
            <span className="text-sm font-semibold tracking-wider" style={{ color: textPri }}>DESDEDRONE<span style={{ color: accent }}>.AR</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: dm ? "rgba(196,164,120,0.08)" : "rgba(196,164,120,0.12)", color: accent, border: `1px solid rgba(196,164,120,0.2)` }}
              title={dm ? "Modo claro" : "Modo oscuro"}>{dm ? <Ic.Sun /> : <Ic.Moon />}</button>
            <button onClick={onBack} className="flex items-center gap-2 text-xs tracking-wider px-3 py-2" style={{ color: textFade }}
              onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = textFade}>
              ← Volver
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20">

          {/* Header */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12" style={{ background: "rgba(196,164,120,0.3)" }} />
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.6)" }}>SERVICIOS</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-light mb-4" style={{ color: textPri }}>
              Aéreo profesional de <span className="font-semibold" style={{ color: accent }}>punta a punta</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: textFade }}>
              Desde el vuelo hasta el entregable final. Relevamientos de precisión centimétrica, producción audiovisual 4K y plataforma propia para visualizar, medir y compartir resultados.
            </p>
          </div>

          {/* Servicios grid */}
          <div className="mb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicios.map((s, i) => (
              <div key={i} className="p-7 rounded-2xl transition-all" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${s.color}30`}
                onMouseLeave={e => e.currentTarget.style.borderColor = cardBorder}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20`, color: s.color }}>{s.icon}</div>
                <span className="dd-mono text-xs tracking-widest block mb-2" style={{ color: s.color }}>{s.tag.toUpperCase()}</span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: textPri }}>{s.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: textMed }}>{s.desc}</p>
                <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: dm ? "rgba(255,255,255,0.04)" : "rgba(196,164,120,0.1)" }}>
                  {s.specs.map((sp, si) => (
                    <span key={si} className="dd-mono text-xs px-2.5 py-1 rounded-md" style={{ background: dm ? "rgba(255,255,255,0.02)" : "rgba(196,164,120,0.06)", color: textFade, border: `1px solid ${dm ? "rgba(255,255,255,0.04)" : "rgba(196,164,120,0.1)"}` }}>{sp}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Industrias */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.6)" }}>INDUSTRIAS</span>
              <div className="h-px flex-1" style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(196,164,120,0.12)" }} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-light mb-10" style={{ color: textPri }}>
              Sectores que <span className="font-semibold" style={{ color: accent }}>atendemos</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industrias.map((it, i) => (
                <div key={i} className="p-5 rounded-xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <h4 className="text-sm font-semibold mb-1.5" style={{ color: textPri }}>{it.n}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: textFade }}>{it.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ APARTADO DE LEADS ═══ */}
          <div className="mb-16 rounded-3xl overflow-hidden" style={{ background: dm ? "rgba(196,164,120,0.03)" : "rgba(255,255,255,0.8)", border: `1px solid ${dm ? "rgba(196,164,120,0.12)" : "rgba(196,164,120,0.2)"}` }}>
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Info lateral */}
              <div className="p-8 lg:p-12" style={{ background: dm ? "rgba(0,0,0,0.2)" : "rgba(196,164,120,0.05)", borderRight: `1px solid ${dm ? "rgba(255,255,255,0.04)" : "rgba(196,164,120,0.12)"}` }}>
                <span className="dd-mono text-xs tracking-widest block mb-4" style={{ color: "rgba(196,164,120,0.6)" }}>CONTACTO DIRECTO</span>
                <h2 className="text-2xl lg:text-3xl font-light mb-4" style={{ color: textPri }}>
                  Contanos sobre tu <span className="font-semibold" style={{ color: accent }}>proyecto</span>
                </h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: textFade }}>
                  Respondemos en menos de 24 hs hábiles con una propuesta inicial. Si es en CABA o GBA, coordinamos visita técnica sin cargo.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: <Ic.Mail />, label: "Email", val: "hola@desdedrone.ar" },
                    { icon: <Ic.Phone />, label: "WhatsApp", val: "+54 9 11 5555-2047" },
                    { icon: <Ic.MapPin />, label: "Base de operaciones", val: "CABA · Buenos Aires · Argentina" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}0a`, border: `1px solid ${accent}20`, color: accent }}>{c.icon}</div>
                      <div>
                        <span className="dd-mono text-xs tracking-widest block" style={{ color: textDim }}>{c.label.toUpperCase()}</span>
                        <span className="text-sm" style={{ color: textMed }}>{c.val}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t" style={{ borderColor: dm ? "rgba(255,255,255,0.04)" : "rgba(196,164,120,0.12)" }}>
                  <span className="dd-mono text-xs tracking-widest block mb-3" style={{ color: textDim }}>¿PREFERÍS VER PRECIOS DIRECTO?</span>
                  <button onClick={onPresupuesto} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold tracking-wider transition-all" style={{ border: `1px solid ${accent}40`, color: accent }}
                    onMouseEnter={e => e.currentTarget.style.background = `${accent}10`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Ver paquetes y calculadora <Ic.Arrow />
                  </button>
                </div>
              </div>

              {/* Formulario */}
              <div className="p-8 lg:p-12">
                {!sent ? (
                  <form onSubmit={submit}>
                    <span className="dd-mono text-xs tracking-widest block mb-6" style={{ color: "rgba(196,164,120,0.6)" }}>FORMULARIO DE CONTACTO</span>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="dd-mono text-xs tracking-widest block mb-2" style={{ color: textFade }}>NOMBRE *</label>
                        <input className="dd-input" type="text" placeholder="Tu nombre" value={form.nombre}
                          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                          style={inputStyle(errors.nombre)} />
                        {errors.nombre && <span className="text-xs mt-1 block" style={{ color: "#d45050" }}>{errors.nombre}</span>}
                      </div>
                      <div>
                        <label className="dd-mono text-xs tracking-widest block mb-2" style={{ color: textFade }}>EMPRESA</label>
                        <input className="dd-input" type="text" placeholder="Constructora, estudio, etc." value={form.empresa}
                          onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                          style={inputStyle(false)} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="dd-mono text-xs tracking-widest block mb-2" style={{ color: textFade }}>EMAIL *</label>
                        <input className="dd-input" type="email" placeholder="tu@email.com" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          style={inputStyle(errors.email)} />
                        {errors.email && <span className="text-xs mt-1 block" style={{ color: "#d45050" }}>{errors.email}</span>}
                      </div>
                      <div>
                        <label className="dd-mono text-xs tracking-widest block mb-2" style={{ color: textFade }}>TELÉFONO</label>
                        <input className="dd-input" type="tel" placeholder="+54 9 11..." value={form.telefono}
                          onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                          style={inputStyle(false)} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="dd-mono text-xs tracking-widest block mb-2" style={{ color: textFade }}>SERVICIO DE INTERÉS *</label>
                      <select className="dd-input" value={form.servicio}
                        onChange={e => setForm(f => ({ ...f, servicio: e.target.value }))}
                        style={inputStyle(errors.servicio)}>
                        <option value="">Elegí un servicio…</option>
                        <option value="seguimiento-obra">Seguimiento de obra (constructoras)</option>
                        <option value="fotogrametria">Fotogrametría · Ortomosaico</option>
                        <option value="topografia-3d">Topografía 3D · MDS · Volumetría</option>
                        <option value="video-4k">Video Aéreo 4K</option>
                        <option value="fpv">FPV Inmersivo · Real Estate</option>
                        <option value="inspeccion">Inspección térmica · Paneles solares</option>
                        <option value="otro">Otro / No estoy seguro</option>
                      </select>
                      {errors.servicio && <span className="text-xs mt-1 block" style={{ color: "#d45050" }}>{errors.servicio}</span>}
                    </div>

                    <div className="mb-4">
                      <label className="dd-mono text-xs tracking-widest block mb-2" style={{ color: textFade }}>UBICACIÓN DE LA OBRA / PROYECTO</label>
                      <input className="dd-input" type="text" placeholder="Ej: Palermo CABA · Pilar · Ruta 8 Km 50" value={form.obra}
                        onChange={e => setForm(f => ({ ...f, obra: e.target.value }))}
                        style={inputStyle(false)} />
                    </div>

                    <div className="mb-6">
                      <label className="dd-mono text-xs tracking-widest block mb-2" style={{ color: textFade }}>CONTANOS DEL PROYECTO *</label>
                      <textarea className="dd-input" rows="4" placeholder="Superficie, frecuencia de vuelo deseada, entregables específicos, fecha estimada de inicio…" value={form.mensaje}
                        onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                        style={{ ...inputStyle(errors.mensaje), resize: "vertical", minHeight: "110px" }} />
                      {errors.mensaje && <span className="text-xs mt-1 block" style={{ color: "#d45050" }}>{errors.mensaje}</span>}
                    </div>

                    <button type="submit" className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all" style={{ background: ctaBg, color: ctaText }}>
                      <Ic.Send /> Enviar consulta
                    </button>
                    <p className="text-xs mt-3 text-center" style={{ color: textDim }}>Datos tratados bajo Ley 25.326 · No compartimos información con terceros</p>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${accent}15`, border: `1px solid ${accent}40`, color: accent }}>
                      <Ic.Check />
                    </div>
                    <span className="dd-mono text-xs tracking-widest block mb-3" style={{ color: "rgba(196,164,120,0.6)" }}>CONSULTA RECIBIDA</span>
                    <h3 className="text-2xl font-light mb-3" style={{ color: textPri }}>Gracias <span style={{ color: accent }}>{form.nombre.split(" ")[0]}</span></h3>
                    <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: textFade }}>
                      Recibimos tu consulta sobre <strong style={{ color: textMed }}>{form.servicio.replace("-", " ")}</strong>. Te respondemos en menos de 24 hs hábiles al email <strong style={{ color: textMed }}>{form.email}</strong>.
                    </p>
                    <button onClick={() => { setSent(false); setForm({ nombre: "", email: "", empresa: "", telefono: "", servicio: "", obra: "", mensaje: "" }); }}
                      className="text-xs tracking-wider" style={{ color: textFade }}>
                      ← Enviar otra consulta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t py-8 px-6 lg:px-12" style={{ borderColor: dm ? "rgba(255,255,255,0.03)" : "rgba(196,164,120,0.1)" }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><span style={{ color: accent }}>◈</span><span className="text-xs font-medium tracking-wider" style={{ color: textDim }}>DESDEDRONE.AR</span></div>
            <p className="dd-mono text-xs" style={{ color: textDim }}>© 2026 — Servicios aéreos con drones de precisión — Argentina</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STACK TECNOLÓGICO PAGE
// ═══════════════════════════════════════════════════════════════════════
function StackPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("current");

  const currentStack = [
    { name: "React 18", role: "Framework de UI", desc: "Biblioteca declarativa para interfaces de usuario. Componentes funcionales con Hooks para manejo de estado y ciclo de vida.", cat: "Frontend", status: "Producción" },
    { name: "Vite 6", role: "Bundler & Dev Server", desc: "Build tool de última generación. Hot Module Replacement instantáneo, ESBuild para transpilación y Rollup para producción.", cat: "Tooling", status: "Producción" },
    { name: "Tailwind CSS 4", role: "Framework de estilos", desc: "Utility-first CSS framework. Diseño responsive, tema custom con paleta dorada (#c4a478) y sistema de dark mode.", cat: "Frontend", status: "Producción" },
    { name: "Vercel", role: "Hosting & Deploy", desc: "Plataforma de deploy con CDN global, SSL automático y preview deployments. CI/CD conectado a GitHub.", cat: "Infraestructura", status: "Producción" },
    { name: "GitHub", role: "Repositorio & Versionado", desc: "Control de versiones con Git. Organización: desdedrone-ar. Branch principal: main.", cat: "Tooling", status: "Producción" },
  ];

  const plannedStack = [
    { name: "Supabase", role: "Backend as a Service", desc: "Autenticación con email/password y OAuth, base de datos PostgreSQL con Row Level Security, y storage para archivos de proyecto.", cat: "Backend", status: "Próxima fase", priority: "Alta" },
    { name: "PostgreSQL + PostGIS", role: "Base de datos geoespacial", desc: "Motor relacional con extensión geoespacial para queries por ubicación, almacenamiento de metadatos de vuelo y gestión de proyectos.", cat: "Backend", status: "Próxima fase", priority: "Alta" },
    { name: "Cloudflare R2", role: "Object Storage", desc: "Almacenamiento de archivos pesados: ortomosaicos (GeoTIFF), nubes de puntos (LAS/LAZ), videos 4K. Sin egress fees.", cat: "Infraestructura", status: "Próxima fase", priority: "Alta" },
    { name: "Leaflet / MapLibre", role: "Visor de mapas real", desc: "Reemplazo del canvas simulado por visor geoespacial real. Soporte para capas GeoTIFF, medición de distancias y áreas, y exportación.", cat: "Frontend", status: "Próxima fase", priority: "Alta" },
    { name: "Video.js", role: "Player de video", desc: "Reproductor con streaming adaptativo (HLS), soporte de subtítulos, thumbnails y API para observaciones con timestamp.", cat: "Frontend", status: "Fase 2", priority: "Media" },
    { name: "FFmpeg (server-side)", role: "Procesamiento de video", desc: "Generación automática de marca de agua en muestras, transcodificación a HLS para streaming, y extracción de thumbnails.", cat: "Backend", status: "Fase 2", priority: "Media" },
    { name: "AFIP API", role: "Facturación electrónica", desc: "Integración con web services de AFIP para emisión de facturas electrónicas tipo A, B y C. CUIT, CAE y validación fiscal.", cat: "Integración", status: "Fase 3", priority: "Baja" },
    { name: "Potree / 3D Tiles", role: "Visor de nube de puntos 3D", desc: "Renderizado WebGL de nubes de puntos densas. Navegación 3D, secciones de corte y clasificación de puntos.", cat: "Frontend", status: "Fase 3", priority: "Baja" },
  ];

  const cats = ["Frontend", "Backend", "Infraestructura", "Tooling", "Integración"];
  const catColors = { Frontend: "#c4a478", Backend: "#8fb4c4", Infraestructura: "#b89878", Tooling: "#a0a0a0", Integración: "#d4a053" };
  const prioColors = { Alta: "#c4a478", Media: "#8fb4c4", Baja: "rgba(255,255,255,0.3)" };

  const data = activeTab === "current" ? currentStack : plannedStack;

  return (
    <div className="min-h-screen" style={{ background: "#0a0c10" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`.dd-body{font-family:'DM Sans',sans-serif}.dd-mono{font-family:'IBM Plex Mono',monospace}`}</style>

      <div className="dd-body">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl" style={{ color: "#c4a478" }}>◈</span>
            <span className="text-sm font-semibold tracking-wider" style={{ color: "white" }}>DESDEDRONE<span style={{ color: "#c4a478" }}>.AR</span></span>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => e.target.style.color = "#c4a478"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}>
            ← Volver al inicio
          </button>
        </nav>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-20">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12" style={{ background: "rgba(196,164,120,0.3)" }} />
              <span className="dd-mono text-xs tracking-widest" style={{ color: "rgba(196,164,120,0.5)" }}>ARQUITECTURA DEL SISTEMA</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-light mb-3" style={{ color: "white" }}>
              Stack <span className="font-semibold" style={{ color: "#c4a478" }}>Tecnológico</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.35)" }}>
              Tecnologías actuales en producción y roadmap de integración planificado para escalar la plataforma DesdeDrone.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-12 p-1 rounded-xl inline-flex" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            {[
              { id: "current", label: "Stack Actual", count: currentStack.length },
              { id: "planned", label: "Roadmap", count: plannedStack.length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all"
                style={{
                  background: activeTab === tab.id ? "rgba(196,164,120,0.1)" : "transparent",
                  color: activeTab === tab.id ? "#c4a478" : "rgba(255,255,255,0.35)",
                }}>
                {tab.label}
                <span className="dd-mono text-xs px-1.5 py-0.5 rounded" style={{
                  background: activeTab === tab.id ? "rgba(196,164,120,0.1)" : "rgba(255,255,255,0.03)",
                  color: activeTab === tab.id ? "#c4a478" : "rgba(255,255,255,0.2)",
                }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Architecture diagram mini */}
          {activeTab === "current" && (
            <div className="mb-12 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="dd-mono text-xs tracking-widest mb-5" style={{ color: "rgba(196,164,120,0.4)" }}>DIAGRAMA SIMPLIFICADO</div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {["React + Vite", "→", "Tailwind CSS", "→", "Build", "→", "Vercel CDN", "→", "Cliente"].map((item, i) => (
                  item === "→" ? (
                    <span key={i} className="text-lg" style={{ color: "rgba(196,164,120,0.15)" }}>→</span>
                  ) : (
                    <div key={i} className="px-4 py-2.5 rounded-xl text-xs font-medium dd-mono" style={{
                      background: "rgba(196,164,120,0.04)",
                      border: "1px solid rgba(196,164,120,0.08)",
                      color: "rgba(255,255,255,0.5)",
                    }}>{item}</div>
                  )
                ))}
              </div>
            </div>
          )}

          {activeTab === "planned" && (
            <div className="mb-12 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="dd-mono text-xs tracking-widest mb-5" style={{ color: "rgba(196,164,120,0.4)" }}>ARQUITECTURA OBJETIVO</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  { items: ["Cliente (React)"], color: "#c4a478" },
                  { items: ["→"] },
                  { items: ["Vercel Edge"], color: "#b89878" },
                  { items: ["→"] },
                  { items: ["Supabase Auth", "Supabase DB", "Supabase Storage"], color: "#8fb4c4" },
                  { items: ["→"] },
                  { items: ["Cloudflare R2", "FFmpeg Worker"], color: "#b89878" },
                ].map((group, gi) => (
                  <div key={gi} className="flex flex-col items-center gap-1.5">
                    {group.items.map((item, ii) => (
                      item === "→" ? (
                        <span key={ii} className="text-lg" style={{ color: "rgba(196,164,120,0.15)" }}>→</span>
                      ) : (
                        <div key={ii} className="px-3 py-2 rounded-lg text-xs dd-mono" style={{
                          background: `${group.color || "#c4a478"}08`,
                          border: `1px solid ${group.color || "#c4a478"}15`,
                          color: "rgba(255,255,255,0.45)",
                        }}>{item}</div>
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category legend */}
          <div className="flex flex-wrap gap-4 mb-8">
            {cats.filter(c => data.some(d => d.cat === c)).map(c => (
              <div key={c} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: catColors[c] }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{c}</span>
              </div>
            ))}
          </div>

          {/* Tech cards */}
          <div className="space-y-3">
            {data.map((tech, i) => (
              <div key={i} className="group p-6 rounded-2xl transition-all" style={{
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(196,164,120,0.1)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="lg:w-56 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: catColors[tech.cat] }} />
                      <h3 className="text-base font-semibold" style={{ color: "white" }}>{tech.name}</h3>
                    </div>
                    <span className="dd-mono text-xs" style={{ color: catColors[tech.cat] }}>{tech.role}</span>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{tech.desc}</p>
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    {tech.priority && (
                      <span className="dd-mono text-xs px-2.5 py-1 rounded-lg" style={{
                        background: `${prioColors[tech.priority]}08`,
                        border: `1px solid ${prioColors[tech.priority]}15`,
                        color: prioColors[tech.priority],
                      }}>Prioridad {tech.priority}</span>
                    )}
                    <span className="dd-mono text-xs px-2.5 py-1 rounded-lg" style={{
                      background: tech.status === "Producción" ? "rgba(196,164,120,0.06)" : "rgba(255,255,255,0.02)",
                      border: tech.status === "Producción" ? "1px solid rgba(196,164,120,0.12)" : "1px solid rgba(255,255,255,0.04)",
                      color: tech.status === "Producción" ? "#c4a478" : "rgba(255,255,255,0.3)",
                    }}>{tech.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-16 p-8 rounded-2xl text-center" style={{ background: "rgba(196,164,120,0.02)", border: "1px solid rgba(196,164,120,0.06)" }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "white" }}>Criterio de selección</h3>
            <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
              Cada tecnología fue elegida priorizando confiabilidad, costo operativo bajo, ecosistema open source y compatibilidad con datos geoespaciales. El stack está diseñado para escalar de MVP a plataforma multi-tenant sin reescrituras.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LANDING — PREMIUM / ARCHITECTURAL
// ═══════════════════════════════════════════════════════════════════════
function Landing({ onNavigate, darkMode, setDarkMode }) {
  const [hoveredService, setHoveredService] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => { if (scrollY > 10) setMobileMenuOpen(false); }, [scrollY]);

  const dm = darkMode;
  // Light-mode palette mirrors tarifario_v2 editorial system:
  // warm-grey neutral, near-black text scale, solid borders, no gold tint.
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
  const cardBg   = dm ? "rgba(255,255,255,0.01)" : "#ffffff";
  const cardBorder= dm ? "rgba(255,255,255,0.04)" : "#e2e2dc";
  // Primary CTA: gold in dark, near-black "tag" in light (editorial)
  const ctaBg    = dm ? "#c4a478" : "#111110";
  const ctaText  = dm ? "#0a0c10" : "#ffffff";

  const NAV_ITEMS = [{t:"Servicios",v:"servicios"},{t:"Casos de Uso",v:"casos"},{t:"Presupuesto",v:"presupuesto"},{t:"Plataforma",v:"stack"},{t:"Contacto",v:null}];

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
      `}</style>

      <div className="dd-body">
        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all" style={{
          background: navBg,
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${navBorder}`,
        }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <span className="text-xl" style={{color: accent}}>◈</span>
              <span className="text-sm font-semibold tracking-wider" style={{color: textPri}}>DESDEDRONE<span style={{color: accent}}>.AR</span></span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map(item => (
                <a key={item.t} href="#" onClick={e => { e.preventDefault(); if (item.v) onNavigate(item.v); }}
                  className="text-xs tracking-wider transition-colors"
                  style={{color: textFade}}
                  onMouseEnter={e => e.target.style.color = accentStrong}
                  onMouseLeave={e => e.target.style.color = textFade}>
                  {item.t}
                </a>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Dark/Light toggle */}
              <button id="theme-toggle" onClick={() => setDarkMode(d => !d)}
                className="dd-theme-btn w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: dm ? "rgba(196,164,120,0.08)" : "rgba(17,17,16,0.04)", color: dm ? accent : accentStrong, border: `1px solid ${dm ? "rgba(196,164,120,0.2)" : "rgba(17,17,16,0.18)"}` }}
                title={dm ? "Modo claro" : "Modo oscuro"}>
                {dm ? <Ic.Sun /> : <Ic.Moon />}
              </button>

              {/* Portal button — hidden on mobile */}
              <button onClick={() => onNavigate("login")}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium tracking-wider transition-all dd-glow"
                style={{border:`1px solid ${dm ? "rgba(196,164,120,0.25)" : "#111110"}`, color: dm ? accent : accentStrong}}
                onMouseEnter={e => e.currentTarget.style.background = dm ? "rgba(196,164,120,0.06)" : "rgba(17,17,16,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Portal Clientes
              </button>

              {/* Hamburger — only mobile */}
              <button id="mobile-menu-toggle" onClick={() => setMobileMenuOpen(o => !o)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: mobileMenuOpen ? "rgba(196,164,120,0.1)" : "rgba(255,255,255,0.05)", color: textFade, border: `1px solid ${mobileMenuOpen ? "rgba(196,164,120,0.2)" : "rgba(255,255,255,0.08)"}` }}
                aria-label="Menú">
                {mobileMenuOpen ? <Ic.X /> : <Ic.Menu />}
              </button>
            </div>
          </div>

          {/* ── MOBILE MENU ── */}
          {mobileMenuOpen && (
            <div className="dd-mobile-menu md:hidden px-6 pb-5 pt-1"
              style={{ borderTop: `1px solid ${navBorder}` }}>
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map(item => (
                  <a key={item.t} href="#"
                    onClick={e => { e.preventDefault(); setMobileMenuOpen(false); if (item.v) onNavigate(item.v); }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: textFade2, background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,164,120,0.06)"; e.currentTarget.style.color = accent; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textFade2; }}>
                    {item.t}
                    <span style={{color: "rgba(196,164,120,0.3)", fontSize: "10px"}}>→</span>
                  </a>
                ))}
                <div style={{ height: 1, background: `${navBorder}`, margin: "6px 0" }} />
                <button onClick={() => { setMobileMenuOpen(false); onNavigate("login"); }}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wider"
                  style={{ background: ctaBg, color: ctaText }}>
                  Portal Clientes
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <video
            className="absolute top-[72px] left-0 right-0 w-full object-cover object-top lg:object-contain"
            src="/video/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            style={{ opacity: dm ? 0.65 : 0.9, height: "80vh" }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{background: dm
            ? "linear-gradient(180deg, rgba(8,10,14,0.35) 0%, rgba(8,10,14,0.1) 40%, rgba(8,10,14,0.65) 100%)"
            : "linear-gradient(180deg, rgba(245,240,232,0.2) 0%, rgba(245,240,232,0.05) 40%, rgba(245,240,232,0.55) 100%)"}} />
          {dm && <TopoCanvas />}
          <div className="absolute inset-0" style={{background: dm ? "radial-gradient(ellipse at 70% 40%, rgba(196,164,120,0.04), transparent 60%)" : "radial-gradient(ellipse at 70% 40%, rgba(196,164,120,0.08), transparent 60%)"}} />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-3xl pt-24">
              {/* Coordinates badge */}
              <div className="dd-fade-up flex items-center gap-4 mb-12">
                <div className="h-px w-12" style={{background:"rgba(196,164,120,0.3)"}}/>
                <span className="dd-mono text-xs tracking-widest" style={{color:"rgba(196,164,120,0.6)"}}>34°36'S  58°22'W — ARGENTINA</span>
              </div>

              <h1 className="dd-fade-up dd-fade-up-d1 text-4xl lg:text-7xl font-light leading-tight tracking-tight mb-3" style={{color: dm ? "white" : textPri}}>
                Visión aérea para
              </h1>
              <h1 className="dd-fade-up dd-fade-up-d2 text-4xl lg:text-7xl font-semibold leading-tight tracking-tight mb-10" style={{color:accentStrong}}>
                decisiones estratégicas
              </h1>

              <div className="dd-fade-up dd-fade-up-d3">
                <div className="dd-line h-px mb-8" style={{background:"linear-gradient(90deg, rgba(196,164,120,0.3), transparent)"}} />
              </div>

              <p className="dd-fade-up dd-fade-up-d3 text-base lg:text-lg leading-relaxed max-w-xl mb-4" style={{color: dm ? "rgba(255,255,255,0.45)" : textMed}}>
                Fotogrametría, ortomosaicos, modelos de elevación y producción aérea profesional.
              </p>
              <p className="dd-fade-up dd-fade-up-d3 text-base lg:text-lg leading-relaxed max-w-xl mb-5" style={{color: dm ? "rgba(255,255,255,0.45)" : textMed}}>
                Vuelos FPV para Real Estate de alto impacto.
              </p>
              <p className="dd-fade-up dd-fade-up-d3 text-sm leading-relaxed max-w-xl mb-12" style={{color: dm ? "rgba(255,255,255,0.3)" : textFade}}>
                Procesamos y entregamos datos de alta precisión en una plataforma propia diseñada para visualizar, medir y analizar cada proyecto en detalle.
              </p>

              <div className="dd-fade-up dd-fade-up-d4 flex flex-wrap items-center gap-4">
                <button onClick={()=>onNavigate("login")} className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all dd-glow" style={{background:ctaBg,color:ctaText}}>
                  Acceder al portal <Ic.Arrow />
                </button>
                <button className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{color: dm ? "rgba(255,255,255,0.5)" : textFade, border: dm ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${accent}20`}} onMouseEnter={e=>e.currentTarget.style.borderColor=dm?"rgba(196,164,120,0.2)":"rgba(196,164,120,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=dm?"rgba(255,255,255,0.08)":`${accent}20`}>
                  Solicitar presupuesto
                </button>
              </div>
            </div>

            {/* Right metrics */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8">
              {[
                {n:<Counter end={24000}/>,u:"ha",l:"relevadas"},
                {n:<Counter end={340} suffix="+"/>,u:"",l:"proyectos"},
                {n:"±2",u:"cm",l:"precisión GSD"},
              ].map((m,i)=>(
                <div key={i} className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-light dd-mono" style={{color:accentStrong}}>{m.n}</span>
                    <span className="text-xs dd-mono" style={{color:"rgba(196,164,120,0.5)"}}>{m.u}</span>
                  </div>
                  <span className="text-xs tracking-wider" style={{color: dm ? "rgba(255,255,255,0.2)" : textFade}}>{m.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" style={{opacity: scrollY > 100 ? 0 : 0.3, transition:"opacity 0.3s"}}>
            <Ic.ArrowDown/>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-20">
              <div>
                <span className="dd-mono text-xs tracking-widest block mb-3" style={{color:"rgba(196,164,120,0.5)"}}>SERVICIOS</span>
                <h2 className="text-3xl lg:text-5xl font-light" style={{color:textPri}}>Soluciones de <span className="font-semibold" style={{color:accentStrong}}>precisión</span></h2>
              </div>
              <div className="hidden lg:block h-px w-1/3" style={{background:"linear-gradient(270deg, rgba(196,164,120,0.15), transparent)"}}/>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              {[
                { icon:<Ic.Scan/>, title:"Fotogrametría & Ortomosaicos", desc:"Ortomosaicos georreferenciados, MDS, curvas de nivel y nubes de puntos densas. Vuelos planificados con solapamiento controlado y GCPs para máxima precisión absoluta.", specs:["GSD hasta 1.5 cm/px","Precisión ±3 cm con GCPs","GeoTIFF · LAS · DXF","Visualización online"], color:"#c4a478" },
                { icon:<Ic.Camera/>, title:"Video Aéreo & FPV", desc:"Producción cinematográfica 4K/60fps con estabilización de 3 ejes. Vuelos FPV inmersivos para Real Estate de alto impacto. Edición profesional con color grading.", specs:["4K / 60fps · D-Log","FPV inmersivo","Color grading · Edición","Review con timestamps"], color:"#8fb4c4" },
                { icon:<Ic.Target/>, title:"Inspección & Monitoreo", desc:"Inspección técnica con sensores RGB y térmicos radiométricos. Detección de anomalías en infraestructura, seguimiento temporal de obra y reportes geolocalizados.", specs:["Sensor térmico FLIR","Detección de anomalías","Comparativa multi-vuelo","Reportes UTM"], color:"#b89878" },
              ].map((s,i)=>(
                <div key={i} className="group relative p-8 rounded-2xl transition-all duration-500 dd-glow cursor-default"
                  style={{background:hoveredService===i?"rgba(255,255,255,0.025)":"rgba(255,255,255,0.01)",border:`1px solid ${hoveredService===i?"rgba(196,164,120,0.12)":"rgba(255,255,255,0.04)"}`,}}
                  onMouseEnter={()=>setHoveredService(i)} onMouseLeave={()=>setHoveredService(null)}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 transition-all" style={{background:`${s.color}0c`,border:`1px solid ${s.color}18`,color:s.color}}>{s.icon}</div>
                  <h3 className="text-lg font-semibold mb-3" style={{color:textPri}}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{color:textFade}}>{s.desc}</p>
                  <div className="space-y-2">
                    {s.specs.map((sp,j)=>(
                      <div key={j} className="flex items-center gap-2.5">
                        <div className="w-1 h-1 rounded-full" style={{background:s.color}}/>
                        <span className="dd-mono text-xs" style={{color:textMed}}>{sp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLATFORM ── */}
        <section className="relative py-32" style={{background: dm ? "rgba(0,0,0,0.2)" : "rgba(196,164,120,0.04)"}}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-20">
              <span className="dd-mono text-xs tracking-widest block mb-3" style={{color:"rgba(196,164,120,0.5)"}}>PLATAFORMA</span>
              <h2 className="text-3xl lg:text-5xl font-light mb-4" style={{color:textPri}}>Plataforma de <span className="font-semibold" style={{color:accentStrong}}>entregables</span></h2>
              <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{color:textFade}}>
                Centralizá mapas, mediciones, videos y comentarios en un entorno único de visualización.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-6xl mx-auto">
              {[
                { onClick:()=>onNavigate("ortho"), icon:<Ic.Map/>, tag:"Visor Geoespacial", title:"Ortomosaicos · MDS · Nube de Puntos", desc:"Visualizá capas georreferenciadas, medí distancias y áreas, y analizá modelos de elevación directamente desde el browser.", color:"#c4a478" },
                { onClick:()=>onNavigate("video"), icon:<Ic.Video/>, tag:"Sistema de Revisión", title:"Video aéreo · Observaciones · Descarga", desc:"Revisá el material editado con observaciones timestamped, descargá muestras con marca de agua y aprobá entregas.", color:"#8fb4c4" },
                { onClick:()=>onNavigate("servicios"), icon:<Ic.Drone/>, tag:"Catálogo de Servicios", title:"Fotogrametría · Video · Inspección", desc:"Detalles técnicos de cada servicio, industrias que atendemos y formulario directo para solicitar una propuesta personalizada.", color:"#a0b890" },
                { onClick:()=>onNavigate("casos"), icon:<Ic.Building/>, tag:"Casos de Uso", title:"Constructoras · Energía · Ingeniería Civil", desc:"Casos reales de fotogrametría, inspección y producción aérea. Métricas concretas para evaluar el retorno en tu proyecto.", color:"#b89878" },
                { onClick:()=>onNavigate("presupuesto"), icon:<Ic.Calculator/>, tag:"Presupuesto · Constructoras", title:"Paquetes · Calculadora · Entregables", desc:"Paquetes mensuales con precio cerrado, calculadora interactiva y ejemplos concretos de entregables por vuelo. Propuesta formal en 24 hs.", color:"#d4a053" },
              ].map((c,i)=>(
                <div key={i} onClick={c.onClick} className="group relative p-8 lg:p-10 rounded-2xl cursor-pointer transition-all duration-500 dd-glow overflow-hidden" style={{background:cardBg, border:`1px solid ${cardBorder}`,minHeight:"280px",...(i===2&&{gridColumn:"span 1"})}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=`${c.color}40`} onMouseLeave={e=>e.currentTarget.style.borderColor=cardBorder}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{background:`radial-gradient(circle at ${i===0?"85% 85%":"15% 85%"}, ${c.color}06, transparent 60%)`}}/>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{background:`${c.color}0a`,border:`1px solid ${c.color}15`,color:c.color}}>{c.icon}</div>
                    <span className="dd-mono text-xs tracking-widest block mb-3" style={{color:c.color}}>{c.tag}</span>
                    <h3 className="text-xl font-semibold mb-3" style={{color:textPri}}>{c.title}</h3>
                    <p className="text-sm leading-relaxed mb-8" style={{color:textFade}}>{c.desc}</p>
                    <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wider transition-all" style={{color:c.color}}>Ver demo <Ic.Arrow/></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-20">
              <div>
                <span className="dd-mono text-xs tracking-widest block mb-3" style={{color:"rgba(196,164,120,0.5)"}}>PROCESO</span>
                <h2 className="text-3xl lg:text-5xl font-light" style={{color:textPri}}>Flujo <span className="font-semibold" style={{color:accentStrong}}>operativo</span></h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {n:"01",title:"Relevamiento",desc:"Planificación de vuelo, definición de GSD, área de cobertura y puntos de control.",icon:<Ic.Drone/>},
                {n:"02",title:"Captura",desc:"Vuelo autónomo con solapamiento frontal 80% y lateral 70%. Registro de GCPs.",icon:<Ic.Camera/>},
                {n:"03",title:"Procesamiento",desc:"Alineación, nube densa, ortomosaico, MDS. Control de calidad y validación.",icon:<Ic.Cpu/>},
                {n:"04",title:"Entrega",desc:"Publicación en plataforma con visualización interactiva, medición y descarga.",icon:<Ic.Eye/>},
              ].map((s,i)=>(
                <div key={i} className="relative p-7 rounded-2xl transition-all" style={{background:cardBg,border:`1px solid ${cardBorder}`}}>
                  <span className="dd-mono text-4xl font-light block mb-5" style={{color:"rgba(196,164,120,0.08)"}}>{s.n}</span>
                  <div className="mb-4" style={{color:"#c4a478"}}>{s.icon}</div>
                  <h4 className="text-sm font-semibold mb-2" style={{color:textPri}}>{s.title}</h4>
                  <p className="text-xs leading-relaxed" style={{color:textFade}}>{s.desc}</p>
                  {i<3&&<div className="hidden lg:flex absolute top-1/2 -right-3 w-6 items-center justify-center" style={{color:"rgba(196,164,120,0.12)"}}><span className="text-lg">→</span></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLIENTS ── */}
        <section className="relative py-24" style={{background: dm ? "rgba(0,0,0,0.15)" : "rgba(196,164,120,0.02)"}}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-6 mb-12">
              <div className="h-px flex-1" style={{background:"linear-gradient(90deg, transparent, rgba(196,164,120,0.1))"}}/>
              <span className="dd-mono text-xs tracking-widest" style={{color: dm ? "rgba(255,255,255,0.2)" : "rgba(30,24,18,0.3)"}}>SECTORES QUE CONFÍAN EN NOSOTROS</span>
              <div className="h-px flex-1" style={{background:"linear-gradient(270deg, transparent, rgba(196,164,120,0.1))"}}/>
            </div>
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
              {["Ingeniería Civil","Arquitectura","Agro & Campo","Energía Renovable","Real Estate","Minería","Gobierno","Medio Ambiente"].map(s=>(
                <span key={s} className="text-sm tracking-wide" style={{color: dm ? "rgba(255,255,255,0.2)" : textFade}}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <span className="dd-mono text-xs tracking-widest block mb-6" style={{color:"rgba(196,164,120,0.5)"}}>COMENZAR</span>
            <h2 className="text-3xl lg:text-5xl font-light mb-5" style={{color:textPri}}>
              ¿Necesitás <span className="font-semibold" style={{color:accentStrong}}>datos aéreos</span> para tu próximo proyecto?
            </h2>
            <p className="text-sm leading-relaxed mb-12" style={{color:textFade}}>
              Contanos los requerimientos técnicos de tu proyecto y te enviamos una propuesta detallada en menos de 24 horas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={()=>onNavigate("servicios")} className="px-8 py-4 rounded-xl text-sm font-semibold tracking-wide dd-glow transition-all" style={{background:ctaBg,color:ctaText}}>Solicitar presupuesto</button>
              <button onClick={()=>onNavigate("login")} className="px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{color:textFade,border: dm ? "1px solid rgba(255,255,255,0.06)" : `1px solid ${accent}20`}} onMouseEnter={e=>e.currentTarget.style.borderColor=dm?"rgba(196,164,120,0.15)":`${accent}40`} onMouseLeave={e=>e.currentTarget.style.borderColor=dm?"rgba(255,255,255,0.06)":`${accent}20`}>Ya tengo cuenta</button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t py-8 px-6 lg:px-12" style={{borderColor: dm ? "rgba(255,255,255,0.03)" : "rgba(196,164,120,0.1)"}}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><span style={{color:"#c4a478"}}>◈</span><span className="text-xs font-medium tracking-wider" style={{color: dm ? "rgba(255,255,255,0.25)" : textDim}}>DESDEDRONE.AR</span></div>
            <p className="dd-mono text-xs" style={{color: dm ? "rgba(255,255,255,0.12)" : textDim}}>© 2026 — Servicios aéreos con drones de precisión — Argentina</p>
          </div>
        </footer>

        {/* ── V1 / V3 toggle (discreto) ── */}
        <button onClick={() => onNavigate("landing")}
          className="dd-mono fixed bottom-4 right-4 z-[120] px-3 py-1.5 rounded-full text-[10px] tracking-widest transition-opacity"
          style={{ background: dm ? "rgba(10,12,16,0.7)" : "rgba(245,245,242,0.85)", color: accentStrong, border: `1px solid ${dm ? "rgba(196,164,120,0.25)" : "rgba(17,17,16,0.18)"}`, backdropFilter: "blur(10px)", opacity: 0.45 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
          title="Volver a landing principal">
          V1 · V3 →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("landing");
  const [proj, setProj] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  if (view === "landing" || view === "landing-v3") return <LandingV3 onNavigate={v=>{if(v==="ortho")setProj(PROJECTS[0]);if(v==="video")setProj(PROJECTS[1]);setView(v);}} darkMode={darkMode} setDarkMode={setDarkMode}/>;
  if (view === "landing-v1") return <Landing onNavigate={v=>{if(v==="ortho")setProj(PROJECTS[0]);if(v==="video")setProj(PROJECTS[1]);setView(v);}} darkMode={darkMode} setDarkMode={setDarkMode}/>;
  if (view === "login") return <Login onLogin={()=>setView("dashboard")} onBack={()=>setView("landing")}/>;
  if (view === "stack") return <StackPage onBack={()=>setView("landing")}/>;
  if (view === "casos") return <CasosDeUsoPage onBack={()=>setView("landing")} onContacto={()=>setView("presupuesto")}/>;
  if (view === "presupuesto") return <PresupuestoPage onBack={()=>setView("landing")} onContacto={()=>setView("landing")}/>;
  if (view === "servicios") return <ServiciosPage onBack={()=>setView("landing")} onPresupuesto={()=>setView("presupuesto")} dark={darkMode} onToggleTheme={()=>setDarkMode(d=>!d)}/>;

  // Dashboard shell
  const accent = "#c4a478";
  return (
    <div className="min-h-screen flex" style={{background:"#0a0c10",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      {/* Sidebar */}
      <div className="w-14 lg:w-56 flex-shrink-0 flex flex-col border-r" style={{borderColor:"rgba(255,255,255,0.04)",background:"rgba(0,0,0,0.3)"}}>
        <div className="p-3 lg:p-5 flex items-center gap-2.5">
          <span style={{color:accent,fontSize:"18px"}}>◈</span>
          <span className="hidden lg:inline text-xs font-semibold tracking-wider" style={{color:"white"}}>DESDEDRONE</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[{id:"dashboard",icon:<Ic.Grid/>,label:"Proyectos"},{id:"ortho",icon:<Ic.Map/>,label:"Mapas"},{id:"video",icon:<Ic.Video/>,label:"Videos"},{id:"invoices",icon:<Ic.Invoice/>,label:"Facturación"}].map(item=>(
            <button key={item.id} onClick={()=>setView(item.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all" style={{background:view===item.id?`${accent}0f`:"transparent",color:view===item.id?accent:"rgba(255,255,255,0.3)"}}>{item.icon}<span className="hidden lg:inline">{item.label}</span></button>
          ))}
        </nav>
        <div className="p-2 border-t" style={{borderColor:"rgba(255,255,255,0.04)"}}>
          <button onClick={()=>setView("landing")} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs" style={{color:"rgba(255,255,255,0.2)"}}><Ic.Lock/><span className="hidden lg:inline">Cerrar sesión</span></button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b" style={{borderColor:"rgba(255,255,255,0.04)"}}>
          <div>
            <h2 className="text-sm font-semibold" style={{color:"white"}}>{view==="dashboard"&&"Mis Proyectos"}{view==="ortho"&&(proj?.name||"Visualizador de Mapas")}{view==="video"&&(proj?.name||"Revisión de Video")}{view==="invoices"&&"Presupuestos & Facturación"}</h2>
            {proj&&(view==="ortho"||view==="video")&&<p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.2)",fontFamily:"'IBM Plex Mono',monospace"}}>{proj.date} — {proj.type}</p>}
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold" style={{background:`${accent}0c`,color:accent,border:`1px solid ${accent}18`}}>C</div>
        </div>

        <div className="flex-1 overflow-auto">
          {view==="dashboard"&&(
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{l:"Proyectos activos",v:"3",c:accent},{l:"En revisión",v:"1",c:"#d4a053"},{l:"Facturado",v:"$285K",c:"#8fb4c4"},{l:"Pendiente",v:"$605K",c:"rgba(255,255,255,0.4)"}].map((s,i)=><div key={i} className="p-5 rounded-2xl" style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)"}}><div className="text-xs tracking-wide mb-1.5" style={{color:"rgba(255,255,255,0.25)"}}>{s.l}</div><div className="text-2xl font-semibold" style={{color:s.c,fontFamily:"'IBM Plex Mono',monospace"}}>{s.v}</div></div>)}
              </div>
              <div className="space-y-2.5">
                {PROJECTS.map(p=>(
                  <div key={p.id} className="flex items-center gap-4 p-5 rounded-2xl transition-all cursor-pointer dd-glow" style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.04)"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(196,164,120,0.1)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.04)"}>
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{background:`${accent}08`,border:`1px solid ${accent}10`}}><span style={{color:accent}}><Ic.Map/></span></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate" style={{color:"white"}}>{p.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs" style={{color:"rgba(255,255,255,0.2)",fontFamily:"'IBM Plex Mono',monospace"}}>{p.date}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full" style={{background:p.status==="Entregado"?`${accent}0c`:p.status==="En revisión"?"rgba(212,160,83,0.08)":"rgba(143,180,196,0.08)",color:p.status==="Entregado"?accent:p.status==="En revisión"?"#d4a053":"#8fb4c4"}}>{p.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.type.includes("Fotogrametría")&&<button onClick={()=>{setProj(p);setView("ortho");}} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium" style={{background:`${accent}08`,color:accent,border:`1px solid ${accent}12`}}><Ic.Map/> Mapas</button>}
                      {p.type.includes("Video")&&<button onClick={()=>{setProj(p);setView("video");}} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium" style={{background:"rgba(143,180,196,0.06)",color:"#8fb4c4",border:"1px solid rgba(143,180,196,0.1)"}}><Ic.Video/> Video</button>}
                    </div>
                    <div className="text-right hidden lg:block">
                      <div className="text-sm font-medium" style={{color:"white",fontFamily:"'IBM Plex Mono',monospace"}}>${(p.budget/1000).toFixed(0)}K</div>
                      <div className="text-xs" style={{color:p.invoiced?accent:"rgba(255,255,255,0.2)"}}>{p.invoiced?"Facturado":"Pendiente"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {view==="ortho"&&<div className="h-full" style={{minHeight:"calc(100vh - 60px)"}}><OrthoViewer/></div>}
          {view==="video"&&<div className="h-full" style={{minHeight:"calc(100vh - 60px)"}}><VideoReviewer/></div>}
          {view==="invoices"&&(
            <div className="p-6"><div className="grid lg:grid-cols-2 gap-4">
              {PROJECTS.map(p=><div key={p.id} className="p-6 rounded-2xl" style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)"}}>
                <div className="flex items-start justify-between mb-4"><div><h3 className="text-sm font-medium" style={{color:"white"}}>{p.name}</h3><p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.2)",fontFamily:"'IBM Plex Mono',monospace"}}>{p.type} — {p.date}</p></div><span className="text-xs px-2.5 py-1 rounded-full" style={{background:p.invoiced?`${accent}0c`:"rgba(212,160,83,0.08)",color:p.invoiced?accent:"#d4a053"}}>{p.invoiced?"✓ Facturado":"Pendiente"}</span></div>
                <div className="flex items-end justify-between"><div><div className="text-xs mb-1" style={{color:"rgba(255,255,255,0.2)"}}>Presupuesto</div><div className="text-2xl font-semibold" style={{color:"white",fontFamily:"'IBM Plex Mono',monospace"}}>${p.budget.toLocaleString("es-AR")}</div></div><div className="flex gap-2"><button className="px-4 py-2 rounded-xl text-xs font-medium" style={{background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.35)",border:"1px solid rgba(255,255,255,0.06)"}}>Detalle</button>{!p.invoiced&&<button className="px-4 py-2 rounded-xl text-xs font-medium" style={{background:`${accent}0c`,color:accent,border:`1px solid ${accent}18`}}>Facturar</button>}</div></div>
              </div>)}
            </div></div>
          )}
        </div>
      </div>
    </div>
  );
}