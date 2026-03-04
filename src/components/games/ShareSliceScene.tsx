import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface ShareSliceSceneProps {
  phase: 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz' | 'complete';
  slices: number;
  targetPeople: number;
  servedPlates: number[];
  onServeSlice: (personIndex: number) => void;
  onAnimationComplete: () => void;
}

// Individual draggable pizza slice
function PizzaSlice({
  index,
  totalSlices,
  radius,
  served,
  highlighted,
  onPointerDown,
}: {
  index: number;
  totalSlices: number;
  radius: number;
  served: boolean;
  highlighted: boolean;
  onPointerDown: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const sliceAngle = (Math.PI * 2) / totalSlices;
  const startAngle = index * sliceAngle;
  const midAngle = startAngle + sliceAngle / 2;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, startAngle, startAngle + sliceAngle, false);
  shape.lineTo(0, 0);

  const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };

  const colors = ['#E74C3C', '#E67E22', '#F1C40F', '#27AE60', '#3498DB', '#9B59B6', '#1ABC9C', '#E84393', '#FD79A8', '#00CEC9', '#6C5CE7', '#FDCB6E'];

  useFrame((state) => {
    if (meshRef.current && !served) {
      meshRef.current.position.y = highlighted
        ? 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.05
        : 0.15;
    }
  });

  if (served) return null;

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.15, 0]}
      onPointerDown={(e) => { e.stopPropagation(); onPointerDown(); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'grab'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color={highlighted ? '#FFD700' : colors[index % colors.length]}
        roughness={0.4}
        metalness={0.1}
        emissive={highlighted ? '#FFD700' : '#000000'}
        emissiveIntensity={highlighted ? 0.3 : 0}
      />
    </mesh>
  );
}

// Pizza base with cut lines
function PizzaBase({ slices, radius }: { slices: number; radius: number }) {
  const sliceAngle = (Math.PI * 2) / slices;

  return (
    <group>
      {/* Base circle */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius + 0.05, 64]} />
        <meshStandardMaterial color="#F5DEB3" roughness={0.8} />
      </mesh>
      {/* Crust ring */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[radius - 0.02, 0.1, 12, 64]} />
        <meshStandardMaterial color="#D2691E" roughness={0.6} />
      </mesh>
      {/* Cut lines */}
      {Array.from({ length: slices }).map((_, i) => {
        const angle = i * sliceAngle;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * (radius / 2), 0.14, Math.sin(angle) * (radius / 2)]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <boxGeometry args={[radius, 0.01, 0.015]} />
            <meshStandardMaterial color="#8B4513" opacity={0.7} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

// Character (person) with plate
function Person({
  position,
  index,
  slicesReceived,
  color,
  isTarget,
  onDrop,
}: {
  position: [number, number, number];
  index: number;
  slicesReceived: number;
  color: string;
  isTarget: boolean;
  onDrop: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const happy = slicesReceived > 0;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.04;
      if (happy) {
        groupRef.current.position.y += Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.08;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={(e) => { e.stopPropagation(); onDrop(); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 1.15, 0.22]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.1, 1.15, 0.22]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, 1.0, 0.26]} rotation={[0, 0, happy ? 0 : Math.PI]}>
        <torusGeometry args={[0.07, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color={happy ? '#FF6B6B' : '#999'} />
      </mesh>

      {/* Plate */}
      <mesh position={[0, 0.05, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color={isTarget ? '#FFE082' : '#ECEFF1'} emissive={isTarget ? '#FFD700' : '#000'} emissiveIntensity={isTarget ? 0.4 : 0} />
      </mesh>
      <mesh position={[0, 0.06, 0.6]}>
        <torusGeometry args={[0.33, 0.03, 8, 24]} />
        <meshStandardMaterial color={isTarget ? '#FFC107' : '#B0BEC5'} />
      </mesh>

      {/* Slices on plate */}
      {Array.from({ length: slicesReceived }).map((_, i) => (
        <mesh key={i} position={[0, 0.1 + i * 0.06, 0.6]} rotation={[-Math.PI / 2, i * 0.8, 0]}>
          <coneGeometry args={[0.2, 0.04, 3]} />
          <meshStandardMaterial color="#E74C3C" />
        </mesh>
      ))}

      {/* Slice count label */}
      <Text
        position={[0, -0.15, 0.6]}
        fontSize={0.2}
        color={slicesReceived > 0 ? '#27AE60' : '#999'}
        anchorX="center"
        anchorY="middle"
      >
        {slicesReceived > 0 ? `${slicesReceived}` : '?'}
      </Text>
    </group>
  );
}

// Table
function Table() {
  return (
    <group>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.15, 32]} />
        <meshStandardMaterial color="#DEB887" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.4, 32]} />
        <meshStandardMaterial color="#FFE4E1" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.3, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

// Confetti on success
function Confetti() {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={3 + Math.random() * 2} floatIntensity={1}>
          <mesh position={[(Math.random() - 0.5) * 6, 2 + Math.random() * 2, (Math.random() - 0.5) * 6]}>
            <boxGeometry args={[0.1, 0.1, 0.01]} />
            <meshStandardMaterial color={['#E74C3C', '#3498DB', '#F1C40F', '#2ECC71', '#9B59B6'][i % 5]} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export function ShareSliceScene({
  phase,
  slices,
  targetPeople,
  servedPlates,
  onServeSlice,
  onAnimationComplete,
}: ShareSliceSceneProps) {
  const [animatedSlices, setAnimatedSlices] = useState(2);
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);

  // Character positions
  const characterColors = ['#87CEEB', '#DDA0DD', '#98D8C8', '#F7DC6F', '#C39BD3', '#85C1E9'];
  const characterPositions: [number, number, number][] = [];
  for (let i = 0; i < targetPeople; i++) {
    const angle = (i / targetPeople) * Math.PI * 2 + Math.PI / 2;
    characterPositions.push([Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5]);
  }

  // Animation phase
  useEffect(() => {
    if (phase === 'animation') {
      let cur = 2;
      const timer = setInterval(() => {
        cur += 2;
        setAnimatedSlices(cur);
        if (cur >= 8) {
          clearInterval(timer);
          setTimeout(onAnimationComplete, 500);
        }
      }, 800);
      return () => clearInterval(timer);
    }
  }, [phase, onAnimationComplete]);

  const handleSliceClick = useCallback((idx: number) => {
    if (phase !== 'interaction') return;
    setSelectedSlice(prev => prev === idx ? null : idx);
  }, [phase]);

  const handlePersonClick = useCallback((personIdx: number) => {
    if (phase !== 'interaction' || selectedSlice === null) return;
    onServeSlice(personIdx);
    setSelectedSlice(null);
  }, [phase, selectedSlice, onServeSlice]);

  const currentSlices = phase === 'animation' ? animatedSlices : slices;
  const isSuccess = phase === 'success';
  const totalServed = servedPlates.reduce((a, b) => a + b, 0);
  const remainingSlices = currentSlices - totalServed;

  // Which slices are still on the pizza
  const servedSliceIndices = new Set<number>();
  let servedCount = 0;
  for (let i = 0; i < currentSlices && servedCount < totalServed; i++) {
    servedSliceIndices.add(i);
    servedCount++;
  }

  return (
    <group>
      <Table />
      <PizzaBase slices={currentSlices} radius={1.8} />

      {/* Individual slices */}
      {Array.from({ length: currentSlices }).map((_, i) => (
        <PizzaSlice
          key={`${currentSlices}-${i}`}
          index={i}
          totalSlices={currentSlices}
          radius={1.75}
          served={servedSliceIndices.has(i)}
          highlighted={selectedSlice === i}
          onPointerDown={() => handleSliceClick(i)}
        />
      ))}

      {/* People */}
      {characterPositions.map((pos, i) => (
        <Person
          key={i}
          position={pos}
          index={i}
          slicesReceived={servedPlates[i] || 0}
          color={characterColors[i % characterColors.length]}
          isTarget={selectedSlice !== null}
          onDrop={() => handlePersonClick(i)}
        />
      ))}

      {/* Info text */}
      {phase === 'animation' && (
        <Text position={[0, 3, 0]} fontSize={0.35} color="#4A4A4A" anchorX="center" anchorY="middle">
          Watch how we slice the pizza...
        </Text>
      )}

      {phase === 'interaction' && (
        <group position={[0, 3.2, 0]}>
          <Text fontSize={0.28} color="#333" anchorX="center" anchorY="middle">
            {selectedSlice !== null
              ? 'Now tap a friend to give them the slice!'
              : `Tap a slice, then tap a friend to serve it`}
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.22} color="#666" anchorX="center" anchorY="middle">
            {`${remainingSlices} slices left • ${targetPeople} friends to serve`}
          </Text>
          <Text position={[0, -0.8, 0]} fontSize={0.2} color="#999" anchorX="center" anchorY="middle">
            {`Each slice = 1/${currentSlices} of the pizza`}
          </Text>
        </group>
      )}

      {isSuccess && (
        <>
          <Text position={[0, 3.5, 0]} fontSize={0.4} color="#27AE60" anchorX="center" anchorY="middle">
            {'\u{1F389}'} Everyone got equal shares!
          </Text>
          <Confetti />
        </>
      )}

      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#2d3436" />
    </group>
  );
}
