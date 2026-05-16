import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, MeshWobbleMaterial, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function DNAHelix({ color = "#0ea5e9" }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
  });

  const count = 20;
  const points = [];
  for (let i = 0; i < count; i++) {
    const y = (i / count) * 4 - 2;
    const angle = (i / count) * Math.PI * 4;
    points.push(new THREE.Vector3(Math.cos(angle) * 0.5, y, Math.sin(angle) * 0.5));
  }

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
      ))}
      {/* Second strand */}
      {points.map((p, i) => (
        <mesh key={`b-${i}`} position={[-p.x, p.y, -p.z]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function HeartMesh({ color = "#f43f5e" }) {
  const meshRef = useRef();
  const shellRef = useRef();
  const outerShellRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.position.y = Math.sin(time * 2) * 0.1;
    
    shellRef.current.rotation.y = -time * 0.3;
    shellRef.current.rotation.z = Math.sin(time) * 0.2;
    
    outerShellRef.current.rotation.x = time * 0.2;
    outerShellRef.current.rotation.y = time * 0.4;

    const scale = 1 + Math.pow(Math.sin(time * 3), 4) * 0.15;
    meshRef.current.scale.set(scale, scale, scale);
    shellRef.current.scale.set(scale * 1.2, scale * 1.2, scale * 1.2);
    outerShellRef.current.scale.set(scale * 1.4, scale * 1.4, scale * 1.4);
  });

  return (
    <group>
      {/* DNA Helix Inside */}
      <DNAHelix color={color} />

      {/* Inner Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.4}
          radius={0.8}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={1}
        />
      </mesh>

      {/* Mid Wireframe Shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Outer Hexagonal Shell */}
      <mesh ref={outerShellRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.1}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

function Particles({ count = 150, color = "#f43f5e" }) {
  const points = useRef();
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    points.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2;
  });

  return (
    <Points ref={points} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color={color}
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function MedicalHeart3D({ color }) {
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={color} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color={color} />
        
        <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
          <HeartMesh color={color} />
        </Float>
        
        <Particles color={color} />
      </Canvas>
    </div>
  );
}


