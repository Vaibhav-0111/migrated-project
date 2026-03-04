import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface LiquidLabSceneProps {
  phase: 'tutorial' | 'animation' | 'play' | 'quiz' | 'complete';
  onAnimationComplete: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

function Beaker({ position, fillLevel, targetLevel, color, onClick, label }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (liquidRef.current) {
      // Animate liquid surface
      liquidRef.current.position.y = -0.9 + (fillLevel * 1.8);
      const scale = 0.01 + Math.sin(state.clock.elapsedTime * 2) * 0.003;
      liquidRef.current.scale.y = fillLevel + scale;
    }
    if (groupRef.current && hovered) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glass cylinder */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 2, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={0}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Bottom */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Liquid */}
      <mesh ref={liquidRef} position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 1.8, 32]} />
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Target line */}
      {targetLevel !== undefined && (
        <mesh position={[0, -1 + targetLevel * 2, 0.65]}>
          <boxGeometry args={[0.02, 0.02, 0.1]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Level markers */}
      {[0.25, 0.5, 0.75].map((level, i) => (
        <mesh key={i} position={[0.62, -1 + level * 2, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="#aaa" />
        </mesh>
      ))}

      {/* Label */}
      <Text
        position={[0, -1.5, 0.7]}
        fontSize={0.2}
        color="#666666"
        anchorX="center"
      >
        {label}
      </Text>

      {/* Percentage ring */}
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.08, 16, 32, Math.PI * 2 * fillLevel]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function LabTable() {
  return (
    <group>
      {/* Table surface */}
      <mesh position={[0, -2, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 4]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
      </mesh>
      {/* Table legs */}
      {[[-3.5, -3, -1.5], [3.5, -3, -1.5], [-3.5, -3, 1.5], [3.5, -3, 1.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
          <meshStandardMaterial color="#999" />
        </mesh>
      ))}
    </group>
  );
}

export function LiquidLabScene({ phase, onAnimationComplete, onCorrect, onIncorrect }: LiquidLabSceneProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [beakers, setBeakers] = useState([
    { id: 0, fillLevel: 0.5, color: '#4ecdc4', label: '1/2' },
    { id: 1, fillLevel: 0.25, color: '#ff6b6b', label: '1/4' },
    { id: 2, fillLevel: 0.75, color: '#95e1d3', label: '3/4' },
  ]);
  const [targetLevel] = useState(0.5);
  const [selectedBeaker, setSelectedBeaker] = useState<number | null>(null);

  useEffect(() => {
    if (phase === 'animation') {
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 1) {
            clearInterval(timer);
            onAnimationComplete();
            return 1;
          }
          return prev + 0.02;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [phase, onAnimationComplete]);

  const handleBeakerClick = (id: number) => {
    if (phase !== 'play') return;
    
    setSelectedBeaker(id);
    const beaker = beakers[id];
    
    if (Math.abs(beaker.fillLevel - targetLevel) < 0.1) {
      onCorrect();
    } else {
      onIncorrect();
    }
  };

  return (
    <group>
      <LabTable />
      
      {/* Beakers */}
      {beakers.map((beaker, i) => (
        <Beaker
          key={beaker.id}
          position={[-2.5 + i * 2.5, 0, 0]}
          fillLevel={beaker.fillLevel}
          targetLevel={i === 0 ? targetLevel : undefined}
          color={beaker.color}
          label={beaker.label}
          onClick={() => handleBeakerClick(beaker.id)}
        />
      ))}

      {/* Instruction text */}
      {phase === 'play' && (
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.3}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Tap the beaker that shows 50%
        </Text>
      )}

      {/* Animation phase */}
      {phase === 'animation' && (
        <>
          <Text
            position={[0, 3.5, 0]}
            fontSize={0.25}
            color="#666666"
            anchorX="center"
          >
            Watch: Fractions = Decimals = Percentages
          </Text>
          <Text
            position={[0, 3, 0]}
            fontSize={0.2}
            color="#888888"
            anchorX="center"
          >
            1/2 = 0.5 = 50%
          </Text>
        </>
      )}
    </group>
  );
}
