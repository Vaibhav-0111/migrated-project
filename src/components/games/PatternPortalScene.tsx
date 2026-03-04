import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface PatternPortalSceneProps {
  phase: 'animation' | 'interaction' | 'success' | 'helper';
  selectedSequence: number[];
  onAnimationComplete: () => void;
}

function Portal({ position, color, active, value }: { position: [number, number, number]; color: string; active: boolean; value?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * (active ? 0.5 : 0.2);
    }
    if (innerRef.current && active) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      innerRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={1} floatIntensity={0.3}>
      <group position={position}>
        {/* Outer ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.5, 0.08, 16, 32]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.2}
            emissive={color}
            emissiveIntensity={active ? 0.5 : 0.2}
          />
        </mesh>

        {/* Inner glow */}
        <mesh ref={innerRef}>
          <circleGeometry args={[0.4, 32]} />
          <MeshDistortMaterial 
            color={color}
            distort={active ? 0.3 : 0.1}
            speed={2}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Value display */}
        {value !== undefined && (
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial color="white" transparent opacity={0.9} />
          </mesh>
        )}

        {active && (
          <Sparkles 
            count={20} 
            scale={1.2} 
            size={2} 
            speed={0.5} 
            color={color}
          />
        )}
      </group>
    </Float>
  );
}

function FloatingShape({ position, shape, color }: { position: [number, number, number]; shape: 'sphere' | 'cube' | 'cone'; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[0.15, 16, 16]} />;
      case 'cube':
        return <boxGeometry args={[0.2, 0.2, 0.2]} />;
      case 'cone':
        return <coneGeometry args={[0.12, 0.25, 8]} />;
      default:
        return <sphereGeometry args={[0.15, 16, 16]} />;
    }
  }, [shape]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} castShadow>
        {geometry}
        <meshStandardMaterial 
          color={color} 
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function PatternDisplay({ sequence }: { sequence: number[] }) {
  const colors = ['#22d3ee', '#a78bfa', '#fb7185', '#fbbf24'];
  
  return (
    <group position={[0, -1.5, 0]}>
      {sequence.map((num, i) => (
        <group key={i} position={[-1.5 + i * 1, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.1]} />
            <meshStandardMaterial 
              color={colors[i % colors.length]} 
              roughness={0.3}
              emissive={colors[i % colors.length]}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CosmicBackground() {
  return (
    <group>
      {/* Stars */}
      <Sparkles 
        count={100} 
        scale={15} 
        size={1.5} 
        speed={0.1} 
        color="#ffffff"
      />

      {/* Floating shapes */}
      <FloatingShape position={[-3, 2, -2]} shape="sphere" color="#22d3ee" />
      <FloatingShape position={[3, 1.5, -1.5]} shape="cube" color="#a78bfa" />
      <FloatingShape position={[-2, -1, -2]} shape="cone" color="#fb7185" />
      <FloatingShape position={[2.5, -0.5, -1]} shape="sphere" color="#fbbf24" />
      <FloatingShape position={[0, 2.5, -3]} shape="cube" color="#34d399" />

      {/* Ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshStandardMaterial 
          color="#1e1b4b" 
          wireframe 
          transparent 
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

function PortalWorld({ selectedSequence, phase }: { selectedSequence: number[]; phase: string }) {
  const portalPositions: [number, number, number][] = [
    [-2, 0.5, 0],
    [-0.7, 0.5, 0],
    [0.7, 0.5, 0],
    [2, 0.5, 0],
  ];

  const portalColors = ['#22d3ee', '#a78bfa', '#fb7185', '#fbbf24'];

  return (
    <group>
      {/* Portals */}
      {portalPositions.map((pos, i) => (
        <Portal 
          key={i} 
          position={pos} 
          color={portalColors[i]}
          active={selectedSequence.length > i || phase === 'success'}
          value={selectedSequence[i]}
        />
      ))}

      {/* Arrow connections */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.35 + i * 1.35, 0.5, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.03, 0.03]} />
          <meshStandardMaterial 
            color="#94a3b8" 
            emissive="#94a3b8"
            emissiveIntensity={selectedSequence.length > i + 1 ? 0.5 : 0.1}
          />
        </mesh>
      ))}

      {/* Pattern sequence display */}
      <PatternDisplay sequence={selectedSequence} />

      <CosmicBackground />
    </group>
  );
}

export function PatternPortalScene({ 
  phase, 
  selectedSequence,
  onAnimationComplete 
}: PatternPortalSceneProps) {
  useEffect(() => {
    if (phase === 'animation') {
      const timer = setTimeout(onAnimationComplete, 3500);
      return () => clearTimeout(timer);
    }
  }, [phase, onAnimationComplete]);

  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 1, 5], fov: 55 }}
      className="w-full h-full"
    >
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 8, 20]} />
      
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[3, 5, 5]} 
        intensity={0.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, 2]} intensity={0.4} color="#22d3ee" />
      <pointLight position={[3, 2, 2]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[0, -1, 3]} intensity={0.3} color="#fb7185" />

      <PortalWorld selectedSequence={selectedSequence} phase={phase} />

      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
