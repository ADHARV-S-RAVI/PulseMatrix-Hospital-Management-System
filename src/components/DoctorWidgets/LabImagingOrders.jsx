import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getPatientLabs, requestLab, getPatientImaging, requestImaging } from "../../services/api";

export default function LabImagingOrders({ patient, doctorId }) {
  const [orders, setOrders] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      loadOrders();
    }
  }, [patient]);

  const loadOrders = async () => {
    try {
      const [labs, imaging] = await Promise.all([
        getPatientLabs(patient.patient_id),
        getPatientImaging(patient.patient_id)
      ]);
      
      const formattedLabs = (labs || []).map(l => ({
        id: `lab_${l.request_id}`,
        type: "Lab",
        name: l.test_name,
        status: l.status || "Pending",
        date: new Date(l.request_date).toLocaleString(),
        result: l.result || "Awaiting processing"
      }));

      const formattedImaging = (imaging || []).map(i => ({
        id: `img_${i.request_id}`,
        type: "Imaging",
        name: i.imaging_type,
        status: i.status || "Pending",
        date: new Date(i.request_date).toLocaleString(),
        result: i.result || "Awaiting Radiologist"
      }));

      // Merge and sort by date descending
      setOrders([...formattedLabs, ...formattedImaging].sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("Failed to load lab/imaging orders", err);
    }
  };

  const handleOrder = async () => {
    if (!selectedTest || selectedTest === "Select Type") return;
    setLoading(true);
    try {
      if (selectedTest.includes("X-Ray") || selectedTest.includes("CT") || selectedTest.includes("MRI")) {
        await requestImaging(patient.patient_id, { doctor_id: doctorId, imaging_type: selectedTest });
      } else {
        await requestLab(patient.patient_id, { doctor_id: doctorId, test_name: selectedTest });
      }
      setSelectedTest("");
      await loadOrders();
    } catch (err) {
      console.error("Failed to submit order", err);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-100 d-flex flex-column gap-3">
      <div className="glass-panel p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
        <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-file-medical text-warning me-2" />Order Diagnostics</h5>
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm bg-dark text-white border-secondary w-auto"
            value={selectedTest}
            onChange={e => setSelectedTest(e.target.value)}
          >
            <option>Select Type</option>
            <option>Blood Panel (CBC)</option>
            <option>Metabolic Panel</option>
            <option>Troponin / Cardiac</option>
            <option>Urinalysis</option>
            <option>Chest X-Ray</option>
            <option>CT Scan Head</option>
            <option>MRI Spine</option>
          </select>
          <button className="btn btn-sm btn-warning text-dark fw-bold px-4" onClick={handleOrder} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-plus-lg me-1" /> Order Test</>}
          </button>
        </div>
      </div>

      <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(15,23,42,0.6)" }}>
        <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-clipboard2-pulse text-info me-2" />Diagnostic Results</h5>
        <div className="d-flex flex-column gap-2">
          {orders.map(o => (
            <div key={o.id} className="p-3 rounded-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-white"><i className={`bi ${o.type === 'Imaging' ? 'bi-universal-access-circle' : 'bi-droplet'} me-2 text-primary`} />{o.name}</span>
                <span className={`badge ${o.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'} bg-opacity-25 border`}>{o.status}</span>
              </div>
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.75rem" }}>
                <span>Requested: {o.date}</span>
                <span className={o.status === 'Completed' ? 'text-white fw-bold' : ''}>{o.result}</span>
              </div>
              {o.status === 'Completed' && (
                <div className="mt-2 pt-2 border-top border-secondary border-opacity-50">
                  <button className="btn btn-sm px-3" style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)", fontSize: "0.7rem" }}>
                    <i className="bi bi-eye me-1" /> View Full Report
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
