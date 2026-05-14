import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function PulseOrb({ risk = 15 }) {
  const mountRef = useRef(null);

  // Determine colors based on risk
  const isCritical = risk > 70;
  const isWarning = risk > 40;
  const themeColor = isCritical ? 0xf43f5e : isWarning ? 0xf59e0b : 0x0ea5e9;
  const secondaryColor = isCritical ? 0x991b1b : isWarning ? 0xd97706 : 0x0369a1;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 8;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const p1 = new THREE.PointLight(themeColor, 30, 25);
    p1.position.set(5, 5, 5);
    scene.add(p1);
    const p2 = new THREE.PointLight(secondaryColor, 20, 25);
    p2.position.set(-5, -5, 5);
    scene.add(p2);

    /* ── Layer 1: The Bio-Heart (Central Core) ────────── */
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 5);
    const coreMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      emissive: themeColor,
      emissiveIntensity: 2,
      roughness: 0.1,
      metalness: 1,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    /* ── Layer 2: AI Radar Rings (The requested feature) ── */
    const radarGroup = new THREE.Group();
    scene.add(radarGroup);
    
    const ringSpecs = [
      { r: 2.2, opacity: 0.2, speed: 0.5 },
      { r: 2.8, opacity: 0.15, speed: -0.3 },
      { r: 3.5, opacity: 0.1, speed: 0.2 }
    ];

    ringSpecs.forEach(spec => {
      const ringGeo = new THREE.TorusGeometry(spec.r, 0.015, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: themeColor, 
        transparent: true, 
        opacity: spec.opacity 
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      radarGroup.add(ring);
    });

    /* ── Layer 3: Scanning HUD Lines ───────────────────── */
    const hudGroup = new THREE.Group();
    scene.add(hudGroup);
    const hudMat = new THREE.MeshBasicMaterial({ 
      color: themeColor, 
      transparent: true, 
      opacity: 0.4, 
      side: THREE.DoubleSide 
    });
    
    // Crosshair lines
    const lineGeo = new THREE.BoxGeometry(7, 0.01, 0.01);
    const hLine = new THREE.Mesh(lineGeo, hudMat);
    const vLine = new THREE.Mesh(lineGeo, hudMat);
    vLine.rotation.z = Math.PI / 2;
    hudGroup.add(hLine, vLine);

    /* ── Layer 4: Data Swarm Particles ──────────────────── */
    const swarmCount = 300;
    const swarmPos = new Float32Array(swarmCount * 3);
    for (let i = 0; i < swarmCount; i++) {
      const r = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      swarmPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      swarmPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      swarmPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const swarmGeo = new THREE.BufferGeometry();
    swarmGeo.setAttribute("position", new THREE.BufferAttribute(swarmPos, 3));
    const swarmMat = new THREE.PointsMaterial({ 
      color: themeColor, 
      size: 0.04, 
      transparent: true, 
      opacity: 0.5,
      blending: THREE.AdditiveBlending 
    });
    const swarm = new THREE.Points(swarmGeo, swarmMat);
    scene.add(swarm);

    /* ── Interaction Logic ────────────────────────────── */
    let mx = 0, my = 0;
    const handleMouse = (e) => {
      const rect = container.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse);

    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Heartbeat pulse speed increases with risk
      const pulseFreq = isCritical ? 8 : isWarning ? 6 : 4;
      const heartbeat = Math.pow(Math.sin(t * pulseFreq), 2);
      const scale = 1 + heartbeat * (isCritical ? 0.3 : 0.15);
      core.scale.setScalar(scale);
      coreMat.emissiveIntensity = 1 + heartbeat * 3;

      // Radar rotation
      radarGroup.children.forEach((ring, i) => {
        ring.rotation.x = t * ringSpecs[i].speed;
        ring.rotation.y = t * ringSpecs[i].speed * 0.5;
      });

      // HUD Scaling & Rotation
      hudGroup.rotation.z = t * 0.2;
      hudGroup.scale.setScalar(1 + Math.sin(t) * 0.05);

      // Swarm movement
      swarm.rotation.y = t * 0.1;
      swarm.rotation.x = t * 0.05;

      // Mouse Parallax
      scene.rotation.y += (mx * 0.4 - scene.rotation.y) * 0.05;
      scene.rotation.x += (-my * 0.4 - scene.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [themeColor, secondaryColor, isCritical, isWarning]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "crosshair" }} />
      {/* AI Labels */}
      <div className="orb-hud-label" style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", color: isCritical ? "#f43f5e" : "#0ea5e9", fontSize: "0.7rem", letterSpacing: "2px", fontWeight: "bold", textTransform: "uppercase" }}>
        AI Intelligence Active
      </div>
    </div>
  );
}

