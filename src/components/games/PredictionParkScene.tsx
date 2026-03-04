import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

interface PredictionParkSceneProps {
  phase: 'tutorial' | 'animation' | 'play' | 'quiz' | 'complete';
  onAnimationComplete: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  diceResult?: number | null;
  results?: Record<string, number>;
}

function ResultBar({ position, color, height, label, maxHeight = 4 }: {
  position: [number, number, number];
  color: string;
  height: number;
  label: string;
  maxHeight?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentHeight, setCurrentHeight] = useState(0);

  useFrame(() => {
    if (meshRef.current) {
      const targetHeight = Math.min((height / 15) * maxHeight, maxHeight);
      setCurrentHeight(prev => prev + (targetHeight - prev) * 0.08);
      meshRef.current.scale.y = Math.max(0.05, currentHeight);
      meshRef.current.position.y = currentHeight / 2 + 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.6, 1, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      
      {/* Label */}
      <Text position={[0, -0.4, 0.4]} fontSize={0.25} color="#333" anchorX="center">
        {label}
      </Text>
      
      {/* Count */}
      <Text position={[0, currentHeight + 0.4, 0]} fontSize={0.3} color={color} anchorX="center" fontWeight="bold">
        {height}
      </Text>
    </group>
  );
}

function Dice3D({ position, rolling, result }: {
  position: [number, number, number];
  rolling: boolean;
  result: number | null;
}) {
  const diceRef = useRef<THREE.Group>(null);
  const [rollSpeed, setRollSpeed] = useState(0);

  useEffect(() => {
    if (rolling) setRollSpeed(0.5);
  }, [rolling]);

  useFrame(() => {
    if (diceRef.current) {
      if (rollSpeed > 0.01) {
        diceRef.current.rotation.x += rollSpeed;
        diceRef.current.rotation.z += rollSpeed * 0.7;
        diceRef.current.position.y = position[1] + Math.abs(Math.sin(diceRef.current.rotation.x * 2)) * 1.5;
        setRollSpeed(prev => prev * 0.97);
      } else if (result) {
        // Settle to show result face
        const targetRotX = result <= 3 ? 0 : Math.PI;
        const targetRotZ = 0;
        diceRef.current.rotation.x += (targetRotX - diceRef.current.rotation.x) * 0.1;
        diceRef.current.rotation.z += (targetRotZ - diceRef.current.rotation.z) * 0.1;
        diceRef.current.position.y += (position[1] + 0.5 - diceRef.current.position.y) * 0.1;
      }
    }
  });

  const dotPositions: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-0.15, -0.15], [0.15, 0.15]],
    3: [[-0.15, -0.15], [0, 0], [0.15, 0.15]],
    4: [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]],
    5: [[-0.15, -0.15], [0.15, -0.15], [0, 0], [-0.15, 0.15], [0.15, 0.15]],
    6: [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0], [0.15, 0], [-0.15, 0.15], [0.15, 0.15]],
  };

  return (
    <group ref={diceRef} position={[position[0], position[1] + 0.5, position[2]]}>
      {/* Dice body */}
      <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </RoundedBox>
      
      {/* Front face dots */}
      {result && dotPositions[result]?.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.42]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

function ParkEnvironment() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>

      {/* Platform for dice */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>

      {/* Ring around platform */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[2, 0.08, 16, 64]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Trees */}
      {[[-5, 0, -3], [5, 0, -3], [-5, 0, 5], [5, 0, 5]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Decorative fence posts */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={`fence-${i}`} position={[Math.cos(angle) * 8, 0, Math.sin(angle) * 8]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1]} />
              <meshStandardMaterial color="#D2691E" />
            </mesh>
            <Float speed={2} floatIntensity={0.3}>
              <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
              </mesh>
            </Float>
          </group>
        );
      })}
    </group>
  );
}

export function PredictionParkScene({ 
  phase, 
  onAnimationComplete, 
  onCorrect, 
  onIncorrect, 
  diceResult = null,
  results = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 }
}: PredictionParkSceneProps) {
  const [localResults, setLocalResults] = useState<Record<string, number>>({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
  const [experimentCount, setExperimentCount] = useState(0);

  // Use parent results if provided
  const displayResults = Object.values(results).some(v => v > 0) ? results : localResults;

  useEffect(() => {
    if (phase === 'animation') {
      const interval = setInterval(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setLocalResults(prev => ({ ...prev, [roll.toString()]: prev[roll.toString()] + 1 }));
        
        setExperimentCount(prev => {
          if (prev + 1 >= 20) {
            clearInterval(interval);
            setTimeout(onAnimationComplete, 800);
          }
          return prev + 1;
        });
      }, 150);
      
      return () => clearInterval(interval);
    }
  }, [phase, onAnimationComplete]);

  const barColors = ['#FF6347', '#FF8C00', '#FFD700', '#32CD32', '#4169E1', '#8A2BE2'];

  return (
    <group>
      <ParkEnvironment />

      {/* 3D Dice */}
      <Dice3D position={[0, 0, 0]} rolling={diceResult === null && phase === 'play'} result={diceResult} />

      {/* Result bars arranged in a semicircle behind dice */}
      <group position={[0, 0, -4]}>
        {['1', '2', '3', '4', '5', '6'].map((num, i) => (
          <ResultBar
            key={num}
            position={[(i - 2.5) * 1.2, 0, 0]}
            color={barColors[i]}
            height={displayResults[num] || 0}
            label={num}
          />
        ))}
      </group>

      {/* Phase text */}
      {phase === 'animation' && (
        <Text position={[0, 5, 0]} fontSize={0.4} color="#333" anchorX="center">
          {`Rolling dice... (${experimentCount}/20)`}
        </Text>
      )}
    </group>
  );
}
