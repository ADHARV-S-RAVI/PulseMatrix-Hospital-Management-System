/**
 * Charts.jsx – Premium Minimalist Animated Charts (Apple / Tesla Style)
 * Professional motion INSIDE the charts. No external particles or 3D backgrounds.
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
  BarController, LineController, PieController, DoughnutController,
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
);

// Subtle Inner Glow Plugin
const neonGlowPlugin = {
  id: 'neonGlow',
  beforeDatasetDraw(chart, args, options) {
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = options.glowColor || 'rgba(14, 165, 233, 0.4)';
    ctx.shadowBlur = options.blur || 10; // Kept subtle
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4; // Adds a slight depth effect
  },
  afterDatasetDraw(chart) {
    chart.ctx.restore();
  }
};
Chart.register(neonGlowPlugin);

function useChart(canvasRef, config, depKey) {
  const chartRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stale = Chart.getChart(canvas);
    if (stale) stale.destroy();
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    try {
      chartRef.current = new Chart(canvas, config);
    } catch (e) { console.error("Chart init error:", e); }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [depKey]);
  return chartRef;
}

const isDark = () => document.body.classList.contains("theme-dark");
const getTextColor = () => isDark() ? "#94a3b8" : "#64748b";
const getGridColor = () => "rgba(148, 163, 184, 0.1)"; // Clean subtle grid
const GRID = () => ({ color: getGridColor(), drawBorder: false, borderDash: [4, 4] });

const COLORS = {
  red: "#f43f5e",
  orange: "#f59e0b",
  blue: "#0ea5e9",
  green: "#10b981",
  purple: "#8b5cf6",
  cyan: "#06b6d4"
};

// Common minimal tooltip
const TOOLTIP_OPTIONS = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  titleColor: "#f8fafc",
  bodyColor: "#cbd5e1",
  borderColor: "rgba(255,255,255,0.1)",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 8,
  titleFont: { family: "Outfit", size: 14, weight: "bold" },
  bodyFont: { family: "Outfit", size: 13 },
  displayColors: true,
  boxPadding: 4,
  usePointStyle: true
};

/* 1. Severity Pie Chart - Smooth Segment Rotation */
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
        backgroundColor: [COLORS.red, COLORS.orange, COLORS.blue, COLORS.green],
        borderWidth: 2,
        borderColor: "rgba(15, 23, 42, 1)",
        hoverOffset: 12, // Smooth expansion on hover
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { animateRotate: true, animateScale: true, duration: 1500, easing: "easeOutQuart" },
      layout: { padding: 15 },
      plugins: {
        neonGlow: { glowColor: 'rgba(0,0,0,0.3)', blur: 15 },
        legend: { display: false },
        tooltip: TOOLTIP_OPTIONS
      },
    },
  }, depKey);

  return (
    <div style={{ width: "100%", height: "100%", animation: "fadeUp 0.8s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
      <canvas ref={ref} />
      <style>{`@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

/* 2. Department Bar Chart - Clean Gradient Fill & Growth */
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
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return COLORS.blue;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          const bgColors = [COLORS.red, COLORS.orange, COLORS.purple, COLORS.green, COLORS.cyan];
          const color = bgColors[context.dataIndex % bgColors.length];
          gradient.addColorStop(0, "rgba(15,23,42,0.1)");
          gradient.addColorStop(1, color);
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
        hoverBackgroundColor: "#fff" // Smooth highlight
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: {
        duration: 1500, easing: 'easeOutQuart',
        delay: (ctx) => ctx.dataIndex * 100 // Staggered entry
      },
      plugins: { 
        legend: { display: false },
        neonGlow: { blur: 10 },
        tooltip: TOOLTIP_OPTIONS
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, color: getTextColor() }, grid: GRID() },
        x: { ticks: { color: getTextColor() }, grid: { display: false } },
      },
    },
  }, depKey);

  return (
    <div style={{ width: "100%", height: "100%", animation: "fadeUp 0.8s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
      <canvas ref={ref} />
    </div>
  );
}

/* 3. Daily Admissions Line Chart - Progressive Tension Draw */
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
      datasets: [
        {
          label: "Admissions",
          data,
          borderColor: COLORS.cyan,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return "transparent";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(6, 182, 212, 0.4)");
            gradient.addColorStop(1, "rgba(6, 182, 212, 0.0)");
            return gradient;
          },
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: COLORS.cyan,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: COLORS.cyan,
        }
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: {
        x: { type: 'number', easing: 'linear', duration: 1000, from: NaN, delay: (ctx) => ctx.index * 100 },
        y: { type: 'number', easing: 'easeOutQuart', duration: 1000, from: (ctx) => ctx.chart.scales.y.getPixelForValue(0), delay: (ctx) => ctx.index * 100 },
        // Subtle tension flow effect inside the line itself
        tension: { duration: 3000, easing: 'easeInOutSine', from: 0.5, to: 0.3, loop: true }
      },
      plugins: { 
        legend: { display: false },
        neonGlow: { glowColor: 'rgba(6, 182, 212, 0.3)', blur: 15 },
        tooltip: TOOLTIP_OPTIONS
      },
      scales: {
        y: { beginAtZero: true, grid: GRID(), ticks: { color: getTextColor() } },
        x: { grid: { display: false }, ticks: { color: getTextColor() } },
      },
    },
  }, depKey);

  return (
    <div style={{ width: "100%", height: "100%", animation: "fadeUp 0.8s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
      <canvas ref={ref} />
    </div>
  );
}

/* 4. Bed Occupancy Doughnut - Clean Interactive Hover */
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
        backgroundColor: [COLORS.red, COLORS.green, COLORS.orange],
        borderWidth: 2,
        borderColor: "rgba(15, 23, 42, 1)",
        hoverBorderWidth: 0,
        cutout: "80%",
        hoverOffset: 12
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { animateRotate: true, animateScale: true, duration: 1500, easing: "easeOutQuart" },
      layout: { padding: 10 },
      plugins: {
        neonGlow: { glowColor: 'rgba(0,0,0,0.2)', blur: 15 },
        legend: { display: false },
        tooltip: TOOLTIP_OPTIONS
      },
    },
  }, depKey);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", animation: "fadeUp 0.8s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
       {/* Minimal Inner Title */}
       <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
         <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc" }}>{beds.length}</div>
         <div style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Total</div>
       </div>
       <canvas ref={ref} style={{ position: "relative", zIndex: 1 }} />
    </div>
  );
}

/* 5. Patient Vitals Trend - Smooth Minimal Data Stream */
export function PatientVitalsChart({ color }) {
  const ref = useRef(null);
  const data = [72, 75, 78, 74, 82, 88, 85, 79];
  const labels = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const depKey = "patient-vitals";
  const primaryColor = color || COLORS.blue;

  useChart(ref, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Heart Rate (BPM)",
          data,
          borderColor: primaryColor,
          backgroundColor: "transparent",
          fill: false,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: primaryColor,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: primaryColor,
          pointHoverBorderColor: "#fff",
        }
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: {
        x: { type: 'number', easing: 'linear', duration: 1000, from: NaN, delay: (ctx) => ctx.index * 80 },
        y: { type: 'number', easing: 'easeOutQuart', duration: 1000, from: (ctx) => ctx.chart.scales.y.getPixelForValue(60), delay: (ctx) => ctx.index * 80 },
        // Smooth line breathing loop
        tension: { duration: 2500, easing: 'easeInOutSine', from: 0.5, to: 0.35, loop: true }
      },
      plugins: { 
        legend: { display: false },
        neonGlow: { glowColor: 'rgba(0,0,0,0.1)', blur: 10 },
        tooltip: TOOLTIP_OPTIONS
      },
      scales: {
        y: { beginAtZero: false, suggestedMin: 60, suggestedMax: 100, grid: GRID(), ticks: { color: getTextColor() } },
        x: { grid: { display: false }, ticks: { color: getTextColor() } },
      },
    },
  }, depKey);

  return (
    <div style={{ width: "100%", height: "100%", animation: "fadeUp 0.8s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
      <canvas ref={ref} />
    </div>
  );
}

/* 6. Oxygen Saturation (SpO2) Chart */
export function OxygenChart({ color }) {
  const ref = useRef(null);
  const data = [94, 95, 96, 95, 98, 99, 98, 99];
  const labels = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const primaryColor = color || COLORS.green;

  useChart(ref, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "SpO2 (%)",
          data,
          borderColor: primaryColor,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return "transparent";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
            gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
            return gradient;
          },
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: primaryColor,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 8,
        }
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: {
        x: { type: 'number', easing: 'linear', duration: 1000, from: NaN, delay: (ctx) => ctx.index * 80 },
        y: { type: 'number', easing: 'easeOutQuart', duration: 1000, from: (ctx) => ctx.chart.scales.y.getPixelForValue(90), delay: (ctx) => ctx.index * 80 },
        tension: { duration: 2500, easing: 'easeInOutSine', from: 0.5, to: 0.35, loop: true }
      },
      plugins: { 
        legend: { display: false },
        neonGlow: { glowColor: 'rgba(0,0,0,0.1)', blur: 10 },
        tooltip: TOOLTIP_OPTIONS
      },
      scales: {
        y: { beginAtZero: false, suggestedMin: 90, suggestedMax: 100, grid: GRID(), ticks: { color: getTextColor() } },
        x: { grid: { display: false }, ticks: { color: getTextColor() } },
      },
    },
  }, "oxygen-chart");

  return (
    <div style={{ width: "100%", height: "100%", animation: "fadeUp 0.8s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
      <canvas ref={ref} />
    </div>
  );
}

/* 7. Pain Level Chart */
export function PainLevelChart({ color }) {
  const ref = useRef(null);
  const data = [7, 6, 8, 5, 4, 3, 2, 2];
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Today"];
  const primaryColor = color || COLORS.orange;

  useChart(ref, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Pain Level",
          data,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return primaryColor;
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, "rgba(245, 158, 11, 0.1)");
            gradient.addColorStop(1, primaryColor);
            return gradient;
          },
          borderRadius: 6,
          barPercentage: 0.6,
        }
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 1500, easing: 'easeOutQuart', delay: (ctx) => ctx.dataIndex * 100 },
      plugins: { 
        legend: { display: false },
        neonGlow: { blur: 10 },
        tooltip: TOOLTIP_OPTIONS
      },
      scales: {
        y: { beginAtZero: true, suggestedMax: 10, ticks: { stepSize: 2, color: getTextColor() }, grid: GRID() },
        x: { grid: { display: false }, ticks: { color: getTextColor() } },
      },
    },
  }, "pain-chart");

  return (
    <div style={{ width: "100%", height: "100%", animation: "fadeUp 0.8s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
      <canvas ref={ref} />
    </div>
  );
}
