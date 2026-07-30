import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadioTower, MapPin, Navigation, X, Ambulance } from 'lucide-react';
import AmbulanceTracker from '../components/AmbulanceTracker';

export default function AmbulanceCommandCenter() {
  const [ambulances, setAmbulances] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ambulance_id: '',
    driver_name: '',
    emt_team: '',
    current_location: '',
    destination: '',
    priority_level: 'High',
    status: 'Available',
    eta: ''
  });

  const fetchAmbulances = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5001/ambulances/');
      const data = await res.json();
      if (data.ambulances) setAmbulances(data.ambulances);
    } catch (err) {
      console.error("Failed to fetch ambulances", err);
    }
  };

  useEffect(() => {
    fetchAmbulances();
    const interval = setInterval(fetchAmbulances, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://127.0.0.1:5001/ambulances/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setFormData({
        ambulance_id: '', driver_name: '', emt_team: '',
        current_location: '', destination: '', priority_level: 'High',
        status: 'Available', eta: ''
      });
      fetchAmbulances();
    } catch (err) {
      console.error("Dispatch failed", err);
    }
  };

  const activeDispatches = ambulances.filter(a => a.status !== 'Standby' && a.status !== 'Available');

  return (
    <div className="max-w-6xl mx-auto text-white h-full flex flex-col relative">
      <div className="flex items-center gap-4 mb-4 border-b border-primary/20 pb-4">
        <div className="w-10 h-10 rounded-lg border border-primary bg-primary/10 flex items-center justify-center">
          <RadioTower size={20} className="text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            AMBULANCE COMMAND CENTER
          </h1>
          <p className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Live Telemetry & Dispatch Routing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* Tracker View */}
        <div className="lg:col-span-9 h-[400px] lg:h-full">
          <AmbulanceTracker ambulances={ambulances} />
        </div>

        {/* Sidebar Controls */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-4 flex flex-col gap-4 lg:col-span-3"
        >
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-[11px] font-bold text-primary flex items-center gap-2 mb-3 tracking-wider">
              <Navigation size={12} /> ACTIVE DISPATCHES
            </h3>
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
              {activeDispatches.length === 0 && <div className="text-xs text-white/50 italic">No active dispatches.</div>}
              {activeDispatches.map(d => (
                <div key={d.ambulance_id} className="p-2.5 bg-surface/50 border border-white/5 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{d.ambulance_id}</div>
                    <div className="text-[10px] text-white/60 font-mono line-clamp-1" title={d.destination}>{d.destination || 'Patrol'}</div>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded">{d.eta || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <button onClick={() => setShowModal(true)} className="w-full btn-primary flex justify-center items-center gap-2 text-sm py-2">
              <MapPin size={14} /> NEW DEPLOYMENT
            </button>
          </div>
        </motion.div>
      </div>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-surface border border-primary/30 rounded-xl shadow-glass w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-surface/50">
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Ambulance size={18} className="text-primary"/> Deploy Unit
                </h2>
                <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
              </div>
              <form onSubmit={handleDispatch} className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Ambulance ID</label>
                    <input required value={formData.ambulance_id} onChange={e => setFormData({...formData, ambulance_id: e.target.value})} className="input-field text-sm py-1.5" placeholder="e.g. AMB-06" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-field text-sm py-1.5 appearance-none">
                      <option>Available</option><option>Dispatched</option><option>En Route</option><option>Arrived</option><option>Patient Pickup</option><option>Returning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Driver Name</label>
                    <input required value={formData.driver_name} onChange={e => setFormData({...formData, driver_name: e.target.value})} className="input-field text-sm py-1.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">EMT Team</label>
                    <input required value={formData.emt_team} onChange={e => setFormData({...formData, emt_team: e.target.value})} className="input-field text-sm py-1.5" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Current Location</label>
                    <input required value={formData.current_location} onChange={e => setFormData({...formData, current_location: e.target.value})} className="input-field text-sm py-1.5" placeholder="Station / Coordinates" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Destination</label>
                    <input value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="input-field text-sm py-1.5" placeholder="Incident Address" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Priority Level</label>
                    <select value={formData.priority_level} onChange={e => setFormData({...formData, priority_level: e.target.value})} className="input-field text-sm py-1.5 appearance-none">
                      <option>Normal</option><option>High</option><option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">ETA</label>
                    <input value={formData.eta} onChange={e => setFormData({...formData, eta: e.target.value})} className="input-field text-sm py-1.5" placeholder="e.g. 15 mins" />
                  </div>
                </div>
                
                <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-surface border border-white/20 hover:bg-white/5 transition-colors">
                    Save Draft
                  </button>
                  <button type="submit" className="btn-primary py-1.5 px-6">
                    Dispatch Unit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
