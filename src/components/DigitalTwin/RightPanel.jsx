import React from 'react';
import { motion } from 'framer-motion';
import { Users, Bed, Activity, UserCircle, ShieldAlert, HeartPulse } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function FloorAnalytics({ floorId }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 tracking-widest uppercase">
        <Activity size={14} /> Floor Analytics: {floorId}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-center">
          <div className="text-2xl font-display font-bold text-white">84%</div>
          <div className="text-[9px] font-mono text-white/50">OCCUPANCY</div>
        </div>
        <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-center">
          <div className="text-2xl font-display font-bold text-success">98%</div>
          <div className="text-[9px] font-mono text-success/70">EQUIPMENT HEALTH</div>
        </div>
      </div>
    </div>
  );
}

function RoomInspector({ node }) {
  const { beds, patients, navigateToManagement } = useApp();
  // Mock finding beds for this room
  const roomBeds = beds.slice(0, 4); // In reality filter by node.roomId

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 tracking-widest uppercase">
        <Bed size={14} /> Room Explorer: {node.name}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {roomBeds.map(bed => {
          const isOccupied = bed.status === 'Occupied';
          const isMaintenance = bed.status === 'Maintenance';
          const colorClass = isOccupied ? 'text-accent border-accent/30 bg-accent/5' : isMaintenance ? 'text-secondary border-secondary/30 bg-secondary/5' : 'text-success border-success/30 bg-success/5';
          
          return (
            <div key={bed.id} className={`p-3 border rounded-lg ${colorClass}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold font-mono">{bed.id}</span>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-black/40">{bed.status}</span>
              </div>
              {isOccupied && bed.patient ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">{bed.patient}</div>
                  <div className="text-[10px] text-white/70">Severity: <span className="text-warning">High</span></div>
                  <div className="text-[10px] text-white/70">Admitted: 2 hours ago</div>
                </div>
              ) : (
                <div className="text-[10px] text-white/50 font-mono h-10 flex items-center">No patient assigned.</div>
              )}
              
              <button 
                onClick={() => navigateToManagement('beds')}
                className="mt-3 w-full py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-[9px] font-bold text-white transition-colors uppercase tracking-widest"
              >
                Open in Bed Management
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function DoctorCommandCenter({ node }) {
  const { doctors, updateDoctorStatus, navigateToManagement } = useApp();
  // If a specific doctor is clicked, show them, else show roster
  const docList = node?.doctorId ? doctors.filter(d => d.id === node.doctorId) : doctors;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 tracking-widest uppercase">
        <UserCircle size={14} /> Doctor Command Center
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {docList.map(doc => {
          const isFatigued = Math.random() > 0.7; // Mock fatigue
          
          return (
            <div key={doc.id} className={`p-3 border rounded-lg bg-black/40 ${isFatigued ? 'border-accent/50' : 'border-white/10'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${isFatigued ? 'bg-accent/20 border-accent text-accent' : 'bg-primary/20 border-primary text-primary'}`}>
                  {doc.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{doc.name}</div>
                  <div className="text-[10px] font-mono text-white/50">{doc.specialty}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/5 p-1.5 rounded text-center">
                  <div className="text-[9px] text-white/50 uppercase">Patients</div>
                  <div className="text-xs font-bold text-white">{doc.currentLoad}</div>
                </div>
                <div className="bg-white/5 p-1.5 rounded text-center">
                  <div className="text-[9px] text-white/50 uppercase">Fatigue</div>
                  <div className={`text-xs font-bold ${isFatigued ? 'text-accent' : 'text-success'}`}>{isFatigued ? '85%' : '20%'}</div>
                </div>
              </div>

              {isFatigued && (
                <button 
                  onClick={() => updateDoctorStatus(doc.name, 'Unavailable')}
                  className="w-full py-1.5 bg-accent/20 border border-accent hover:bg-accent/40 rounded text-[9px] font-bold text-accent transition-colors uppercase tracking-widest mb-2"
                >
                  Force Shift Rotation
                </button>
              )}
              
              <button 
                onClick={() => navigateToManagement('doctors')}
                className="w-full py-1.5 bg-white/5 border border-white/20 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-colors uppercase tracking-widest"
              >
                Open in Doctors Roster
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default function RightPanel({ selectedNode }) {
  // Determine what to render based on selection
  let content = <FloorAnalytics floorId="Global Overview" />;

  if (selectedNode) {
    if (selectedNode.type === 'floor') {
      content = <FloorAnalytics floorId={selectedNode.name} />;
    } else if (selectedNode.type === 'room') {
      content = <RoomInspector node={selectedNode} />;
    } else if (selectedNode.type === 'doctor') {
      content = <DoctorCommandCenter node={selectedNode} />;
    }
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar">
      <motion.div 
        key={selectedNode?.id || 'default'}
        initial={{opacity:0, x:20}} 
        animate={{opacity:1, x:0}} 
        className="glass-panel p-4 flex-1 min-h-0"
      >
        {content}
      </motion.div>
    </div>
  );
}
