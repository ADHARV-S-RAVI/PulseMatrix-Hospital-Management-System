import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';

// Simple glass material for walls
function GlassWall({ color = "#00E5FF", opacity = 0.2, side = THREE.DoubleSide }) {
  return (
    <meshPhysicalMaterial 
      color={color}
      transparent
      opacity={opacity}
      transmission={0.9}
      roughness={0.1}
      metalness={0.8}
      side={side}
    />
  );
}

// Interactive Bed Mesh
function BedMesh({ position, bed, onClick }) {
  const [hovered, setHover] = useState(false);
  
  // Determine color based on status
  let bedColor = "#10b981"; // Available
  if (bed.status === "Occupied") bedColor = "#0284c7";
  else if (bed.status === "Maintenance") bedColor = "#64748b";
  else if (bed.status === "Reserved") bedColor = "#f59e0b";

  return (
    <mesh 
      position={position} 
      onClick={(e) => { e.stopPropagation(); onClick({ type: 'bed', id: bed.id, ...bed }); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
    >
      <boxGeometry args={[0.8, 0.4, 1.5]} />
      <meshStandardMaterial color={hovered ? "#FFFFFF" : bedColor} emissive={bedColor} emissiveIntensity={hovered ? 0.8 : 0.2} />
      <Edges color={bedColor} />
      
      {hovered && (
        <Html position={[0, 0.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-black/80 backdrop-blur border border-white/20 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none shadow-xl">
            <span className="font-bold">{bed.id}</span>
            <span className="ml-2 text-white/60">{bed.status}</span>
          </div>
        </Html>
      )}
    </mesh>
  );
}

// A specific Room inside a Floor
function Room({ position, size, name, color, bedsData, onClick, viewMode }) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);

  // Heatmap logic
  const occupancy = bedsData ? bedsData.filter(b => b.status === "Occupied").length / (bedsData.length || 1) : 0;
  let finalColor = color;
  if (viewMode === 'heatmap') {
    if (occupancy > 0.8) finalColor = "#e11d48"; // Critical
    else if (occupancy > 0.5) finalColor = "#f59e0b"; // High load
    else finalColor = "#10b981"; // Normal
  }

  return (
    <group position={position}>
      {/* Floor Plate of Room */}
      <mesh 
        position={[0, -size[1]/2, 0]}
        onClick={(e) => { e.stopPropagation(); onClick({ type: 'room', name }); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[size[0], 0.1, size[2]]} />
        <meshStandardMaterial color={finalColor} transparent opacity={hovered ? 0.8 : 0.4} emissive={finalColor} emissiveIntensity={viewMode==='heatmap'?0.6:0.2} />
      </mesh>

      {/* Glass Walls */}
      <mesh>
        <boxGeometry args={size} />
        <GlassWall color={finalColor} opacity={hovered ? 0.3 : 0.1} />
        <Edges color={finalColor} opacity={0.5} />
      </mesh>

      {/* Render Beds inside this room */}
      {bedsData && bedsData.map((bed, i) => {
        // Simple grid layout for beds
        const cols = Math.floor(size[0] / 2);
        const r = Math.floor(i / cols);
        const c = i % cols;
        const startX = -size[0]/2 + 1.5;
        const startZ = -size[2]/2 + 1.5;
        return (
          <BedMesh 
            key={bed.id} 
            bed={bed} 
            position={[startX + c * 2, -size[1]/2 + 0.3, startZ + r * 2.5]} 
            onClick={onClick}
          />
        );
      })}

      {/* Room Label */}
      <Html position={[0, size[1]/2 + 0.5, 0]} center>
         <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur ${hovered ? 'bg-primary/20 text-white border border-primary/50' : 'text-white/50'}`}>
           {name}
         </div>
      </Html>
    </group>
  );
}

// A Floor Group
function FloorGroup({ level, targetY, rooms, beds, onSelect, viewMode }) {
  const group = useRef();

  useFrame(() => {
    // Smoothly animate to targetY for exploded views
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.1);
  });

  return (
    <group ref={group} position={[0, targetY, 0]}>
      {/* Main Floor Base */}
      <mesh position={[0, -1, 0]} onClick={(e) => { e.stopPropagation(); onSelect({ type: 'floor', name: `Level ${level}` })}}>
        <boxGeometry args={[20, 0.2, 14]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.5} wireframe />
      </mesh>

      {/* Render Rooms */}
      {rooms.map((room, i) => (
        <Room 
          key={i} 
          position={room.position} 
          size={room.size} 
          name={room.name} 
          color={room.color} 
          bedsData={beds.filter(b => b.department === room.deptKey)}
          onClick={onSelect}
          viewMode={viewMode}
        />
      ))}
    </group>
  );
}

export default function Hospital3D({ viewMode, onNodeSelect }) {
  const { beds } = useApp();
  const modelGroup = useRef();

  // Rotate slowly if normal mode
  useFrame((state) => {
    if (viewMode === 'normal') {
      modelGroup.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    } else {
      modelGroup.current.rotation.y = THREE.MathUtils.lerp(modelGroup.current.rotation.y, 0, 0.05);
    }
  });

  // Vertical offsets based on view mode
  const spacing = viewMode === 'exploded' ? 12 : 5;

  return (
    <group ref={modelGroup} position={[0, -spacing * 1.5, 0]}>
      
      {/* Floor 0: Emergency & Triage */}
      <FloorGroup 
        level={0} 
        targetY={0} 
        onSelect={onNodeSelect}
        beds={beds}
        viewMode={viewMode}
        rooms={[
          { name: "Emergency ER", position: [-5, 1, 0], size: [8, 3, 10], color: "#0284c7", deptKey: "DEPT-2" },
          { name: "Triage / Lobby", position: [5, 1, 0], size: [8, 3, 10], color: "#10b981", deptKey: "General" }
        ]}
      />

      {/* Floor 1: ICU & Surgery */}
      <FloorGroup 
        level={1} 
        targetY={spacing} 
        onSelect={onNodeSelect}
        beds={beds}
        viewMode={viewMode}
        rooms={[
          { name: "Surgical ICU", position: [-5, 1, 0], size: [8, 3, 10], color: "#e11d48", deptKey: "DEPT-1" },
          { name: "Operation Theaters", position: [5, 1, 0], size: [8, 3, 10], color: "#0284c7", deptKey: "Surgery" }
        ]}
      />

      {/* Floor 2: General Wards */}
      <FloorGroup 
        level={2} 
        targetY={spacing * 2} 
        onSelect={onNodeSelect}
        beds={beds}
        viewMode={viewMode}
        rooms={[
          { name: "General Ward A", position: [-5, 1, -2], size: [8, 3, 6], color: "#0f172a", deptKey: "DEPT-3" },
          { name: "General Ward B", position: [5, 1, -2], size: [8, 3, 6], color: "#0f172a", deptKey: "DEPT-4" },
          { name: "Pharmacy", position: [0, 1, 4], size: [18, 3, 4], color: "#10b981", deptKey: "Pharm" }
        ]}
      />

      {/* Floor 3: Pediatrics & Labs */}
      <FloorGroup 
        level={3} 
        targetY={spacing * 3} 
        onSelect={onNodeSelect}
        beds={beds}
        viewMode={viewMode}
        rooms={[
          { name: "Pediatrics", position: [-5, 1, 0], size: [8, 3, 10], color: "#0ea5e9", deptKey: "DEPT-5" },
          { name: "Radiology / Labs", position: [5, 1, 0], size: [8, 3, 10], color: "#8b5cf6", deptKey: "Labs" }
        ]}
      />

      {/* Central Elevator / Spine */}
      <mesh position={[0, (spacing * 3) / 2 + 1, 0]}>
        <boxGeometry args={[3, spacing * 3 + 3, 4]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.4} wireframe />
        <Edges color="#00E5FF" opacity={0.3} />
      </mesh>

    </group>
  );
}
