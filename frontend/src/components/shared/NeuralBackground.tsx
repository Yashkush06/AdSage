import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Sphere, MeshDistortMaterial, Icosahedron } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <>
      {/* Central Abstract Node */}
      <Float speed={1} rotationIntensity={1} floatIntensity={1}>
        <Icosahedron ref={meshRef} args={[2, 1]} position={[3, 1, -8]}>
          <meshStandardMaterial 
            color="#FF0032" 
            wireframe 
            emissive="#FF0032" 
            emissiveIntensity={0.5} 
            transparent 
            opacity={0.3} 
          />
        </Icosahedron>
      </Float>

      {/* Cyberpunk secondary Node */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere args={[0.8, 32, 32]} position={[-5, -2, -5]}>
          <MeshDistortMaterial 
            color="#00F0FF" 
            attach="material" 
            distort={0.4} 
            speed={2} 
            roughness={0.2} 
            metalness={0.8} 
            emissive="#00F0FF"
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </Sphere>
      </Float>
      
      {/* Tertiary warm Node */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <Sphere args={[1.2, 32, 32]} position={[6, -3, -10]}>
          <MeshDistortMaterial 
            color="#FDA481" 
            attach="material" 
            distort={0.6} 
            speed={1.5} 
            roughness={0.4} 
            metalness={0.2} 
            emissive="#FDA481" 
            emissiveIntensity={0.1} 
            transparent
            opacity={0.4}
          />
        </Sphere>
      </Float>
    </>
  );
}

export function NeuralBackground() {
  return (
    <div className="fixed inset-0 z-[50] pointer-events-none opacity-30 mix-blend-screen overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <fog attach="fog" args={['#050505', 5, 20]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00F0FF" />
        <Stars radius={50} depth={50} count={3500} factor={4} saturation={1} fade speed={0.5} />
        <FloatingGeometry />
      </Canvas>
    </div>
  );
}
