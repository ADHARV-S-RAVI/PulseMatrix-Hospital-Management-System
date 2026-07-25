import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, AlertTriangle, ScanLine, UserPlus, FileHeart, Crosshair } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addPatient } from '../services/api';

export default function AITriage() {
  const { registerPatient } = useApp();
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', symptoms: '', vitals: { hr: '', bp: '', o2: '' } });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcess = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.symptoms) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI processing delay
    setTimeout(() => {
      setIsAnalyzing(false);
      // Mock logic based on keywords
      const s = formData.symptoms.toLowerCase();
      let severity = 'Medium';
      let prob = 85;
      let dept = 'General Ward';
      let color = '#4ade80';

      if (s.includes('heart') || s.includes('chest') || parseInt(formData.vitals.hr) > 120) {
        severity = 'Critical'; prob = 42; dept = 'Cardiology ICU'; color = '#f43f5e';
      } else if (s.includes('bleed') || s.includes('trauma')) {
        severity = 'High'; prob = 65; dept = 'Trauma Center'; color = '#f59e0b';
      } else if (s.includes('breath') || parseInt(formData.vitals.o2) < 92) {
        severity = 'High'; prob = 70; dept = 'Pulmonology'; color = '#f59e0b';
      }

      setResult({ severity, probability: prob, department: dept, color });
      setResult({ severity, probability: prob, department: dept, color });
    }, 3000);
  };

  const handleConfirm = async () => {
    if (!result) return;
    try {
      const newPatData = {
        name: formData.name,
        age: Number(formData.age) || 30,
        gender: formData.gender,
        department: result.department,
        severity: result.severity,
        severity_score: result.probability,
        symptoms: formData.symptoms,
      };
      
      registerPatient(newPatData);
      
      try {
        await addPatient(newPatData);
      } catch (e) {
        console.warn("Backend addPatient sync skipped", e);
      }
      
      setResult(null);
      setFormData({name: '', age: '', gender: 'Male', symptoms: '', vitals: {hr: '', bp: '', o2: ''}});
      alert("Patient Confirmed and Added to Triage Queue!");
    } catch (err) {
      alert("Failed to confirm patient.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8 border-b border-primary/20 pb-6">
        <div className="w-16 h-16 rounded-xl border border-primary bg-primary/10 flex items-center justify-center shadow-neon">
          <BrainCircuit size={32} className="text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            AI TRIAGE ENGINE
          </h1>
          <p className="text-sm font-mono text-white/50 tracking-widest uppercase">Neural Symptom Analysis & Allocation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-4 lg:col-span-7"
        >
          <div className="flex items-center gap-2 mb-6 text-primary">
            <UserPlus size={20} />
            <h2 className="font-bold tracking-wider">PATIENT INGEST DATA</h2>
          </div>

          <form onSubmit={handleProcess} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/50 mb-1 tracking-widest">FULL NAME</label>
                <input required type="text" className="input-field font-mono" placeholder="e.g. John Doe" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-1 tracking-widest">AGE</label>
                  <input required type="number" className="input-field font-mono" placeholder="45" value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-1 tracking-widest">GENDER</label>
                  <select className="input-field font-mono" value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})}>
                    <option className="bg-surface text-white">Male</option>
                    <option className="bg-surface text-white">Female</option>
                    <option className="bg-surface text-white">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border border-primary/20 bg-black/40 rounded-lg">
              <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2"><FileHeart size={14}/> LIVE VITALS BIOMETRICS</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-white/50 mb-1 tracking-widest">HR (BPM)</label>
                  <input type="number" className="input-field font-mono text-center" placeholder="-- / 80" value={formData.vitals.hr} onChange={e=>setFormData({...formData, vitals: {...formData.vitals, hr: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/50 mb-1 tracking-widest">SYS BP</label>
                  <input type="number" className="input-field font-mono text-center" placeholder="-- / 120" value={formData.vitals.bp} onChange={e=>setFormData({...formData, vitals: {...formData.vitals, bp: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/50 mb-1 tracking-widest">O2 (%)</label>
                  <input type="number" className="input-field font-mono text-center" placeholder="-- / 99" value={formData.vitals.o2} onChange={e=>setFormData({...formData, vitals: {...formData.vitals, o2: e.target.value}})} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 mb-1 tracking-widest">REPORTED SYMPTOMS & NOTES</label>
              <textarea required className="input-field font-mono min-h-[100px] resize-none" placeholder="Describe symptoms in detail..." value={formData.symptoms} onChange={e=>setFormData({...formData, symptoms: e.target.value})} />
            </div>

            <button type="submit" disabled={isAnalyzing} className="w-full btn-primary flex items-center justify-center gap-2 font-bold tracking-widest py-3">
              {isAnalyzing ? (
                <><ScanLine className="animate-spin" size={20} /> INITIALIZING NEURAL SCAN...</>
              ) : (
                <><BrainCircuit size={20} /> EXECUTE AI TRIAGE</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Output Panel */}
        <div className="relative lg:col-span-5 h-[600px] lg:h-auto">
          <AnimatePresence mode="wait">
            {!isAnalyzing && !result && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center text-white/30"
              >
                <Crosshair size={48} className="mb-4 opacity-50" />
                <p className="font-mono tracking-widest">AWAITING PATIENT DATA INPUT</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 glass-panel border-primary shadow-neon flex flex-col items-center justify-center bg-black/60 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-neon animate-[scan_2s_ease-in-out_infinite]" />
                <BrainCircuit size={64} className="text-primary animate-pulse mb-6" />
                <h3 className="text-xl font-display font-bold text-primary tracking-widest mb-2">PROCESSING NEURAL VECTORS</h3>
                <p className="font-mono text-xs text-white/70">Cross-referencing 4.2 million historical medical records...</p>
                
                <div className="w-64 h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, ease: "linear" }}
                    className="h-full bg-primary"
                  />
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 glass-panel p-4 flex flex-col"
                style={{ borderColor: `${result.color}50`, boxShadow: `0 0 30px ${result.color}20` }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-mono text-white/50 tracking-widest mb-1">COMPUTATION COMPLETE</h3>
                    <h2 className="text-3xl font-display font-bold" style={{ color: result.color }}>{result.severity.toUpperCase()} PRIORITY</h2>
                  </div>
                  <AlertTriangle size={36} color={result.color} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                  <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                    <p className="text-xs font-mono text-white/50 tracking-widest mb-2">SURVIVAL PROBABILITY</p>
                    <div className="text-4xl font-display font-bold" style={{ color: result.color }}>{result.probability}%</div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                    <p className="text-xs font-mono text-white/50 tracking-widest mb-2">RECOMMENDED DEPT</p>
                    <div className="text-xl font-bold text-white mt-2">{result.department}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button onClick={handleConfirm} className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors font-bold tracking-widest text-sm flex items-center justify-center gap-2">
                    CONFIRM & ASSIGN BED
                  </button>
                  <button onClick={() => {setResult(null); setFormData({name:'', age:'', gender:'Male', symptoms:'', vitals:{hr:'',bp:'',o2:''}})}} className="w-full py-3 text-white/50 hover:text-white transition-colors text-xs font-mono tracking-widest">
                    RESET CONSOLE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
