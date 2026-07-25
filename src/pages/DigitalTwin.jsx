import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Box as BoxIcon, Layers, Maximize2, Flame } from 'lucide-react';
import LeftPanel from '../components/DigitalTwin/LeftPanel';
import RightPanel from '../components/DigitalTwin/RightPanel';
import Hospital3D from '../components/DigitalTwin/Hospital3D';

export default function DigitalTwin() {
  const [viewMode, setViewMode] = useState('normal'); // 'normal' | 'exploded' | 'heatmap'
  const [selectedNode, setSelectedNode] = useState(null); // { type: 'room'|'bed'|'floor'|'doctor', id: ... }

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="max-w-[1600px] mx-auto text-white min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl border border-primary bg-primary/10 flex items-center justify-center shadow-neon">
            <BoxIcon size={24} className="text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              DIGITAL TWIN COMMAND CENTER
            </h1>
            <p className="text-xs font-mono text-white/50 tracking-widest uppercase">Live Structural Telemetry & Resource Nexus</p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-primary/20 shadow-glass">
          <button 
            onClick={() => setViewMode('normal')}
            className={`px-4 py-1.5 rounded text-xs font-bold tracking-widest transition-colors ${viewMode === 'normal' ? 'bg-primary text-black' : 'text-primary hover:bg-primary/20'}`}
          >
            NORMAL
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'exploded' ? 'normal' : 'exploded')}
            className={`px-4 py-1.5 rounded text-xs font-bold tracking-widest transition-colors flex items-center gap-2 ${viewMode === 'exploded' ? 'bg-primary text-black' : 'text-primary hover:bg-primary/20'}`}
          >
            <Layers size={14} /> EXPLODED
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'heatmap' ? 'normal' : 'heatmap')}
            className={`px-4 py-1.5 rounded text-xs font-bold tracking-widest transition-colors flex items-center gap-2 ${viewMode === 'heatmap' ? 'bg-accent text-black shadow-neon-red' : 'text-accent hover:bg-accent/20'}`}
          >
            <Flame size={14} /> HEATMAP
          </button>
        </div>
      </div>

      {/* 3-Panel Hybrid Layout */}
      <div className="flex-1 min-h-[700px] grid grid-cols-12 gap-4 pb-8">
        
        {/* Left Panel - Intelligence & Infrastructure */}
        <div className="col-span-3 h-full">
          <LeftPanel />
        </div>

        {/* Center Panel - 3D Engine */}
        <div className="col-span-6 h-full relative rounded-xl border border-primary/20 overflow-hidden bg-black/60 shadow-glass group">
          {/* Overlay info */}
          <AnimatePresence>
            {selectedNode && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur border border-primary text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-neon pointer-events-none"
               >
                 <Maximize2 size={12} /> Target Locked: {selectedNode.name || selectedNode.id}
               </motion.div>
            )}
          </AnimatePresence>

          <Canvas camera={{ position: [25, 20, 25], fov: 45 }}>
            <color attach="background" args={['#040B16']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[20, 20, 20]} intensity={1} color="#00E5FF" />
            <pointLight position={[-20, -10, -20]} intensity={0.5} color="#1C4E80" />
            <pointLight position={[0, 30, 0]} intensity={0.8} color="#FF3366" />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            
            <Hospital3D viewMode={viewMode} onNodeSelect={handleNodeSelect} />
            
            <OrbitControls 
              enablePan={true} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI/2 - 0.1}
              minDistance={10}
              maxDistance={60}
              target={[0, 0, 0]}
            />
          </Canvas>
          
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,229,255,0.05)_3px,rgba(0,229,255,0.05)_3px)]" />
        </div>

        {/* Right Panel - Contextual Command Center */}
        <div className="col-span-3 h-full">
          <RightPanel selectedNode={selectedNode} />
        </div>

      </div>
    </div>
  );
}
