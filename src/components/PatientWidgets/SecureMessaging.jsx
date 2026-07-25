import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

const MOCK_MESSAGES = [
  { id: 1, sender: "Dr. Sarah Chen", role: "doctor", text: "Your latest blood work looks good. We'll continue the current medication plan.", time: "10:15 AM", date: "Today" },
  { id: 2, sender: "You", role: "patient", text: "Thank you, doctor. I've been feeling less chest pain since yesterday.", time: "10:22 AM", date: "Today" },
  { id: 3, sender: "Dr. Sarah Chen", role: "doctor", text: "That's excellent progress. Please continue monitoring and let me know if anything changes.", time: "10:25 AM", date: "Today" },
  { id: 4, sender: "Nurse Williams", role: "nurse", text: "Your 12:30 PM medication has been administered. Next dose at 4:00 PM.", time: "12:35 PM", date: "Today" },
];

export default function SecureMessaging() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: "You", role: "patient", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: "Today" }]);
    setInput("");
    // Simulate doctor reply
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "Dr. Sarah Chen", role: "doctor", text: "Thank you for the update. I'll review and respond shortly.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: "Today" }]);
    }, 2000);
  };

  const roleColors = { doctor: "#0ea5e9", nurse: "#10b981", patient: "#8b5cf6" };

  return (
    <motion.div className="glass-panel p-4 hud-card d-flex flex-column" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ height: 420 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="hud-card-title mb-0"><i className="bi bi-chat-left-dots me-2" />Secure Messaging</h3>
        <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "0.55rem" }}><i className="bi bi-shield-lock me-1" />ENCRYPTED</span>
      </div>

      <div className="flex-grow-1 d-flex flex-column gap-2 overflow-auto mb-3 pe-1" style={{ scrollbarWidth: "thin" }}>
        {messages.map(msg => (
          <div key={msg.id} className={`d-flex ${msg.role === "patient" ? "justify-content-end" : "justify-content-start"}`}>
            <div className="p-2 rounded-3" style={{ maxWidth: "80%", background: msg.role === "patient" ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${msg.role === "patient" ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)"}` }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fw-bold" style={{ fontSize: "0.65rem", color: roleColors[msg.role] }}>{msg.sender}</span>
                <span style={{ fontSize: "0.55rem", color: "#64748b" }}>{msg.time}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#e2e8f0", lineHeight: 1.5 }}>{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="d-flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message..." className="form-control form-control-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.8rem" }} />
        <button onClick={send} className="btn btn-sm px-3" style={{ background: "#0ea5e9", color: "#fff", fontSize: "0.75rem" }}><i className="bi bi-send" /></button>
      </div>
    </motion.div>
  );
}
