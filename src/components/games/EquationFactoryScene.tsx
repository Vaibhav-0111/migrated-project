import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface EquationFactorySceneProps {
  phase: 'animation' | 'interaction' | 'success' | 'helper';
  leftBlocks: number;
  rightBlocks: number;
  variableCoeff: number;
  onAnimationComplete: () => void;
}

function ConveyorBelt({ position, length = 3 }: { position: [number, number, number]; length?: number }) {
  const beltRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (beltRef.current) {
      const material = beltRef.current.material as THREE.MeshStandardMaterial;
      if (material.map) {
        material.map.offset.x = state.clock.elapsedTime * 0.2;
      }
    }
  });

  return (
    <group position={position}>
      {/* Belt */}
      <mesh ref={beltRef} receiveShadow>
        <boxGeometry args={[length, 0.1, 0.8]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>
      {/* Supports */}
      {[-length/2 + 0.2, length/2 - 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.25, 0]} castShadow>
          <boxGeometry args={[0.15, 0.4, 0.6]} />
          <meshStandardMaterial color="#6b7280" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function NumberBlock({ position, value }: { position: [number, number, number]; value: number }) {
  return (
    <Float speed={2} floatIntensity={0.1}>
      <group position={position}>
        <RoundedBox args={[0.3, 0.3, 0.3]} radius={0.05} castShadow>
          <meshStandardMaterial color="#3b82f6" roughness={0.3} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.16]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {value}
        </Text>
      </group>
    </Float>
  );
}

function VariableCube({ position, coefficient }: { position: [number, number, number]; coefficient: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.2}>
      <group position={position}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            roughness={0.2}
            emissive="#8b5cf6"
            emissiveIntensity={0.4}
          />
        </mesh>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {coefficient > 1 ? `${coefficient}x` : 'x'}
        </Text>
      </group>
    </Float>
  );
}

function Machine({ position, type }: { position: [number, number, number]; type: 'add' | 'remove' }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.6, 0.8, 0.5]} radius={0.08} castShadow>
        <meshStandardMaterial 
          color={type === 'add' ? '#22c55e' : '#ef4444'} 
          roughness={0.4}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.26]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {type === 'add' ? '+' : '-'}
      </Text>
    </group>
  );
}

function Factory({ leftBlocks, rightBlocks, variableCoeff }: { leftBlocks: number; rightBlocks: number; variableCoeff: number }) {
  return (
    <group>
      {/* Left conveyor */}
      <ConveyorBelt position={[-2, 0, 0]} length={2.5} />
      
      {/* Right conveyor */}
      <ConveyorBelt position={[2, 0, 0]} length={2.5} />

      {/* Equals sign in center */}
      <group position={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.08, 0.1]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.3, 0.08, 0.1]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Variable cube on left */}
      <VariableCube position={[-2.5, 0.35, 0]} coefficient={variableCoeff} />

      {/* Number blocks on left */}
      {Array.from({ length: Math.min(leftBlocks, 6) }).map((_, i) => (
        <NumberBlock 
          key={`left-${i}`} 
          position={[-1.8 + i * 0.35, 0.25, 0]} 
          value={1} 
        />
      ))}

      {/* Number blocks on right */}
      {Array.from({ length: Math.min(rightBlocks, 8) }).map((_, i) => (
        <NumberBlock 
          key={`right-${i}`} 
          position={[1.2 + (i % 4) * 0.35, 0.25 + Math.floor(i / 4) * 0.35, 0]} 
          value={1} 
        />
      ))}

      {/* Machines */}
      <Machine position={[-3.5, 0.4, 1]} type="add" />
      <Machine position={[3.5, 0.4, 1]} type="remove" />

      {/* Factory floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.8} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.5, -3]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function EquationFactoryScene({ 
  phase, 
  leftBlocks, 
  rightBlocks, 
  variableCoeff,
  onAnimationComplete 
}: EquationFactorySceneProps) {
  useEffect(() => {
    if (phase === 'animation') {
      const timer = setTimeout(onAnimationComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onAnimationComplete]);

  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 3, 6], fov: 50 }}
      className="w-full h-full"
    >
      <color attach="background" args={['#f5f3ff']} />
      <fog attach="fog" args={['#f5f3ff', 10, 25]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 3, 2]} intensity={0.4} color="#c4b5fd" />
      <pointLight position={[3, 3, 2]} intensity={0.4} color="#93c5fd" />

      <Factory leftBlocks={leftBlocks} rightBlocks={rightBlocks} variableCoeff={variableCoeff} />

      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}
