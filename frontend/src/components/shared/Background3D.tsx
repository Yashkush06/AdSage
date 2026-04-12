import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../../lib/store";

const tempObject = new THREE.Object3D();

function Particles({ count = 1500 }) {
  const mesh = useRef<THREE.Points>(null!);

  const dummy = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 50;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return { positions };
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.y = time * 0.05;
    mesh.current.rotation.x = time * 0.03;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[dummy.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#FDA481"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FloatingNodes({ count = 30 }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);

  const nodes = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
      ),
      speed: Math.random() * 0.01,
      offset: Math.random() * Math.PI * 2,
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
    }));
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    nodes.forEach((node, i) => {
      tempObject.position.set(
        node.position.x,
        node.position.y + Math.sin(time + node.offset) * 0.05,
        node.position.z
      );
      tempObject.rotation.set(
        node.rotation.x + time * node.speed,
        node.rotation.y,
        node.rotation.z + time * node.speed
      );
      tempObject.updateMatrix();
      mesh.current.setMatrixAt(i, tempObject.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial
        color="#FDA481"
        emissive="#FDA481"
        emissiveIntensity={2}
        transparent
        opacity={0.4}
      />
    </instancedMesh>
  );
}

export function Background3D() {
  const [dpr, setDpr] = useState(1.5);
  const [quality, setQuality] = useState(1);

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        dpr={dpr}
        gl={{ antialias: quality > 0.5 }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setQuality(0.5);
          }}
          onIncline={() => {
            setDpr(1.5);
            setQuality(1);
          }}
        />
        <color attach="background" args={["#181A2F"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#FDA481" />
        <Particles count={quality === 1 ? 1500 : 500} />
        <FloatingNodes count={quality === 1 ? 30 : 10} />
        <fog attach="fog" args={["#181A2F", 20, 70]} />
      </Canvas>
    </div>
  );
}
