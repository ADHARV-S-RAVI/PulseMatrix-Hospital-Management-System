import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, PerspectiveCamera, Float } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 2000 }) {
  const points = useRef();
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      // Cylindrical distribution
      const r = 5 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 30;
      
      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(theta);
      pos[i * 3 + 2] = z;
      
      color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.5);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    points.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    points.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <Points ref={points} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.4}
      />
    </Points>
  );
}

function DataRing({ radius, speed, color }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.z = state.clock.getElapsedTime() * speed;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} />
    </mesh>
  );
}

export default function BioMatrixBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "#050a15" }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <Particles />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <DataRing radius={8} speed={0.1} color="#0ea5e9" />
          <DataRing radius={12} speed={-0.15} color="#6366f1" />
          <DataRing radius={15} speed={0.08} color="#f43f5e" />
        </Float>
      </Canvas>
      {/* Overlay vignette */}
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "radial-gradient(circle at center, transparent 0%, rgba(5,10,21,0.8) 100%)",
        pointerEvents: "none"
      }} />
    </div>
  );
}
