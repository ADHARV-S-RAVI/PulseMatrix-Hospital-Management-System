import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, PerspectiveCamera, Float, Sphere } from "@react-three/drei";
import * as THREE from "three";

function GridMatrix() {
  const count = 30;
  const spacing = 1.5;
  
  const lines = useMemo(() => {
    const l = [];
    // Horizontal lines
    for (let i = -count/2; i <= count/2; i++) {
      l.push([[-count/2 * spacing, 0, i * spacing], [count/2 * spacing, 0, i * spacing]]);
    }
    // Vertical lines
    for (let i = -count/2; i <= count/2; i++) {
      l.push([[i * spacing, 0, -count/2 * spacing], [i * spacing, 0, count/2 * spacing]]);
    }
    return l;
  }, [count, spacing]);

  const ref = useRef();
  useFrame((state) => {
    ref.current.position.z = (state.clock.getElapsedTime() * 2) % spacing;
  });

  return (
    <group ref={ref} rotation={[Math.PI / 10, 0, 0]}>
      {lines.map((points, i) => (
        <Line 
          key={i} 
          points={points} 
          color="#0ea5e9" 
          lineWidth={0.5} 
          transparent 
          opacity={0.15} 
        />
      ))}
    </group>
  );
}

function DataPulse() {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    ref.current.position.y = Math.sin(t) * 0.5;
  });

  return (
    <Sphere ref={ref} args={[1, 32, 32]} position={[0, 0, -10]}>
      <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.1} />
    </Sphere>
  );
}

export default function AdminMatrixBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "#020617" }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} rotation={[-Math.PI / 6, 0, 0]} />
        <GridMatrix />
        <DataPulse />
        <fog attach="fog" args={["#020617", 10, 25]} />
      </Canvas>
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "radial-gradient(circle at center, transparent 0%, rgba(2,6,23,0.9) 100%)",
        pointerEvents: "none"
      }} />
    </div>
  );
}
