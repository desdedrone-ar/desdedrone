// build.js — Orquesta el build combinado:
//   dist/        ← copia de /landing (HTML estático)
//   dist/app/    ← build de Vite/React de /app
//
// Ejecutado por:  npm run build  (también lo invoca Vercel via vercel.json)

import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const DIST = resolve(ROOT, "dist");
const LANDING = resolve(ROOT, "landing");
const APP = resolve(ROOT, "app");
const APP_DIST = resolve(APP, "dist");
const DIST_APP = resolve(DIST, "app");

console.log("▸ Limpiando dist/…");
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });

console.log("▸ Copiando landing/ → dist/…");
cpSync(LANDING, DIST, { recursive: true });

console.log("▸ Instalando deps de app/ (si hace falta)…");
const appNodeModules = resolve(APP, "node_modules");
if (!existsSync(appNodeModules)) {
  execSync("npm install", { cwd: APP, stdio: "inherit" });
}

console.log("▸ Build de app/ (Vite)…");
execSync("npm run build", { cwd: APP, stdio: "inherit" });

console.log("▸ Copiando app/dist → dist/app/…");
if (existsSync(APP_DIST)) cpSync(APP_DIST, DIST_APP, { recursive: true });

// Videos viven solo en /landing/video (single source of truth).
// El build los copia también a /dist/app/video para que la React app
// los sirva en /app/video/* sin duplicarlos en el repo.
const LANDING_VIDEO = resolve(LANDING, "video");
const DIST_APP_VIDEO = resolve(DIST_APP, "video");
if (existsSync(LANDING_VIDEO)) {
  console.log("▸ Copiando landing/video → dist/app/video/…");
  cpSync(LANDING_VIDEO, DIST_APP_VIDEO, { recursive: true });
}

console.log("✓ Build combinado listo: dist/");
