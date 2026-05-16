import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, MeshDistortMaterial, Float, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

function ScannerRings({ color = "#0ea5e9" }) {
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ring1.current.rotation.x = t * 0.5;
    ring1.current.rotation.y = t * 0.2;
    
    ring2.current.rotation.y = t * 0.4;
    ring2.current.rotation.z = t * 0.3;
    
    ring3.current.rotation.x = t * 0.3;
    ring3.current.rotation.z = t * 0.6;
  });

  return (
    <group>
      <mesh ref={ring1}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1.8, 0.015, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[2.1, 0.01, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function DataCore({ color = "#0ea5e9" }) {
  const mesh = useRef();
  
  useFrame((state) => {
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <mesh ref={mesh}>
      <octahedronGeometry args={[0.8, 0]} />
      <MeshWobbleMaterial color={color} factor={0.4} speed={2} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function MedicalScanner3D({ color = "#0ea5e9" }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={color} />
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <ScannerRings color={color} />
          <DataCore color={color} />
        </Float>
      </Canvas>
    </div>
  );
}
