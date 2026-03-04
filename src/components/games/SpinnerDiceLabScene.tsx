import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface SpinnerDiceLabSceneProps {
  phase: 'tutorial' | 'animation' | 'play' | 'quiz' | 'complete';
  onAnimationComplete: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

function SpinnerWheel({ position, sections, isSpinning, onSpinComplete }: {
  position: [number, number, number];
  sections: { color: string; size: number; label: string }[];
  isSpinning: boolean;
  onSpinComplete: (landedSection: number) => void;
}) {
  const wheelRef = useRef<THREE.Group>(null);
  const spinSpeedRef = useRef(0);
  const rotationRef = useRef(0);
  const isSpinningRef = useRef(false);

  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      isSpinningRef.current = true;
      spinSpeedRef.current = 0.4 + Math.random() * 0.3;
    }
  }, [isSpinning]);

  // Pre-compute geometries once
  const sectionGeometries = useMemo(() => {
    let startAngle = 0;
    return sections.map((section) => {
      const angle = section.size * Math.PI * 2;
      const geo = new THREE.RingGeometry(0.3, 2, 32, 1, startAngle, angle);
      startAngle += angle;
      return geo;
    });
  }, [sections]);

  useFrame(() => {
    if (wheelRef.current) {
      if (isSpinningRef.current) {
        spinSpeedRef.current *= 0.985;
        rotationRef.current += spinSpeedRef.current;
        wheelRef.current.rotation.z = rotationRef.current;

        if (spinSpeedRef.current < 0.005) {
          isSpinningRef.current = false;
          // Calculate landed section
          const normalizedRotation = ((rotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          // The pointer is at top (PI/2), so we need to find which section is there
          const pointerAngle = ((Math.PI / 2 - normalizedRotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          let cumulative = 0;
          let landedSection = 0;
          for (let i = 0; i < sections.length; i++) {
            cumulative += sections[i].size * Math.PI * 2;
            if (pointerAngle < cumulative) {
              landedSection = i;
              break;
            }
          }
          onSpinComplete(landedSection);
        }
      }
    }
  });

  // Calculate label positions
  const labelPositions = useMemo(() => {
    let startAngle = 0;
    return sections.map((section) => {
      const angle = section.size * Math.PI * 2;
      const midAngle = startAngle + angle / 2;
      startAngle += angle;
      return {
        x: Math.cos(midAngle) * 1.2,
        y: Math.sin(midAngle) * 1.2,
        angle: midAngle,
      };
    });
  }, [sections]);

  return (
    <group position={position}>
      {/* The rotating wheel */}
      <group ref={wheelRef}>
        {sections.map((section, i) => (
          <mesh key={i}>
            <primitive object={sectionGeometries[i]} attach="geometry" />
            <meshStandardMaterial color={section.color} side={THREE.DoubleSide} />
          </mesh>
        ))}
        
        {/* Section labels on wheel */}
        {labelPositions.map((pos, i) => (
          <Html key={i} position={[pos.x, pos.y, 0.1]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
            }}>
              {sections[i].label}
            </div>
          </Html>
        ))}

        {/* Center pin */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#444" metalness={0.6} />
        </mesh>
      </group>

      {/* Pointer - OUTSIDE rotating group so it stays fixed */}
      <mesh position={[0, 2.2, 0.15]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.2, 0.5, 3]} />
        <meshStandardMaterial color="#FF4444" emissive="#FF2222" emissiveIntensity={0.3} />
      </mesh>

      {/* Wheel border */}
      <mesh>
        <torusGeometry args={[2, 0.08, 16, 64]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
    </group>
  );
}

function PredictionButton({ position, color, label, percentage, onClick, isActive, isSelected }: {
  position: [number, number, number];
  color: string;
  label: string;
  percentage: number;
  onClick: () => void;
  isActive: boolean;
  isSelected: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.08);
      } else if (hovered && isActive) {
        meshRef.current.scale.setScalar(1.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={isActive ? onClick : undefined}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.4, 0.7, 0.3]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isSelected ? color : (hovered && isActive ? color : '#000')}
          emissiveIntensity={isSelected ? 0.4 : (hovered && isActive ? 0.2 : 0)}
        />
      </mesh>
      <Html position={[0, 0, 0.2]} center style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {label}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
            {percentage}% chance
          </div>
        </div>
      </Html>
    </group>
  );
}

function LabTable() {
  return (
    <group>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 6]} />
        <meshStandardMaterial color="#8B7355" roughness={0.8} />
      </mesh>
      {[[-3.5, -1.5, -2.5], [3.5, -1.5, -2.5], [-3.5, -1.5, 2.5], [3.5, -1.5, 2.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.15, 0.15, 2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
    </group>
  );
}

export function SpinnerDiceLabScene({ phase, onAnimationComplete, onCorrect, onIncorrect }: SpinnerDiceLabSceneProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  // Spinner configurations with clear percentages
  const rounds = useMemo(() => [
    { 
      sections: [
        { color: '#4169E1', size: 0.6, label: 'Blue' },
        { color: '#FF6347', size: 0.25, label: 'Red' },
        { color: '#32CD32', size: 0.15, label: 'Green' },
      ],
      correctColor: '#4169E1',
      correctLabel: 'Blue',
    },
    { 
      sections: [
        { color: '#FFD700', size: 0.5, label: 'Gold' },
        { color: '#9370DB', size: 0.3, label: 'Purple' },
        { color: '#FF69B4', size: 0.2, label: 'Pink' },
      ],
      correctColor: '#FFD700',
      correctLabel: 'Gold',
    },
    { 
      sections: [
        { color: '#20B2AA', size: 0.1, label: 'Teal' },
        { color: '#FF8C00', size: 0.7, label: 'Orange' },
        { color: '#BA55D3', size: 0.2, label: 'Violet' },
      ],
      correctColor: '#FF8C00',
      correctLabel: 'Orange',
    },
  ], []);

  const currentConfig = rounds[currentRound % rounds.length];

  useEffect(() => {
    if (phase === 'animation') {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onAnimationComplete]);

  const handleColorSelect = (color: string) => {
    if (phase !== 'play' || isSpinning || selectedColor) return;
    setSelectedColor(color);
    setIsSpinning(true);
  };

  const handleSpinComplete = (landedSection: number) => {
    setIsSpinning(false);
    setShowResult(true);
    
    const isCorrectPick = selectedColor === currentConfig.correctColor;
    
    if (isCorrectPick) {
      setResultMessage(`✓ Correct! ${currentConfig.correctLabel} has the biggest section = highest probability!`);
    } else {
      setResultMessage(`The biggest section (${currentConfig.correctLabel}) has the highest chance of winning.`);
    }
    
    setTimeout(() => {
      if (isCorrectPick) {
        onCorrect();
        setCurrentRound(prev => prev + 1);
      } else {
        onIncorrect();
      }
      setSelectedColor(null);
      setShowResult(false);
      setResultMessage('');
    }, 2000);
  };

  return (
    <group>
      <LabTable />
      
      {/* Spinner wheel */}
      <SpinnerWheel
        position={[0, 0.5, 0]}
        sections={currentConfig.sections}
        isSpinning={isSpinning}
        onSpinComplete={handleSpinComplete}
      />

      {/* Prediction buttons - clear labels with percentages */}
      <group position={[0, -0.3, 3.5]}>
        {currentConfig.sections.map((section, i) => (
          <PredictionButton
            key={`${currentRound}-${i}`}
            position={[(i - 1) * 1.8, 0, 0]}
            color={section.color}
            label={section.label}
            percentage={Math.round(section.size * 100)}
            onClick={() => handleColorSelect(section.color)}
            isActive={phase === 'play' && !isSpinning && !selectedColor}
            isSelected={selectedColor === section.color}
          />
        ))}
      </group>

      {/* Instructions */}
      {phase === 'play' && !isSpinning && !showResult && (
        <Html position={[0, 3.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
            Which color is MOST likely to win? Pick one!
          </div>
        </Html>
      )}

      {/* Result feedback */}
      {showResult && resultMessage && (
        <Html position={[0, 3, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: selectedColor === currentConfig.correctColor ? 'rgba(34,197,94,0.95)' : 'rgba(234,179,8,0.95)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            maxWidth: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}>
            {resultMessage}
          </div>
        </Html>
      )}

      {/* Animation phase text */}
      {phase === 'animation' && (
        <Html position={[0, 3.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '15px',
            color: '#666',
            whiteSpace: 'nowrap',
          }}>
            🎯 Look at the spinner sections — bigger = more likely!
          </div>
        </Html>
      )}
    </group>
  );
}
