import { useState } from "react";
import { motion } from "motion/react";

export default function TelemedicinePanel({ patient }) {
  const [activeTab, setActiveTab] = useState("video");
  const [messages, setMessages] = useState([
    { sender: "Nurse Joy", text: "Patient's temp spiked to 38.5C. Administered paracetamol as per PRN order.", time: "10:15 AM", isStaff: true },
    { sender: "Dr. Chen", text: "Noted. Please recheck in 1 hour.", time: "10:20 AM", isStaff: true },
    { sender: patient?.name || "Patient", text: "Doctor, I'm feeling a bit dizzy after the new medication.", time: "11:05 AM", isStaff: false }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: "Dr. You", text: input, time: "Just now", isStaff: true }]);
      setInput("");
    }
  };

  if (!patient) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-100 d-flex flex-column gap-3">
      <div className="d-flex gap-2">
        <button className={`btn btn-sm ${activeTab === 'video' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('video')}>
          <i className="bi bi-camera-video me-1" /> Video Consult
        </button>
        <button className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('chat')}>
          <i className="bi bi-chat-dots me-1" /> Secure Messaging
        </button>
        <button className={`btn btn-sm ${activeTab === 'collab' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('collab')}>
          <i className="bi bi-people me-1" /> MD Collab Panel
        </button>
      </div>

      {activeTab === 'video' && (
        <div className="glass-panel flex-grow-1 p-3 d-flex flex-column" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="flex-grow-1 bg-dark rounded d-flex flex-column align-items-center justify-content-center border border-secondary border-opacity-50 position-relative mb-3">
            <div className="position-absolute top-0 end-0 p-2"><span className="badge bg-danger blink">REC</span></div>
            <i className="bi bi-person-video text-muted" style={{ fontSize: "4rem" }} />
            <div className="text-muted mt-2">Waiting for {patient.name} to join...</div>
          </div>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-outline-secondary rounded-circle" style={{ width: 50, height: 50 }}><i className="bi bi-mic-mute" /></button>
            <button className="btn btn-outline-secondary rounded-circle" style={{ width: 50, height: 50 }}><i className="bi bi-camera-video-off" /></button>
            <button className="btn btn-danger rounded-circle" style={{ width: 50, height: 50 }}><i className="bi bi-telephone-x" /></button>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="glass-panel flex-grow-1 p-3 d-flex flex-column" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="flex-grow-1 overflow-auto mb-3 d-flex flex-column gap-2 pe-2 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-3 ${m.sender === 'Dr. You' ? 'align-self-end text-end' : 'align-self-start'}`} style={{ maxWidth: "80%", background: m.sender === 'Dr. You' ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.05)" }}>
                <div className="d-flex align-items-center gap-2 mb-1" style={{ justifyContent: m.sender === 'Dr. You' ? 'flex-end' : 'flex-start' }}>
                  <span className="fw-bold" style={{ fontSize: "0.75rem", color: m.isStaff ? "#0ea5e9" : "#10b981" }}>{m.sender}</span>
                  <span className="text-muted" style={{ fontSize: "0.6rem" }}>{m.time}</span>
                </div>
                <div className="text-white" style={{ fontSize: "0.85rem" }}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="d-flex gap-2">
            <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="Type secure message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button className="btn btn-primary px-3" onClick={handleSend}><i className="bi bi-send" /></button>
          </div>
        </div>
      )}

      {activeTab === 'collab' && (
        <div className="glass-panel flex-grow-1 p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
          <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-diagram-3 text-info me-2" />Doctor-to-Doctor Referrals</h5>
          <div className="text-center p-5 text-muted">
            <i className="bi bi-people" style={{ fontSize: "3rem" }} />
            <p className="mt-3 small">Invite specialists to review {patient.name}'s case file.</p>
            <button className="btn btn-outline-info btn-sm">Create Referral</button>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .blink { animation: blink 1s infinite; }
      `}</style>
    </motion.div>
  );
}
