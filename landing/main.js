/* ============================================================
   DESDEDRONE.AR — Landing pública (vanilla JS)
   Reveal + theme + nav + smooth scroll + play/pause + counter
   ============================================================ */

// ─── Iconos SVG inline ──────────────────────────────────────
const SVG_SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
const SVG_MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
const SVG_MENU = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`;
const SVG_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`;
const SVG_PLAY = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M7 4.5v15a1 1 0 001.55.83l11-7.5a1 1 0 000-1.66l-11-7.5A1 1 0 007 4.5z"/></svg>`;

// ─── Theme toggle (persistido en localStorage) ───────────────
function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("ddThemeBtn");
  const saved = localStorage.getItem("dd3-theme") || "dark";
  root.dataset.theme = saved;
  const paintIcon = () => {
    btn.innerHTML = root.dataset.theme === "dark" ? SVG_SUN : SVG_MOON;
    btn.setAttribute("aria-label", root.dataset.theme === "dark" ? "Modo claro" : "Modo oscuro");
  };
  paintIcon();
  btn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("dd3-theme", root.dataset.theme);
    paintIcon();
  });
}

// ─── Reveal al entrar en viewport ────────────────────────────
function initReveals() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || "0", 10);
      if (delay) e.target.style.transitionDelay = delay + "ms";
      e.target.classList.add("is-visible");
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
}

// ─── Nav scrolled + scroll hint opacity ──────────────────────
function initNavScroll() {
  const nav = document.getElementById("ddNav");
  const hint = document.getElementById("ddScrollHint");
  const onScroll = () => {
    const scrolled = window.scrollY > 60;
    nav.classList.toggle("scrolled", scrolled);
    if (hint) hint.style.opacity = scrolled ? "0" : "1";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ─── Mobile menu ─────────────────────────────────────────────
function initMobileMenu() {
  const burger = document.getElementById("ddBurger");
  const menu = document.getElementById("ddMobileMenu");
  let open = false;
  const paint = () => {
    burger.innerHTML = open ? SVG_CLOSE : SVG_MENU;
    burger.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("open", open);
  };
  paint();
  burger.addEventListener("click", () => { open = !open; paint(); });
  // cerrar al clickear cualquier link del mobile menu
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { open = false; paint(); }));
  // cerrar al scrollear hacia abajo
  window.addEventListener("scroll", () => { if (open && window.scrollY > 10) { open = false; paint(); } }, { passive: true });
}

// ─── Smooth scroll para anchors internos ─────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ─── Play / Pause de los tiles ───────────────────────────────
function initVideoControls() {
  document.querySelectorAll(".dd3-tile-play").forEach(btn => {
    const wrap = btn.closest(".dd3-tile-video");
    const video = wrap && wrap.querySelector("video");
    if (!video) return;
    btn.innerHTML = SVG_PAUSE; // estado inicial: reproduciendo
    btn.dataset.playing = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
        btn.dataset.playing = "true";
        btn.innerHTML = SVG_PAUSE;
        btn.setAttribute("aria-label", "Pausar video");
        btn.setAttribute("title", "Pausar");
      } else {
        video.pause();
        btn.dataset.playing = "false";
        btn.innerHTML = SVG_PLAY;
        btn.setAttribute("aria-label", "Reproducir video");
        btn.setAttribute("title", "Reproducir");
      }
    });
  });
}

// ─── Counter animado (port de Counter de App.jsx) ────────────
function initCounters() {
  const els = document.querySelectorAll(".counter");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => {
      el.textContent = (+el.dataset.end).toLocaleString("es-AR") + (el.dataset.suffix || "");
    });
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.dataset.started) return;
      e.target.dataset.started = "1";
      const end = parseFloat(e.target.dataset.end) || 0;
      const suffix = e.target.dataset.suffix || "";
      const prefix = e.target.dataset.prefix || "";
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min((now - t0) / 2200, 1);
        const v = Math.floor((1 - Math.pow(1 - t, 4)) * end);
        e.target.textContent = prefix + v.toLocaleString("es-AR") + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  els.forEach(el => obs.observe(el));
}

// ─── Comparador DSM / NDVI ───────────────────────────────────
function initCompare() {
  const el = document.getElementById("ddCompare");
  if (!el) return;
  let dragging = false;
  const set = (clientX) => {
    const r = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    el.style.setProperty("--pos", pct + "%");
  };
  const onDown = (e) => {
    dragging = true;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    set(x);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    set(x);
  };
  const onUp = () => { dragging = false; };
  el.addEventListener("mousedown", onDown);
  el.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: true });
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);
  el.addEventListener("click", (e) => set(e.clientX));
}

// ─── Bootstrap ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initReveals();
  initNavScroll();
  initMobileMenu();
  initSmoothScroll();
  initVideoControls();
  initCounters();
  initCompare();
});
