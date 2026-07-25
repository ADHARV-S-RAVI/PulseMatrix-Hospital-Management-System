import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getPatientPrescriptions, addPatientPrescription } from "../../services/api";

export default function PrescriptionManager({ patient, doctorId }) {
  const [meds, setMeds] = useState([]);
  const [newMed, setNewMed] = useState({ name: "", dose: "", frequency: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      loadMeds();
    }
  }, [patient]);

  const loadMeds = async () => {
    try {
      const data = await getPatientPrescriptions(patient.patient_id);
      const formatted = (data || []).map(p => ({
        id: p.prescription_id,
        name: p.medicine_name,
        dose: p.dosage,
        frequency: p.frequency,
        status: "Active"
      }));
      setMeds(formatted);
    } catch (err) {
      console.error("Failed to load prescriptions", err);
    }
  };

  const handlePrescribe = async () => {
    if (newMed.name && newMed.dose) {
      setLoading(true);
      try {
        await addPatientPrescription(patient.patient_id, {
          doctor_id: doctorId,
          medicine_name: newMed.name,
          dosage: newMed.dose,
          frequency: newMed.frequency
        });
        setNewMed({ name: "", dose: "", frequency: "" });
        await loadMeds();
      } catch (err) {
        console.error("Failed to add prescription", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-100 d-flex flex-column gap-3">
      <div className="glass-panel p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
        <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-capsule text-success me-2" />New Prescription</h5>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary" placeholder="Medication Name (e.g. Lisinopril)" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary" placeholder="Dose (e.g. 10mg)" value={newMed.dose} onChange={e => setNewMed({...newMed, dose: e.target.value})} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary" placeholder="Frequency" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-sm btn-success w-100" onClick={handlePrescribe}>Prescribe</button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(15,23,42,0.6)" }}>
        <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-clipboard-check text-info me-2" />Active Prescriptions</h5>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle" style={{ fontSize: "0.85rem" }}>
            <thead>
              <tr className="text-muted">
                <th>Medication</th>
                <th>Dose</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {meds.map(m => (
                <tr key={m.id}>
                  <td className="text-white fw-bold">{m.name}</td>
                  <td>{m.dose}</td>
                  <td>{m.frequency}</td>
                  <td><span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">{m.status}</span></td>
                  <td><button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setMeds(meds.filter(x => x.id !== m.id))}><i className="bi bi-x" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
