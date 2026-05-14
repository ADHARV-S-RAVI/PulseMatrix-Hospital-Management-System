import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function PulseOrb() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 7;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const p1 = new THREE.PointLight(0x0ea5e9, 20, 20);
    p1.position.set(5, 5, 5);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xf43f5e, 15, 20);
    p2.position.set(-5, -5, 5);
    scene.add(p2);

    /* ── Layer 1: The Bio-Heart ────────────────────────── */
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 5);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 2,
      roughness: 0,
      metalness: 1,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    /* ── Layer 2: Holographic Brackets ─────────────────── */
    const bracketGroup = new THREE.Group();
    scene.add(bracketGroup);
    const bracketGeo = new THREE.TorusGeometry(2, 0.02, 16, 4, Math.PI / 2);
    const bracketMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8 });
    
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(bracketGeo, bracketMat);
      b.rotation.z = (Math.PI / 2) * i;
      bracketGroup.add(b);
    }

    /* ── Layer 3: Data Swarm Particles ──────────────────── */
    const swarmCount = 200;
    const swarmPos = new Float32Array(swarmCount * 3);
    const swarmSizes = new Float32Array(swarmCount);
    for (let i = 0; i < swarmCount; i++) {
      const r = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      swarmPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      swarmPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      swarmPos[i * 3 + 2] = r * Math.cos(phi);
      swarmSizes[i] = Math.random();
    }
    const swarmGeo = new THREE.BufferGeometry();
    swarmGeo.setAttribute("position", new THREE.BufferAttribute(swarmPos, 3));
    const swarmMat = new THREE.PointsMaterial({ 
      color: 0x38bdf8, 
      size: 0.06, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending 
    });
    const swarm = new THREE.Points(swarmGeo, swarmMat);
    scene.add(swarm);

    /* ── Layer 4: Floating Scanning Rings ──────────────── */
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    for (let i = 0; i < 3; i++) {
      const rGeo = new THREE.TorusGeometry(1.2 + i * 0.5, 0.01, 8, 100);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      ringGroup.add(ring);
    }

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

      // Core pulse logic (Heartbeat)
      const heartbeat = Math.pow(Math.sin(t * 4), 2);
      const scale = 1 + heartbeat * 0.15;
      core.scale.setScalar(scale);
      coreMat.emissiveIntensity = 1 + heartbeat * 2;

      // Swarm turbulence
      const positions = swarm.geometry.attributes.position.array;
      for (let i = 0; i < swarmCount; i++) {
        positions[i * 3 + 1] += Math.sin(t + i) * 0.005;
      }
      swarm.geometry.attributes.position.needsUpdate = true;
      swarm.rotation.y = t * 0.1;

      // Rings & Brackets
      ringGroup.children.forEach((r, i) => {
        r.rotation.x += 0.01 * (i + 1);
        r.rotation.z += 0.005 * (i + 1);
      });
      bracketGroup.rotation.y = -t * 0.3;
      bracketGroup.rotation.z = Math.sin(t * 0.5) * 0.2;

      // Mouse Parallax (Interactive Tilt)
      scene.rotation.y += (mx * 0.5 - scene.rotation.y) * 0.05;
      scene.rotation.x += (-my * 0.5 - scene.rotation.x) * 0.05;

      // Overall floating motion
      scene.position.y = Math.sin(t * 2) * 0.1;

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
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "crosshair" }} />;
}
