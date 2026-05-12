import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Potree, PointColorType, PointShape, PointSizeType } from "potree-core";
import { cloudById, cloudBaseUrl } from "./clouds";

export default function PointCloudViewer({ cloudId }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [errMsg, setErrMsg] = useState("");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const cloud = cloudById(cloudId);
    const container = containerRef.current;
    if (!container) return;

    setStatus("loading");
    setInfo(null);
    setErrMsg("");

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050810);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      5000
    );
    camera.position.set(0, 80, 80);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0, 0);

    const potree = new Potree();
    potree.pointBudget = cloud.pointBudget ?? 2_000_000;

    let pco = null;
    let disposed = false;
    let animId;

    potree
      .loadPointCloud("metadata.json", cloudBaseUrl(cloud))
      .then((loaded) => {
        if (disposed) {
          loaded.dispose();
          return;
        }
        pco = loaded;
        pco.material.pointColorType = PointColorType.RGB;
        pco.material.pointSizeType = PointSizeType.ADAPTIVE;
        pco.material.shape = PointShape.CIRCLE;
        pco.material.size = 1.0;
        pco.moveToOrigin();
        pco.rotation.x = -Math.PI / 2;
        pco.updateMatrixWorld(true);
        scene.add(pco);

        const box = new THREE.Box3().setFromObject(pco);
        const size = new THREE.Vector3();
        box.getSize(size);
        const horizDim = Math.max(size.x, size.z) || 100;
        const vertDim = size.y || horizDim;

        const dist = horizDim * 1.1;
        camera.position.set(dist * 0.7, vertDim * 0.6 + dist * 0.4, dist * 0.9);
        camera.near = Math.max(0.1, horizDim / 1000);
        camera.far = horizDim * 10;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.maxDistance = horizDim * 4;
        controls.minDistance = horizDim / 200;
        controls.update();

        setInfo({ name: cloud.name, points: cloud.points });
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Potree load failed:", err);
        if (!disposed) {
          setErrMsg(err?.message || "Error al cargar la nube");
          setStatus("error");
        }
      });

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      if (pco) potree.updatePointClouds([pco], camera, renderer);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      if (pco) {
        scene.remove(pco);
        pco.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [cloudId]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {status === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "#050810" }}
        >
          <span className="text-xs font-mono" style={{ color: "rgba(196,164,120,0.7)" }}>
            Cargando nube de puntos…
          </span>
        </div>
      )}
      {status === "error" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "#050810" }}
        >
          <span className="text-xs font-mono" style={{ color: "rgba(220,120,120,0.85)" }}>
            Error: {errMsg}
          </span>
        </div>
      )}
      {status === "ready" && info && (
        <div
          className="absolute top-3 left-3 px-3 py-2 rounded-lg text-xs font-mono"
          style={{
            background: "rgba(0,0,0,0.82)",
            color: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(196,164,120,0.18)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ color: "#c4a478" }}>NUBE</span> {info.name} &nbsp;
          <span style={{ color: "#c4a478" }}>PUNTOS</span> {info.points}
        </div>
      )}
    </div>
  );
}
