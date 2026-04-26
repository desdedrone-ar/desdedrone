import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const terrainH = (nx, ny) =>
  Math.sin(nx * 1.3) * Math.cos(ny * 1.1) * 0.45 +
  Math.sin(nx * 2.7 + 0.5) * Math.cos(ny * 2.3 + 0.3) * 0.3 +
  Math.sin(nx * 5.1 + 1.2) * Math.cos(ny * 4.9 + 0.8) * 0.15 +
  Math.sin(nx * 9.3 + 0.7) * Math.cos(ny * 8.7 + 1.4) * 0.1;

function elevationColor(t, out) {
  let r, g, b;
  if (t < 0.25) { const f = t / 0.25; r = 0; g = f * 0.59; b = 0.59 + f * 0.41; }
  else if (t < 0.5) { const f = (t - 0.25) / 0.25; r = f * 0.31; g = 0.59 + f * 0.31; b = 1 - f * 0.78; }
  else if (t < 0.75) { const f = (t - 0.5) / 0.25; r = 0.31 + f * 0.69; g = 0.9 - f * 0.12; b = Math.max(0, 0.22 - f * 0.22); }
  else { const f = (t - 0.75) / 0.25; r = 1; g = 0.78 + f * 0.22; b = f; }
  out[0] = r; out[1] = g; out[2] = b;
}

export default function PointCloudViewer({ N = 300000 }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050810);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.01, 500);
    camera.position.set(0, 6, 12);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 40;
    controls.minDistance = 0.5;
    controls.target.set(0, 0, 0);

    // Build point cloud from terrain function
    const RANGE = 10;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const heights = new Float32Array(N);
    let minH = Infinity, maxH = -Infinity;

    for (let i = 0; i < N; i++) {
      const x = (Math.random() - 0.5) * RANGE * 2;
      const z = (Math.random() - 0.5) * RANGE * 2;
      const y = terrainH((x + RANGE) / (RANGE * 2) * 6, (z + RANGE) / (RANGE * 2) * 6) * 3 + (Math.random() - 0.5) * 0.04;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      heights[i] = y;
      if (y < minH) minH = y;
      if (y > maxH) maxH = y;
    }

    const range = maxH - minH || 1;
    const rgb = [0, 0, 0];
    for (let i = 0; i < N; i++) {
      elevationColor((heights[i] - minH) / range, rgb);
      colors[i * 3] = rgb[0];
      colors[i * 3 + 1] = rgb[1];
      colors[i * 3 + 2] = rgb[2];
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, sizeAttenuation: true });
    scene.add(new THREE.Points(geometry, material));

    // Subtle grid plane at ground level
    const grid = new THREE.GridHelper(20, 20, 0x1a1f2e, 0x1a1f2e);
    grid.position.y = minH - 0.1;
    scene.add(grid);

    setReady(true);

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [N]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#050810" }}>
          <span className="text-xs font-mono" style={{ color: "rgba(196,164,120,0.7)" }}>Generando nube de puntos…</span>
        </div>
      )}
    </div>
  );
}
