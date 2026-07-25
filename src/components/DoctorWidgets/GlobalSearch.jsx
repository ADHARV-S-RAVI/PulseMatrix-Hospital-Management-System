export default function GlobalSearch() {
  return (
    <div className="position-relative" style={{ width: 250 }}>
      <i className="bi bi-search position-absolute text-muted" style={{ left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem" }}></i>
      <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary" placeholder="Search patients, tests... (Ctrl+K)" style={{ paddingLeft: 32, borderRadius: 20 }} />
    </div>
  );
}
