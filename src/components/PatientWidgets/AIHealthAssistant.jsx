import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const FAQ_RESPONSES = {
  "medication": "Your current medications include Ceftriaxone 1g IV (every 8 hours), Paracetamol 500mg PO (every 6 hours), and Metoprolol 25mg PO (twice daily). Your next dose is Paracetamol at 12:30 PM.",
  "doctor": "Your attending physician is Dr. Sarah Chen from Cardiology. She is currently available. You can reach her through the Secure Messaging feature.",
  "discharge": "Based on your current recovery trajectory, estimated discharge is in approximately 48-72 hours. Your discharge readiness score is currently at 62%. Key milestones remaining: medication response confirmation and independent mobility.",
  "diet": "Your current diet plan is Low Sodium, Heart-Healthy. Today's meals: Breakfast - Low Sodium Porridge + Fruit (Delivered), Lunch - Steamed Fish + Veggie Puree (Scheduled at 12:30 PM). Daily calorie target: 1800 kcal.",
  "pain": "If you're experiencing pain, please use the Emergency SOS button for immediate assistance. Your current pain management includes Paracetamol 500mg every 6 hours. Your last recorded pain level was 3/10.",
  "results": "Your latest lab results: CBC - Normal range, Cardiac Enzymes - Slightly elevated (trending down), Blood Gas - pH 7.38 (normal). Full reports are available in your Health Document Vault.",
  "visiting": "Visiting hours are 10:00 AM - 12:00 PM and 4:00 PM - 7:00 PM daily. ICU patients: limited to 2 visitors at a time. You can share your real-time status with family through the Family Access Dashboard.",
  "insurance": "Your insurance coverage is $15,000. Current charges total $22,100. Insurance has pre-authorized $8,000. Estimated out-of-pocket at discharge: $0 (within coverage limits after adjustments).",
};

const SUGGESTIONS = [
  { label: "My medications", key: "medication" },
  { label: "When can I go home?", key: "discharge" },
  { label: "My lab results", key: "results" },
  { label: "Diet plan", key: "diet" },
  { label: "Pain help", key: "pain" },
  { label: "Who's my doctor?", key: "doctor" },
];

export default function AIHealthAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your AI Health Assistant. I can answer questions about your medications, lab results, diet, discharge timeline, and more. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const respond = (query) => {
    const q = query.toLowerCase();
    // Match keywords to FAQ
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (q.includes(key) || q.includes(key.slice(0, 4))) return response;
    }
    if (q.includes("med") || q.includes("pill") || q.includes("drug")) return FAQ_RESPONSES.medication;
    if (q.includes("home") || q.includes("leave") || q.includes("go")) return FAQ_RESPONSES.discharge;
    if (q.includes("eat") || q.includes("food") || q.includes("meal")) return FAQ_RESPONSES.diet;
    if (q.includes("hurt") || q.includes("pain") || q.includes("ache")) return FAQ_RESPONSES.pain;
    if (q.includes("test") || q.includes("lab") || q.includes("blood")) return FAQ_RESPONSES.results;
    if (q.includes("visit") || q.includes("family")) return FAQ_RESPONSES.visiting;
    if (q.includes("bill") || q.includes("cost") || q.includes("pay")) return FAQ_RESPONSES.insurance;
    return "I understand your concern. For specific medical questions, I recommend using the Secure Messaging feature to contact Dr. Chen directly, or press the Emergency SOS button if you need immediate assistance.";
  };

  const send = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: respond(msg) }]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="border-0 d-flex align-items-center justify-content-center"
        style={{ position: "fixed", bottom: 120, right: 30, width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", fontSize: "1.3rem", zIndex: 1001, boxShadow: "0 4px 20px rgba(14,165,233,0.4)", cursor: "pointer" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className={`bi ${isOpen ? "bi-x-lg" : "bi-robot"}`} />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ position: "fixed", bottom: 180, right: 30, width: 360, maxHeight: 480, zIndex: 1001, borderRadius: 16, overflow: "hidden", background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(14,165,233,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div className="p-3 d-flex align-items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(14,165,233,0.05)" }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", fontSize: "0.9rem" }}><i className="bi bi-robot" /></div>
              <div>
                <div className="fw-bold small text-white">AI Health Assistant</div>
                <div style={{ fontSize: "0.55rem", color: "#10b981" }}><i className="bi bi-circle-fill me-1" style={{ fontSize: "0.3rem" }} />Online · HIPAA Compliant</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow-1 p-3 d-flex flex-column gap-2" style={{ overflowY: "auto", maxHeight: 300 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                  <div className="p-2 rounded-3" style={{ maxWidth: "85%", background: msg.role === "user" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${msg.role === "user" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)"}`, fontSize: "0.72rem", color: "#e2e8f0", lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="d-flex justify-content-start">
                  <div className="p-2 rounded-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.72rem", color: "#94a3b8" }}>
                    <span style={{ animation: "blink 1s infinite" }}>●</span> <span style={{ animation: "blink 1s infinite 0.2s" }}>●</span> <span style={{ animation: "blink 1s infinite 0.4s" }}>●</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 pb-1 d-flex gap-1 flex-wrap">
              {SUGGESTIONS.map(s => (
                <button key={s.key} onClick={() => send(s.label)} className="badge border-0" style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", fontSize: "0.55rem", cursor: "pointer", padding: "3px 6px" }}>{s.label}</button>
              ))}
            </div>

            {/* Input */}
            <div className="p-2 d-flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask me anything..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: "0.75rem", outline: "none" }} />
              <button onClick={() => send()} className="btn btn-sm px-2" style={{ background: "#0ea5e9", color: "#fff", borderRadius: 8, fontSize: "0.8rem" }}><i className="bi bi-send" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
