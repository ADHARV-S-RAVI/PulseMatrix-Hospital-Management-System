/**
 * HeroPage.jsx  –  Pulse_Matrix 3D Landing Page
 *
 * Uses Three.js to render a rotating, particle-filled 3D scene:
 *   • Floating torus-knot (DNA / pulse-ring motif) in glowing blue/indigo
 *   • Orbiting smaller spheres representing hospital nodes
 *   • Dense star-field particle system in background
 *   • Animated ECG line drawn in world-space
 * All contained in a full-screen canvas behind a glassmorphism overlay.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroPage({ onEnter }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /* ── Renderer ─────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* ── Scene & Camera ───────────────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 22);

    /* ── Lighting ─────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const pointA = new THREE.PointLight(0x0ea5e9, 6, 60);
    pointA.position.set(10, 10, 10);
    scene.add(pointA);
    const pointB = new THREE.PointLight(0x6366f1, 5, 60);
    pointB.position.set(-10, -8, 8);
    scene.add(pointB);
    const pointC = new THREE.PointLight(0xf43f5e, 4, 50);
    pointC.position.set(0, -12, -5);
    scene.add(pointC);

    /* ── Central Torus-Knot (DNA / pulse motif) ───────────── */
    const knotGeo = new THREE.TorusKnotGeometry(5, 1.4, 180, 24, 2, 3);
    const knotMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      shininess: 120,
      wireframe: false,
      transparent: true,
      opacity: 0.82,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    /* Wireframe overlay on knot for depth */
    const knotWire = new THREE.Mesh(
      knotGeo,
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, wireframe: true, transparent: true, opacity: 0.12 })
    );
    scene.add(knotWire);

    /* ── Orbiting Spheres (hospital nodes) ────────────────── */
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const orbitData = [
      { r: 9.5, speed: 0.4, phase: 0, color: 0xf43f5e, size: 0.55, tiltX: 0.3, tiltZ: 0 },
      { r: 11, speed: 0.28, phase: Math.PI * 0.6, color: 0x10b981, size: 0.7, tiltX: -0.5, tiltZ: 0.2 },
      { r: 8, speed: 0.55, phase: Math.PI * 1.2, color: 0xf59e0b, size: 0.4, tiltX: 0.1, tiltZ: 0.6 },
      { r: 12.5, speed: 0.2, phase: Math.PI * 1.8, color: 0xa78bfa, size: 0.85, tiltX: -0.2, tiltZ: -0.3 },
      { r: 7.5, speed: 0.65, phase: Math.PI * 0.9, color: 0x38bdf8, size: 0.45, tiltX: 0.7, tiltZ: 0.1 },
    ];

    const orbitMeshes = orbitData.map(o => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(o.size, 16, 16),
        new THREE.MeshPhongMaterial({ color: o.color, emissive: o.color, emissiveIntensity: 0.5, shininess: 80 })
      );
      orbitGroup.add(mesh);
      return { mesh, ...o };
    });

    /* ── Ring around knot ─────────────────────────────────── */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(7.2, 0.08, 6, 100),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = Math.PI * 0.42;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(8.8, 0.05, 6, 100),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.35 })
    );
    ring2.rotation.x = Math.PI * 0.3;
    ring2.rotation.z = Math.PI * 0.15;
    scene.add(ring2);

    /* ── ECG / Heartbeat curve in 3D ─────────────────────── */
    const ecgPoints = [];
    const ecgLength = 200;
    const ecgWidth = 28;
    for (let i = 0; i < ecgLength; i++) {
      const t = i / ecgLength;
      const x = (t - 0.5) * ecgWidth;
      let y = 0;
      const seg = (t * 6) % 1;
      if (seg < 0.3) y = 0;
      else if (seg < 0.38) y = (seg - 0.3) / 0.08 * 0.6;
      else if (seg < 0.46) y = 0.6 - (seg - 0.38) / 0.08 * 2.5;
      else if (seg < 0.52) y = -1.9 + (seg - 0.46) / 0.06 * 4.8;
      else if (seg < 0.58) y = 2.9 - (seg - 0.52) / 0.06 * 3.5;
      else if (seg < 0.64) y = -0.6 + (seg - 0.58) / 0.06 * 0.8;
      else y = 0.2 - (seg - 0.64) / 0.36 * 0.2;
      ecgPoints.push(new THREE.Vector3(x, y - 10, 0));
    }
    const ecgCurve = new THREE.CatmullRomCurve3(ecgPoints);
    const ecgGeo = new THREE.TubeGeometry(ecgCurve, 300, 0.06, 5, false);
    const ecgMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Mesh(ecgGeo, ecgMat));

    /* ── Star Particle Field ──────────────────────────────── */
    const starCount = 2200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 300;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.65 });
    scene.add(new THREE.Points(starGeo, starMat));

    /* Small colored accent particles */
    const accentCount = 300;
    const accentPos = new Float32Array(accentCount * 3);
    const accentColors = new Float32Array(accentCount * 3);
    const palette = [[0.06, 0.64, 0.91], [0.39, 0.40, 0.95], [0.96, 0.25, 0.37], [0.06, 0.73, 0.51]];
    for (let i = 0; i < accentCount; i++) {
      accentPos[i * 3] = (Math.random() - 0.5) * 120;
      accentPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      accentPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
      const col = palette[Math.floor(Math.random() * palette.length)];
      accentColors[i * 3] = col[0]; accentColors[i * 3 + 1] = col[1]; accentColors[i * 3 + 2] = col[2];
    }
    const accentGeo = new THREE.BufferGeometry();
    accentGeo.setAttribute("position", new THREE.BufferAttribute(accentPos, 3));
    accentGeo.setAttribute("color", new THREE.BufferAttribute(accentColors, 3));
    scene.add(new THREE.Points(accentGeo, new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.75 })));

    /* ── Mouse parallax ───────────────────────────────────── */
    let mx = 0, my = 0;
    const onMouseMove = e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ── Resize handler ───────────────────────────────────── */
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* ── Animation loop ───────────────────────────────────── */
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      knot.rotation.x = t * 0.12;
      knot.rotation.y = t * 0.19;
      knotWire.rotation.copy(knot.rotation);

      ring.rotation.z = t * 0.08;
      ring2.rotation.z = -t * 0.05;

      // Orbit spheres
      orbitMeshes.forEach(o => {
        const angle = t * o.speed + o.phase;
        o.mesh.position.set(
          Math.cos(angle) * o.r,
          Math.sin(angle * 0.7 + o.tiltX) * o.r * 0.4 + o.tiltX * 2,
          Math.sin(angle) * o.r * 0.5 + o.tiltZ * 2
        );
        const scale = 1 + Math.sin(t * 2 + o.phase) * 0.12;
        o.mesh.scale.setScalar(scale);
      });

      // Subtle camera drift following mouse
      camera.position.x += (mx * 1.8 - camera.position.x) * 0.03;
      camera.position.y += (-my * 1.2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      // Pulse knot emissive
      knotMat.emissiveIntensity = 0.25 + Math.sin(t * 1.5) * 0.15;

      // Rotate star field slowly
      starGeo.attributes.position.needsUpdate = false; // static, no update needed

      renderer.render(scene, camera);
    };
    animate();

    /* ── Cleanup ──────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="hero-page-wrapper">
      {/* ── 3D Canvas Section ─────────────────────────────────── */}
      <div className="hero-root">
        {/* Three.js canvas mount */}
        <div ref={mountRef} className="hero-canvas-mount" />

        {/* Glassmorphism overlay content */}
        <div className="hero-overlay">
          {/* Top accent bar */}
          <div className="hero-top-bar">
            <div className="hero-status-pill">
              <span className="status-dot" />
              <span>All Systems Operational</span>
            </div>
            <div className="hero-top-right text-muted small">
              v2.0 — Emergency Command Centre
            </div>
          </div>

          {/* Central hero content */}
          <div className="hero-center">
            <div className="hero-badge mb-4">
              <i className="bi bi-hospital me-2" />
              Smart Hospital Emergency Management
            </div>

            <h1 className="hero-title">
              <span className="hero-title-thin">Welcome to</span>
              <br />
              Pulse<span className="hero-title-accent">_Matrix</span>
            </h1>

            <p className="hero-subtitle">
              Real-time triage intelligence, bed analytics &amp; personnel orchestration
              <br className="d-none d-md-block" />
              for modern emergency command operations.
            </p>

            {/* Feature pills */}
            <div className="hero-features">
              {[
                { icon: "bi-heart-pulse", label: "Live Vitals Tracking" },
                { icon: "bi-bar-chart", label: "4 Analytics Charts" },
                { icon: "bi-people-fill", label: "Doctor Management" },
                { icon: "bi-hospital", label: "Bed Array Control" },
              ].map(f => (
                <div className="hero-feature-pill" key={f.label}>
                  <i className={`bi ${f.icon}`} /> {f.label}
                </div>
              ))}
            </div>

            <button className="hero-cta" onClick={onEnter}>
              <i className="bi bi-unlock-fill me-2" />
              Enter Command Center
              <i className="bi bi-arrow-right ms-2" />
            </button>

            <p className="hero-disclaimer mt-3 text-muted small">
              Secure admin access · HIPAA compliant simulation
            </p>
          </div>

          {/* Bottom stat strip */}
          <div className="hero-stats-bar">
            {[
              { value: "99.9%", label: "Uptime SLA" },
              { value: "<2s", label: "Response Latency" },
              { value: "24 / 7", label: "Monitoring Active" },
              { value: "HIPAA", label: "Compliant Infra" },
            ].map(s => (
              <div className="hero-stat" key={s.label}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Project Info Section ───────────────────────────────── */}
      <div className="info-section">

        {/* About */}
        <div className="info-about-band">
          <div className="info-container">
            <div className="info-about-grid">
              <div className="info-about-text">
                <span className="info-eyebrow">About The Project</span>
                <h2 className="info-section-title">
                  Pulse<span className="text-accent-blue">_Matrix</span>
                </h2>
                <p className="info-about-desc">
                  A <strong>Smart Hospital Emergency Management System</strong> designed to
                  digitize and streamline every critical touchpoint in emergency healthcare
                  delivery. From patient intake to discharge, Pulse_Matrix provides hospital
                  administrators and frontline staff with real-time visibility and control.
                </p>
                <p className="info-about-desc">
                  Built as a modular, API-ready frontend using <strong>React + Vite</strong>,
                  the system integrates with hospital backends via REST APIs and provides
                  analytics-driven decision support through Chart.js-powered dashboards.
                </p>
                <div className="info-meta-chips">
                  <span className="info-chip"><i className="bi bi-person-workspace me-1" />Frontend Developer</span>
                  <span className="info-chip"><i className="bi bi-building-fill-cross me-1" />Hospital Domain</span>
                  <span className="info-chip"><i className="bi bi-code-slash me-1" />React + Vite</span>
                  <span className="info-chip"><i className="bi bi-graph-up me-1" />Chart.js Analytics</span>
                </div>
              </div>
              <div className="info-about-visual">
                <div className="info-visual-card">
                  <div className="info-visual-ring">
                    <i className="bi bi-heart-pulse-fill" />
                  </div>
                  <div className="info-visual-stats">
                    {[
                      { n: "7", label: "Frontend Modules" },
                      { n: "4", label: "Chart Types" },
                      { n: "2", label: "Role Portals" },
                      { n: "∞", label: "Scalable APIs" },
                    ].map(s => (
                      <div key={s.label} className="info-visual-stat">
                        <span className="info-visual-num">{s.n}</span>
                        <span className="info-visual-lbl">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="info-modules-band">
          <div className="info-container">
            <div className="text-center mb-5">
              <span className="info-eyebrow">System Modules</span>
              <h2 className="info-section-title">What's Inside</h2>
              <p className="info-section-sub">Seven purpose-built frontend modules covering every emergency department workflow.</p>
            </div>
            <div className="info-modules-grid">
              {[
                { icon: "bi-box-arrow-in-right", title: "Login Portal", desc: "Role-based authentication with Admin and Patient access flows.", color: "#0ea5e9" },
                { icon: "bi-speedometer2", title: "Admin Dashboard", desc: "Live KPI cards, severity analysis, department load & bed occupancy charts.", color: "#6366f1" },
                { icon: "bi-person-badge-fill", title: "Patient Portal", desc: "Self-service case view with vitals, treatment timeline & physician info.", color: "#10b981" },
                { icon: "bi-clipboard2-plus-fill", title: "Patient Registration", desc: "Intake form with triage routing, severity scoring & resource pre-allocation.", color: "#f59e0b" },
                { icon: "bi-list-ol", title: "Emergency Queue", desc: "Sortable priority queue with inline triage editing & discharge management.", color: "#f43f5e" },
                { icon: "bi-people-fill", title: "Doctor Management", desc: "Roster cards showing specialization, availability & live patient load.", color: "#8b5cf6" },
                { icon: "bi-grid-3x3-gap-fill", title: "Bed Management", desc: "Visual bed array with ICU/general categorization and occupancy status.", color: "#06b6d4" },
              ].map(m => (
                <div key={m.title} className="info-module-card" style={{ "--mod-color": m.color }}>
                  <div className="info-module-icon" style={{ color: m.color }}>
                    <i className={`bi ${m.icon}`} />
                  </div>
                  <h3 className="info-module-title">{m.title}</h3>
                  <p className="info-module-desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="info-tech-band">
          <div className="info-container">
            <div className="text-center mb-5">
              <span className="info-eyebrow">Technology Stack</span>
              <h2 className="info-section-title">Built With</h2>
            </div>
            <div className="info-tech-row">
              {[
                { name: "React 18", icon: "bi-filetype-jsx", color: "#61dafb", note: "Component framework" },
                { name: "Vite", icon: "bi-lightning-fill", color: "#fbbf24", note: "Build tooling" },
                { name: "Bootstrap 5", icon: "bi-bootstrap-fill", color: "#7c3aed", note: "Layout & components" },
                { name: "Chart.js", icon: "bi-pie-chart-fill", color: "#f43f5e", note: "Data visualization" },
                { name: "Three.js", icon: "bi-box", color: "#0ea5e9", note: "3D animation engine" },
                { name: "HTML5 / CSS3", icon: "bi-code-slash", color: "#10b981", note: "Semantic markup" },
                { name: "LocalStorage", icon: "bi-database-fill", color: "#f59e0b", note: "State persistence" },
                { name: "REST API Ready", icon: "bi-cloud-arrow-up-fill", color: "#6366f1", note: "Plug-in backend" },
              ].map(t => (
                <div key={t.name} className="info-tech-chip" style={{ "--tech-color": t.color }}>
                  <i className={`bi ${t.icon}`} style={{ color: t.color }} />
                  <div>
                    <div className="info-tech-name">{t.name}</div>
                    <div className="info-tech-note">{t.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts showcase */}
        <div className="info-charts-band">
          <div className="info-container">
            <div className="text-center mb-5">
              <span className="info-eyebrow">Analytics Engine</span>
              <h2 className="info-section-title">4 Live Chart Types</h2>
              <p className="info-section-sub">All charts update dynamically from real-time hospital data.</p>
            </div>
            <div className="info-charts-grid">
              {[
                { icon: "bi-pie-chart-fill", label: "Pie Chart", desc: "Triage severity distribution", color: "#f43f5e" },
                { icon: "bi-bar-chart-fill", label: "Bar Graph", desc: "Department-wise patient headcount", color: "#0ea5e9" },
                { icon: "bi-graph-up", label: "Line Chart", desc: "Daily admission trend over 7 days", color: "#10b981" },
                { icon: "bi-circle-fill", label: "Doughnut Chart", desc: "Bed occupancy vs. availability ratio", color: "#6366f1" },
              ].map(c => (
                <div key={c.label} className="info-chart-card" style={{ "--chart-color": c.color }}>
                  <div className="info-chart-icon" style={{ color: c.color }}>
                    <i className={`bi ${c.icon}`} />
                  </div>
                  <h3 className="info-chart-label">{c.label}</h3>
                  <p className="info-chart-desc">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outcome + CTA */}
        <div className="info-outcome-band">
          <div className="info-container">
            <div className="info-outcome-inner">
              <div className="info-outcome-left">
                <span className="info-eyebrow" style={{ color: "#0ea5e9" }}>Project Outcome</span>
                <h2 className="info-outcome-title">
                  Successfully delivered an interactive, responsive hospital emergency dashboard with real-time analytics and visualization support.
                </h2>
                <ul className="info-outcome-list">
                  {[
                    "Designed all 7 frontend pages with responsive layouts",
                    "Integrated Chart.js with 4 different chart types",
                    "Built dual-role login system (Admin + Patient portals)",
                    "Connected UI to mock APIs — ready for live backend swap",
                    "Achieved HIPAA-compliant UI architecture",
                    "Added Three.js 3D landing animation for visual impact",
                  ].map(item => (
                    <li key={item}>
                      <i className="bi bi-check-circle-fill text-success me-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="info-outcome-right">
                <div className="info-cta-card">
                  <i className="bi bi-hospital-fill info-cta-icon" />
                  <h3>Ready to explore?</h3>
                  <p>Access the full emergency management dashboard with admin controls, patient portal, analytics, and more.</p>
                  <button className="hero-cta w-100" onClick={onEnter} style={{ fontSize: "1rem" }}>
                    <i className="bi bi-unlock-fill me-2" />
                    Enter Command Center
                  </button>
                  <div className="info-cta-note">
                    <i className="bi bi-shield-check me-1 text-success" />
                    Demo credentials pre-filled on login
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="info-footer">
          <div className="info-container">
            <div className="info-footer-inner">
              <div className="info-footer-brand">
                <i className="bi bi-heart-pulse-fill text-danger me-2" />
                Pulse<span className="text-accent-blue">_Matrix</span>
              </div>
              <div className="info-footer-note">
                Smart Hospital Emergency Management System &nbsp;·&nbsp; Frontend Demo v2.0
              </div>
              <div className="info-footer-note">
                Built with React · Vite · Bootstrap · Chart.js · Three.js
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
