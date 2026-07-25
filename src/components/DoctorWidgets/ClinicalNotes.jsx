import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getPatientNotes, addPatientNote } from "../../services/api";

export default function ClinicalNotes({ patient, doctorId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      loadNotes();
    }
  }, [patient]);

  const loadNotes = async () => {
    try {
      const data = await getPatientNotes(patient.patient_id);
      setNotes(data || []);
    } catch (err) {
      console.error("Failed to load clinical notes", err);
    }
  };

  const handleSave = async () => {
    if (newNote.trim()) {
      setLoading(true);
      try {
        await addPatientNote(patient.patient_id, {
          doctor_id: doctorId,
          note_type: "Progress Note",
          content: newNote
        });
        setNewNote("");
        await loadNotes();
      } catch (err) {
        console.error("Failed to add note", err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!patient) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-100 d-flex flex-column gap-3">
      <div className="glass-panel p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
        <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-pen text-primary me-2" />Add Clinical Note</h5>
        <textarea 
          className="form-control bg-dark text-white border-secondary mb-2" 
          rows="3" 
          placeholder="Enter progress report, diagnosis update, or observations..."
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
        />
        <div className="d-flex justify-content-end">
          <button className="btn btn-sm btn-primary px-4" onClick={handleSave}>Save Note</button>
        </div>
      </div>

      <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(15,23,42,0.6)" }}>
        <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-journal-medical text-info me-2" />History & Progress Reports</h5>
        <div className="d-flex flex-column gap-2">
          {notes.map(n => (
            <div key={n.note_id || n.id} className="p-3 rounded-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50">{n.note_type || n.type}</span>
                <span className="text-muted" style={{ fontSize: "0.7rem" }}>{new Date(n.timestamp || n.time).toLocaleString()}</span>
              </div>
              <p className="text-white mb-2" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{n.content}</p>
              <div className="text-muted text-end" style={{ fontSize: "0.7rem" }}>— {n.doctor_name || n.doctor}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
