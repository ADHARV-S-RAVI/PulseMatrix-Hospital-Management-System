/**
 * Charts.jsx – Fixed and stable Chart.js wrappers.
 *
 * Root cause of crash: passing _key inside the Chart config object
 * caused Chart.js to throw a validation error which propagated as
 * an unhandled exception and crashed the React tree.
 * Fix: strip _key before passing to Chart(), and use a separate
 * primitive dep array value for the useEffect.
 */
import { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController,
} from "chart.js";
import { useApp } from "../context/AppContext";

Chart.register(
  // Controllers (required for each chart type)
  BarController, LineController, PieController, DoughnutController,
  // Elements
  ArcElement, BarElement, LineElement, PointElement,
  // Scales
  CategoryScale, LinearScale,
  // Plugins
  Tooltip, Legend, Filler
);

/**
 * useChart – stable chart hook.
 * @param {React.RefObject}  canvasRef – ref to <canvas>
 * @param {object}           config    – Chart.js config (no _key)
 * @param {string}           depKey    – fingerprint string; chart re-creates only when this changes
 */
function useChart(canvasRef, config, depKey) {
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Destroy stale instance on the same canvas element
    const stale = Chart.getChart(canvas);
    if (stale) stale.destroy();
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    try {
      chartRef.current = new Chart(canvas, config);
    } catch (e) {
      console.error("Chart init error:", e);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]); // only re-run when data actually changes
}

/* ── Shared style constants ───────────────────────────────── */
const FONT = { family: "Inter", size: 12, weight: "500" };
const GRID = { color: "rgba(226,232,240,0.6)" };
const ANIM = { duration: 600 };

/* ─────────────────────────────────────────────────────────── */
/* 1. Severity Pie Chart                                        */
/* ─────────────────────────────────────────────────────────── */
export function SeverityChart({ labels: propLabels, data: propData }) {
  const { patients } = useApp();
  const ref = useRef(null);

  const active = patients.filter(p => p.status !== "Discharged");
  const c = { Critical: 0, Major: 0, Moderate: 0, Minor: 0 };
  active.forEach(p => { if (p.severity in c) c[p.severity]++; });
  
  const labels = propLabels || ["Critical", "Major", "Moderate", "Minor"];
  const data = propData || [c.Critical, c.Major, c.Moderate, c.Minor];
  const depKey = data.join(",");

  useChart(ref, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ["#f43f5e", "#f59e0b", "#0ea5e9", "#10b981"],
        borderWidth: 2,
        borderColor: "#fff",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: ANIM,
      plugins: {
        legend: { position: "right", labels: { font: FONT, boxWidth: 12 } },
      },
    },
  }, depKey);

  return <canvas ref={ref} />;
}

/* ─────────────────────────────────────────────────────────── */
/* 2. Department Bar Chart                                      */
/* ─────────────────────────────────────────────────────────── */
export function DepartmentChart({ labels: propLabels, data: propData }) {
  const { patients } = useApp();
  const ref = useRef(null);

  const depts = ["Cardiology", "Trauma", "Neurology", "Pediatrics", "General Surgery"];
  const active = patients.filter(p => p.status !== "Discharged");
  const fallbackData = depts.map(d => active.filter(p => p.department === d).length);
  
  const labels = propLabels || depts;
  const data = propData || fallbackData;
  const depKey = data.join(",");

  useChart(ref, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Active Patients",
        data,
        backgroundColor: ["#f43f5e", "#f59e0b", "#6366f1", "#10b981", "#0ea5e9"],
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: ANIM,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "Inter" } }, grid: GRID },
        x: { ticks: { font: { family: "Inter", weight: "500" } }, grid: { display: false } },
      },
    },
  }, depKey);

  return <canvas ref={ref} />;
}

/* ─────────────────────────────────────────────────────────── */
/* 3. Daily Admissions Line Chart                               */
/* ─────────────────────────────────────────────────────────── */
export function AdmissionsChart({ labels: propLabels, data: propData }) {
  const { admissions } = useApp();
  const ref = useRef(null);

  const labels = propLabels || Object.keys(admissions);
  const data = propData || Object.values(admissions);
  const depKey = data.join(",");

  useChart(ref, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Admissions",
        data,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.12)",
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: "#0ea5e9",
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: ANIM,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: GRID, ticks: { font: { family: "Inter" } } },
        x: { grid: { display: false }, ticks: { font: { family: "Inter" } } },
      },
    },
  }, depKey);

  return <canvas ref={ref} />;
}

/* ─────────────────────────────────────────────────────────── */
/* 4. Bed Occupancy Doughnut Chart                             */
/* ─────────────────────────────────────────────────────────── */
export function BedOccupancyChart() {
  const { beds } = useApp();
  const ref = useRef(null);

  const c = { Occupied: 0, Available: 0, Maintenance: 0 };
  beds.forEach(b => { if (b.status in c) c[b.status]++; });
  const data = [c.Occupied, c.Available, c.Maintenance];
  const depKey = data.join(",");

  useChart(ref, {
    type: "doughnut",
    data: {
      labels: ["Occupied", "Available", "Maintenance"],
      datasets: [{
        data,
        backgroundColor: ["#f43f5e", "#10b981", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#fff",
        cutout: "70%",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: ANIM,
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: FONT, padding: 15, boxWidth: 12 },
        },
      },
    },
  }, depKey);

  return <canvas ref={ref} />;
}
