import { useState, useEffect } from "react";
import { 
  getDashboardSummary, 
  getSeverityDistribution, 
  getDepartmentDistribution, 
  getAdmissionTrends, 
  getPatients 
} from "../services/api";
import { SeverityChart, DepartmentChart, AdmissionsChart, BedOccupancyChart } from "../components/Charts";

const SEVERITY_CLS = {
  Critical: "severity-critical",
  High:     "severity-major",
  Medium:   "severity-moderate",
  Low:      "severity-minor",
};

const STATUS_CLS = {
  "Newly Admitted":  "bg-primary",
  "In Treatment":    "bg-success",
  "Awaiting Scans":  "bg-warning text-dark",
  Stable:            "bg-info text-dark",
  Recovering:        "bg-secondary",
  "Discharge Ready": "bg-dark",
};

export default function Dashboard({ onNavigate }) {
  const [active, setActive] = useState([]);
  const [metricsData, setMetricsData] = useState({
    totalPatients: 0,
    criticalCases: 0,
    bedRate: 0,
    occupiedBeds: 0,
    totalBeds: 0,
    availableDoctors: 0,
  });
  const [chartData, setChartData] = useState({
    severity: { labels: [], values: [] },
    department: { labels: [], values: [] },
    trends: { labels: [], values: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summary, sevDist, deptDist, trends, pats] = await Promise.all([
          getDashboardSummary(),
          getSeverityDistribution(),
          getDepartmentDistribution(),
          getAdmissionTrends(),
          getPatients()
        ]);

        setMetricsData({
          totalPatients: summary.total_patients || 0,
          criticalCases: summary.critical_patients || 0,
          bedRate: summary.total_beds ? Math.round((summary.total_beds - summary.available_beds) / summary.total_beds * 100) : 0,
          occupiedBeds: summary.total_beds - summary.available_beds || 0,
          totalBeds: summary.total_beds || 0,
          availableDoctors: summary.available_doctors || 0,
        });

        setChartData({
          severity: sevDist,
          department: deptDist,
          trends: trends
        });

        const mappedPats = pats.map(p => {
          let sev = "Low";
          if (p.severity_score >= 85) sev = "Critical";
          else if (p.severity_score >= 60) sev = "High";
          else if (p.severity_score >= 35) sev = "Medium";
          
          return {
             id: `PT-${p.patient_id}`,
             name: p.name,
             severity: sev,
             department: p.department,
             status: "In Treatment",
             assignedBed: null
          };
        });
        setActive(mappedPats);
      } catch (err) {
        console.error("Dashboard data error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  const metrics = [
    { title: "Total Active Patients",  value: metricsData.totalPatients, icon: "bi-people",       cls: "metric-primary",  footer: "Admitted across departments" },
    { title: "Critical Cases",         value: metricsData.criticalCases, icon: "bi-heart-pulse",  cls: "metric-accent",   footer: "Requires urgent response" },
    { title: "Bed Occupancy Rate",     value: `${metricsData.bedRate}%`, icon: "bi-hospital",     cls: "metric-warning",  footer: `${metricsData.occupiedBeds} of ${metricsData.totalBeds} beds occupied` },
    { title: "Available Doctors",      value: metricsData.availableDoctors, icon: "bi-person-check", cls: "metric-success",  footer: `${metricsData.availableDoctors} responders ready` },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 pb-2 border-bottom gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Emergency Operations Dashboard</h2>
          <p className="text-muted small mb-0">Real-time hospital overview, severity metrics & resource analytics.</p>
        </div>
        <button className="btn btn-primary-gradient" onClick={() => onNavigate("registration")}>
          <i className="bi bi-plus-lg me-1" /> New Patient Ingest
        </button>
      </div>

      {/* Metric Cards */}
      <div className="row g-4 mb-4">
        {metrics.map((m, i) => (
          <div key={i} className="col-sm-6 col-xl-3">
            <div className={`metric-card ${m.cls}`}>
              <div>
                <div className="metric-header">
                  <span className="metric-title">{m.title}</span>
                  <div className="metric-icon"><i className={`bi ${m.icon}`} /></div>
                </div>
                <div className="metric-value">{m.value}</div>
              </div>
              <div className="metric-footer">
                <i className="bi bi-bar-chart-fill" />
                <span>{m.footer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-4 mb-4">
        <div className="col-lg-5 col-xl-4">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Severity Analysis</h3>
              <span className="badge bg-light text-dark border">Pie Chart</span>
            </div>
            <p className="text-muted small mb-3">Distribution of triage priority scores.</p>
            <div style={{ height: 280 }}>
              <SeverityChart labels={chartData.severity.labels} data={chartData.severity.values} />
            </div>
          </div>
        </div>
        <div className="col-lg-7 col-xl-8">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Department Admissions Load</h3>
              <span className="badge bg-light text-dark border">Bar Graph</span>
            </div>
            <p className="text-muted small mb-3">Active headcount per clinical division.</p>
            <div style={{ height: 280 }}>
              <DepartmentChart labels={chartData.department.labels} data={chartData.department.values} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7 col-xl-8">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Daily Admissions Trend</h3>
              <span className="badge bg-light text-dark border">Line Chart</span>
            </div>
            <p className="text-muted small mb-3">7-day emergency floor inflow volume.</p>
            <div style={{ height: 310 }}>
              <AdmissionsChart labels={chartData.trends.labels} data={chartData.trends.values} />
            </div>
          </div>
        </div>
        <div className="col-lg-5 col-xl-4">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Bed Occupancy Inventory</h3>
              <span className="badge bg-light text-dark border">Doughnut Chart</span>
            </div>
            <p className="text-muted small mb-3">Real-time bed status proportions.</p>
            <div style={{ height: 310 }}><BedOccupancyChart /></div>
          </div>
        </div>
      </div>

      {/* Recent Ingest Table */}
      <div className="glass-panel p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="fs-6 fw-bold mb-0">Recent Ingest Flow</h3>
            <p className="text-muted small mb-0">Preview of latest emergency patient intakes.</p>
          </div>
          <button className="btn btn-sm btn-link fw-semibold text-decoration-none p-0" onClick={() => onNavigate("queue")}>
            View Full Queue <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
        <div className="table-responsive">
          <table className="premium-table w-100">
            <thead>
              <tr>
                {["Case ID","Patient","Severity","Department","Bed","Status"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ?
                <tr><td colSpan={6} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" /> Loading recent ingest...</td></tr>
                : active.length === 0
                ? <tr><td colSpan={6} className="text-center text-muted py-4">No active emergency cases.</td></tr>
                : active.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.id}</strong></td>
                      <td>{p.name}</td>
                      <td><span className={`badge-severity ${SEVERITY_CLS[p.severity]}`}>{p.severity}</span></td>
                      <td>{p.department}</td>
                      <td><span className="badge bg-light text-dark border">{p.assignedBed || "—"}</span></td>
                      <td><span className={`badge ${STATUS_CLS[p.status] || "bg-light text-dark border"}`}>{p.status}</span></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
