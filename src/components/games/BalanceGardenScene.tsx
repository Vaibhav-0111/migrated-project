import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BalanceGardenSceneProps {
  phase: 'animation' | 'interaction' | 'success' | 'helper';
  leftSide: { apples: number; boxes: number };
  rightSide: { apples: number; boxes: number };
  onAnimationComplete: () => void;
}

function Apple({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Leaf */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.02, 0.08, 0.02]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
      </group>
    </Float>
  );
}

function MysteryBox({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
      <group position={position}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            roughness={0.2} 
            metalness={0.3}
            emissive="#8b5cf6"
            emissiveIntensity={0.2}
          />
        </mesh>
        <Text
          position={[0, 0, 0.14]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ?
        </Text>
      </group>
    </Float>
  );
}

function BalanceScale({ 
  leftSide, 
  rightSide, 
  phase 
}: { 
  leftSide: { apples: number; boxes: number };
  rightSide: { apples: number; boxes: number };
  phase: string;
}) {
  const boxValue = 3;
  const leftTotal = leftSide.boxes * boxValue + leftSide.apples;
  const rightTotal = rightSide.boxes * boxValue + rightSide.apples;
  
  const tiltAngle = phase === 'success' ? 0 : Math.max(-0.2, Math.min(0.2, (leftTotal - rightTotal) * 0.05));

  const leftItems: JSX.Element[] = [];
  const rightItems: JSX.Element[] = [];

  // Generate left side items
  for (let i = 0; i < leftSide.boxes; i++) {
    leftItems.push(
      <MysteryBox 
        key={`left-box-${i}`} 
        position={[-1.2 + (i % 3) * 0.35, 0.5 + Math.floor(i / 3) * 0.35, 0]} 
      />
    );
  }
  for (let i = 0; i < leftSide.apples; i++) {
    leftItems.push(
      <Apple 
        key={`left-apple-${i}`} 
        position={[-1.2 + (i % 4) * 0.25, 0.3 + Math.floor(i / 4) * 0.25, 0.3]} 
      />
    );
  }

  // Generate right side items
  for (let i = 0; i < rightSide.boxes; i++) {
    rightItems.push(
      <MysteryBox 
        key={`right-box-${i}`} 
        position={[1.2 + (i % 3) * 0.35, 0.5 + Math.floor(i / 3) * 0.35, 0]} 
      />
    );
  }
  for (let i = 0; i < rightSide.apples; i++) {
    rightItems.push(
      <Apple 
        key={`right-apple-${i}`} 
        position={[1.2 + (i % 4) * 0.25, 0.3 + Math.floor(i / 4) * 0.25, 0.3]} 
      />
    );
  }

  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.3, 32]} />
        <meshStandardMaterial color="#78716c" roughness={0.7} />
      </mesh>

      {/* Center pole */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.3, 16]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.5} />
      </mesh>

      {/* Beam */}
      <group position={[0, 0.95, 0]} rotation={[0, 0, tiltAngle]}>
        <mesh castShadow>
          <boxGeometry args={[3, 0.08, 0.15]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.5} />
        </mesh>

        {/* Left platform */}
        <group position={[-1.2, -0.15, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.6} />
          </mesh>
          {leftItems}
        </group>

        {/* Right platform */}
        <group position={[1.2, -0.15, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.6} />
          </mesh>
          {rightItems}
        </group>
      </group>
    </group>
  );
}

function Garden() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>

      {/* Flowers */}
      {[-3, -2, 2, 3].map((x, i) => (
        <Float key={i} speed={1} floatIntensity={0.1}>
          <group position={[x, -0.6, 2]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={['#f472b6', '#fbbf24', '#a78bfa', '#fb923c'][i]} />
            </mesh>
          </group>
        </Float>
      ))}

      {/* Trees in background */}
      {[-4, 4].map((x, i) => (
        <group key={i} position={[x, 0, -3]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[0.8, 1.5, 8]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function BalanceGardenScene({ 
  phase, 
  leftSide, 
  rightSide, 
  onAnimationComplete 
}: BalanceGardenSceneProps) {
  useEffect(() => {
    if (phase === 'animation') {
      const timer = setTimeout(onAnimationComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onAnimationComplete]);

  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 2, 5], fov: 50 }}
      className="w-full h-full"
    >
      <color attach="background" args={['#ecfdf5']} />
      <fog attach="fog" args={['#ecfdf5', 8, 20]} />
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 8, 3]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, 2]} intensity={0.3} color="#fef3c7" />

      <Garden />
      <BalanceScale leftSide={leftSide} rightSide={rightSide} phase={phase} />

      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
