import { useState, useEffect, useRef } from "react";

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
const Ic = {
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
};

// ═══════════════════════════════════════════════════════════════════════
// TOPOGRAPHIC CANVAS
// ═══════════════════════════════════════════════════════════════════════
function TopoCanvas() {
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
function Counter({ end, suffix = "", prefix = "" }) {
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
// ORTHO VIEWER
// ═══════════════════════════════════════════════════════════════════════
function OrthoViewer() {
  const canvasRef = useRef(null);
  const [layer, setLayer] = useState("ortho");
  const [zoom, setZoom] = useState(1);
  const [measuring, setMeasuring] = useState(false);
  const [info, setInfo] = useState(null);
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width = cv.offsetWidth, h = cv.height = cv.offsetHeight;
    if (layer === "ortho") {
      for (let y=0;y<h;y+=4) for (let x=0;x<w;x+=4) { const n=Math.sin(x*0.02)*Math.cos(y*0.015)*30; const f=Math.sin((x+y)*0.005)>0; ctx.fillStyle=`rgb(${f?85+n:60+n},${f?140+n:100+n},${f?65+n:55+n})`; ctx.fillRect(x,y,4,4); }
      ctx.strokeStyle="#8B7355";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,h*0.4);ctx.bezierCurveTo(w*0.3,h*0.35,w*0.6,h*0.55,w,h*0.5);ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,0.08)";ctx.lineWidth=1;for(let x=0;x<w;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    } else if (layer === "dsm") {
      for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){const e=Math.sin(x*0.01+1)*Math.cos(y*0.008)*0.5+0.5;ctx.fillStyle=`hsl(${(1-e)*240},70%,${40+e*30}%)`;ctx.fillRect(x,y,3,3);}
    } else {
      ctx.fillStyle="#080c12";ctx.fillRect(0,0,w,h);for(let i=0;i<8000;i++){const x=Math.random()*w,y=Math.random()*h,e=Math.sin(x*0.01)*Math.cos(y*0.008)*0.5+0.5;ctx.fillStyle=`hsla(${e*120},80%,60%,0.7)`;ctx.fillRect(x,y,1+Math.random()*2,1+Math.random()*2);}
    }
  }, [layer, zoom]);
  const layers=[{id:"ortho",label:"Ortofoto",icon:<Ic.Map/>},{id:"dsm",label:"MDS / Elevación",icon:<Ic.Layers/>},{id:"pointcloud",label:"Nube de Puntos",icon:<Ic.Crosshair/>}];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b" style={{borderColor:"rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.2)"}}>
        {layers.map(l=><button key={l.id} onClick={()=>setLayer(l.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all" style={{background:layer===l.id?"rgba(196,164,120,0.15)":"transparent",color:layer===l.id?"#c4a478":"rgba(255,255,255,0.45)",border:layer===l.id?"1px solid rgba(196,164,120,0.25)":"1px solid transparent"}}>{l.icon}{l.label}</button>)}
        <div className="flex-1"/>
        <button onClick={()=>setMeasuring(!measuring)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs" style={{background:measuring?"rgba(196,164,120,0.15)":"transparent",color:measuring?"#c4a478":"rgba(255,255,255,0.4)",border:measuring?"1px solid rgba(196,164,120,0.25)":"1px solid rgba(255,255,255,0.1)"}}><Ic.Ruler/> Medir</button>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={()=>setZoom(z=>Math.max(0.5,z-0.25))} className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)"}}>−</button>
          <span className="text-xs w-12 text-center" style={{color:"rgba(255,255,255,0.4)"}}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.min(4,z+0.25))} className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)"}}>+</button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden cursor-crosshair" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;setInfo({lat:(-33.8+y*0.0001).toFixed(6),lng:(-60.5+x*0.0001).toFixed(6),elev:(120+Math.sin(x*0.01)*15).toFixed(1)});}}>
        <canvas ref={canvasRef} className="w-full h-full" style={{transform:`scale(${zoom})`,transformOrigin:"center"}}/>
        {info&&<div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg text-xs font-mono" style={{background:"rgba(0,0,0,0.85)",color:"rgba(255,255,255,0.75)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.08)"}}><span style={{color:"#c4a478"}}>LAT</span> {info.lat} &nbsp;<span style={{color:"#c4a478"}}>LNG</span> {info.lng} &nbsp;<span style={{color:"#d4a053"}}>ELEV</span> {info.elev}m</div>}
        {measuring&&<div className="absolute top-3 left-3 px-3 py-2 rounded-lg text-xs" style={{background:"rgba(196,164,120,0.08)",color:"#c4a478",border:"1px solid rgba(196,164,120,0.15)"}}>Click dos puntos en el mapa para medir distancia</div>}
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
function Landing({ onNavigate }) {
  const [hoveredService, setHoveredService] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0c10" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        .dd-body { font-family: 'DM Sans', sans-serif; }
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
        .dd-glow:hover { box-shadow: 0 8px 40px rgba(196,164,120,0.08); }
      `}</style>

      <div className="dd-body">
        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all" style={{
          background: scrollY > 50 ? "rgba(10,12,16,0.9)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(16px)" : "none",
          borderBottom: scrollY > 50 ? "1px solid rgba(196,164,120,0.06)" : "1px solid transparent",
        }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl" style={{color:"#c4a478"}}>◈</span>
              <span className="text-sm font-semibold tracking-wider" style={{color:"white"}}>DESDEDRONE<span style={{color:"#c4a478"}}>.AR</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {[{t:"Servicios",v:null},{t:"Plataforma",v:"stack"},{t:"Proceso",v:null},{t:"Contacto",v:null}].map(item=><a key={item.t} href="#" onClick={e=>{e.preventDefault();if(item.v)onNavigate(item.v);}} className="text-xs tracking-wider transition-colors" style={{color:"rgba(255,255,255,0.35)"}} onMouseEnter={e=>e.target.style.color="#c4a478"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>{item.t}</a>)}
            </div>
            <button onClick={()=>onNavigate("login")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium tracking-wider transition-all dd-glow" style={{border:"1px solid rgba(196,164,120,0.25)",color:"#c4a478"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(196,164,120,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Portal Clientes</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <TopoCanvas />
          <div className="absolute inset-0" style={{background:"radial-gradient(ellipse at 70% 40%, rgba(196,164,120,0.04), transparent 60%)"}} />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-3xl pt-24">
              {/* Coordinates badge */}
              <div className="dd-fade-up flex items-center gap-4 mb-12">
                <div className="h-px w-12" style={{background:"rgba(196,164,120,0.3)"}}/>
                <span className="dd-mono text-xs tracking-widest" style={{color:"rgba(196,164,120,0.5)"}}>34°36'S  58°22'W — ARGENTINA</span>
              </div>

              <h1 className="dd-fade-up dd-fade-up-d1 text-4xl lg:text-7xl font-light leading-tight tracking-tight mb-3" style={{color:"white"}}>
                Visión aérea para
              </h1>
              <h1 className="dd-fade-up dd-fade-up-d2 text-4xl lg:text-7xl font-semibold leading-tight tracking-tight mb-10" style={{color:"#c4a478"}}>
                decisiones estratégicas
              </h1>

              <div className="dd-fade-up dd-fade-up-d3">
                <div className="dd-line h-px mb-8" style={{background:"linear-gradient(90deg, rgba(196,164,120,0.3), transparent)"}} />
              </div>

              <p className="dd-fade-up dd-fade-up-d3 text-base lg:text-lg leading-relaxed max-w-xl mb-4" style={{color:"rgba(255,255,255,0.45)"}}>
                Fotogrametría, ortomosaicos, modelos de elevación y producción aérea profesional.
              </p>
              <p className="dd-fade-up dd-fade-up-d3 text-base lg:text-lg leading-relaxed max-w-xl mb-5" style={{color:"rgba(255,255,255,0.45)"}}>
                Vuelos FPV para Real Estate de alto impacto.
              </p>
              <p className="dd-fade-up dd-fade-up-d3 text-sm leading-relaxed max-w-xl mb-12" style={{color:"rgba(255,255,255,0.3)"}}>
                Procesamos y entregamos datos de alta precisión en una plataforma propia diseñada para visualizar, medir y analizar cada proyecto en detalle.
              </p>

              <div className="dd-fade-up dd-fade-up-d4 flex flex-wrap items-center gap-4">
                <button onClick={()=>onNavigate("login")} className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all dd-glow" style={{background:"#c4a478",color:"#0a0c10"}}>
                  Acceder al portal <Ic.Arrow />
                </button>
                <button className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.08)"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(196,164,120,0.2)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
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
                    <span className="text-3xl font-light dd-mono" style={{color:"#c4a478"}}>{m.n}</span>
                    <span className="text-xs dd-mono" style={{color:"rgba(196,164,120,0.5)"}}>{m.u}</span>
                  </div>
                  <span className="text-xs tracking-wider" style={{color:"rgba(255,255,255,0.2)"}}>{m.l}</span>
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
                <h2 className="text-3xl lg:text-5xl font-light" style={{color:"white"}}>Soluciones de <span className="font-semibold" style={{color:"#c4a478"}}>precisión</span></h2>
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
                  <h3 className="text-lg font-semibold mb-3" style={{color:"white"}}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{color:"rgba(255,255,255,0.35)"}}>{s.desc}</p>
                  <div className="space-y-2">
                    {s.specs.map((sp,j)=>(
                      <div key={j} className="flex items-center gap-2.5">
                        <div className="w-1 h-1 rounded-full" style={{background:s.color}}/>
                        <span className="dd-mono text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{sp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLATFORM ── */}
        <section className="relative py-32" style={{background:"rgba(0,0,0,0.2)"}}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-20">
              <span className="dd-mono text-xs tracking-widest block mb-3" style={{color:"rgba(196,164,120,0.5)"}}>PLATAFORMA</span>
              <h2 className="text-3xl lg:text-5xl font-light mb-4" style={{color:"white"}}>Plataforma de <span className="font-semibold" style={{color:"#c4a478"}}>entregables</span></h2>
              <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{color:"rgba(255,255,255,0.35)"}}>
                Centralizá mapas, mediciones, videos y comentarios en un entorno único de visualización.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
              {[
                { onClick:()=>onNavigate("ortho"), icon:<Ic.Map/>, tag:"Visor Geoespacial", title:"Ortomosaicos · MDS · Nube de Puntos", desc:"Visualizá capas georreferenciadas, medí distancias y áreas, y analizá modelos de elevación directamente desde el browser.", color:"#c4a478" },
                { onClick:()=>onNavigate("video"), icon:<Ic.Video/>, tag:"Sistema de Revisión", title:"Video aéreo · Observaciones · Descarga", desc:"Revisá el material editado con observaciones timestamped, descargá muestras con marca de agua y aprobá entregas.", color:"#8fb4c4" },
              ].map((c,i)=>(
                <div key={i} onClick={c.onClick} className="group relative p-8 lg:p-10 rounded-2xl cursor-pointer transition-all duration-500 dd-glow overflow-hidden" style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.04)",minHeight:"280px"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(196,164,120,0.15)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.04)"}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{background:`radial-gradient(circle at ${i===0?"85% 85%":"15% 85%"}, ${c.color}06, transparent 60%)`}}/>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{background:`${c.color}0a`,border:`1px solid ${c.color}15`,color:c.color}}>{c.icon}</div>
                    <span className="dd-mono text-xs tracking-widest block mb-3" style={{color:c.color}}>{c.tag}</span>
                    <h3 className="text-xl font-semibold mb-3" style={{color:"white"}}>{c.title}</h3>
                    <p className="text-sm leading-relaxed mb-8" style={{color:"rgba(255,255,255,0.35)"}}>{c.desc}</p>
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
                <h2 className="text-3xl lg:text-5xl font-light" style={{color:"white"}}>Flujo <span className="font-semibold" style={{color:"#c4a478"}}>operativo</span></h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {n:"01",title:"Relevamiento",desc:"Planificación de vuelo, definición de GSD, área de cobertura y puntos de control.",icon:<Ic.Drone/>},
                {n:"02",title:"Captura",desc:"Vuelo autónomo con solapamiento frontal 80% y lateral 70%. Registro de GCPs.",icon:<Ic.Camera/>},
                {n:"03",title:"Procesamiento",desc:"Alineación, nube densa, ortomosaico, MDS. Control de calidad y validación.",icon:<Ic.Cpu/>},
                {n:"04",title:"Entrega",desc:"Publicación en plataforma con visualización interactiva, medición y descarga.",icon:<Ic.Eye/>},
              ].map((s,i)=>(
                <div key={i} className="relative p-7 rounded-2xl transition-all" style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.04)"}}>
                  <span className="dd-mono text-4xl font-light block mb-5" style={{color:"rgba(196,164,120,0.08)"}}>{s.n}</span>
                  <div className="mb-4" style={{color:"#c4a478"}}>{s.icon}</div>
                  <h4 className="text-sm font-semibold mb-2" style={{color:"white"}}>{s.title}</h4>
                  <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.3)"}}>{s.desc}</p>
                  {i<3&&<div className="hidden lg:flex absolute top-1/2 -right-3 w-6 items-center justify-center" style={{color:"rgba(196,164,120,0.12)"}}><span className="text-lg">→</span></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLIENTS ── */}
        <section className="relative py-24" style={{background:"rgba(0,0,0,0.15)"}}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-6 mb-12">
              <div className="h-px flex-1" style={{background:"linear-gradient(90deg, transparent, rgba(196,164,120,0.1))"}}/>
              <span className="dd-mono text-xs tracking-widest" style={{color:"rgba(255,255,255,0.2)"}}>SECTORES QUE CONFÍAN EN NOSOTROS</span>
              <div className="h-px flex-1" style={{background:"linear-gradient(270deg, transparent, rgba(196,164,120,0.1))"}}/>
            </div>
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
              {["Ingeniería Civil","Arquitectura","Agro & Campo","Energía Renovable","Real Estate","Minería","Gobierno","Medio Ambiente"].map(s=>(
                <span key={s} className="text-sm tracking-wide" style={{color:"rgba(255,255,255,0.2)"}}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <span className="dd-mono text-xs tracking-widest block mb-6" style={{color:"rgba(196,164,120,0.5)"}}>COMENZAR</span>
            <h2 className="text-3xl lg:text-5xl font-light mb-5" style={{color:"white"}}>
              ¿Necesitás <span className="font-semibold" style={{color:"#c4a478"}}>datos aéreos</span> para tu próximo proyecto?
            </h2>
            <p className="text-sm leading-relaxed mb-12" style={{color:"rgba(255,255,255,0.3)"}}>
              Contanos los requerimientos técnicos de tu proyecto y te enviamos una propuesta detallada en menos de 24 horas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 rounded-xl text-sm font-semibold tracking-wide dd-glow transition-all" style={{background:"#c4a478",color:"#0a0c10"}}>Solicitar presupuesto</button>
              <button onClick={()=>onNavigate("login")} className="px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all" style={{color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.06)"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(196,164,120,0.15)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}>Ya tengo cuenta</button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t py-8 px-6 lg:px-12" style={{borderColor:"rgba(255,255,255,0.03)"}}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><span style={{color:"#c4a478"}}>◈</span><span className="text-xs font-medium tracking-wider" style={{color:"rgba(255,255,255,0.25)"}}>DESDEDRONE.AR</span></div>
            <p className="dd-mono text-xs" style={{color:"rgba(255,255,255,0.12)"}}>© 2026 — Servicios aéreos con drones de precisión — Argentina</p>
          </div>
        </footer>
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

  if (view === "landing") return <Landing onNavigate={v=>{if(v==="ortho")setProj(PROJECTS[0]);if(v==="video")setProj(PROJECTS[1]);setView(v);}}/>;
  if (view === "login") return <Login onLogin={()=>setView("dashboard")} onBack={()=>setView("landing")}/>;
  if (view === "stack") return <StackPage onBack={()=>setView("landing")}/>;;

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