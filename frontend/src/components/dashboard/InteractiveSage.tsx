import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

function SageOrb() {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.position.y = Math.sin(time) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere
        args={[1, 32, 32]}
        ref={mesh}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? "#FDA481" : "#FDA481"}
          speed={2}
          distort={0.3}
          radius={1}
          emissive="#FDA481"
          emissiveIntensity={hovered ? 2 : 1}
          roughness={0.4}
          metalness={0.6}
        />
      </Sphere>
    </Float>
  );
}

export function InteractiveSage() {
  return (
    <div className="w-32 h-32 md:w-48 md:h-48 cursor-pointer active:scale-95 transition-transform duration-500">
      <Canvas camera={{ position: [0, 0, 4] }} dpr={1}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FDA481" />
        <SageOrb />
      </Canvas>
    </div>
  );
}
