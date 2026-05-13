const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",        icon: "bi-grid-1x2-fill",  category: "Main Operation" },
  { id: "registration", label: "Patient Ingest",   icon: "bi-person-plus-fill" },
  { id: "queue",        label: "Triage Queue",     icon: "bi-layers-fill" },
  { id: "management",   label: "Doctors & Beds",   icon: "bi-heart-pulse",    category: "Resource Allocation" },
];

export default function Sidebar({ active, onNavigate, onReset, onLogout, sidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <i className="bi bi-hospital" />
        <span>Pulse_Matrix</span>
      </div>

      {/* Nav */}
      <ul className="sidebar-menu">
        {NAV_ITEMS.map((item) => (
          <span key={item.id}>
            {item.category && (
              <li className="sidebar-menu-category">{item.category}</li>
            )}
            <li className="nav-item">
              <button
                className={`nav-link w-100 text-start border-0 ${active === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </button>
            </li>
          </span>
        ))}

        <li className="sidebar-menu-category mt-3">Maintenance</li>
        <li className="nav-item">
          <button
            className="nav-link w-100 text-start border-0 text-danger-nav"
            onClick={() => {
              if (window.confirm("Reset all simulation data to factory defaults?")) onReset();
            }}
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Reset Data Cache</span>
          </button>
        </li>

        <li className="sidebar-menu-category mt-3">Session</li>
        <li className="nav-item">
          <button
            className="nav-link w-100 text-start border-0 text-warning"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right" />
            <span>Signout</span>
          </button>
        </li>
      </ul>

      {/* Footer badge */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-badge">
          <i className="bi bi-shield-check me-1" /> Firebase Engine Sync
        </span>
      </div>
    </aside>
  );
}
