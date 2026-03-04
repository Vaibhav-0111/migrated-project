import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface MoneyGardenSceneProps {
  phase: 'tutorial' | 'animation' | 'play' | 'quiz' | 'complete';
  principal: number;
  rate: number;
  years: number;
  showCompound: boolean;
  onAnimationComplete: () => void;
}

// A money tree that grows proportional to amount
function MoneyTree({ position, amount, maxAmount, label, color }: {
  position: [number, number, number];
  amount: number;
  maxAmount: number;
  label: string;
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetHeight = 0.5 + (amount / maxAmount) * 4;
  const currentHeight = useRef(0.5);

  useFrame(() => {
    currentHeight.current += (targetHeight - currentHeight.current) * 0.05;
    if (groupRef.current) {
      groupRef.current.scale.y = currentHeight.current;
    }
  });

  const coinCount = Math.min(Math.floor(amount / (maxAmount / 8)), 8);

  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.4, 16]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.1, 16]} />
        <meshStandardMaterial color="#5d4e37" roughness={0.9} />
      </mesh>

      {/* Trunk - scales with amount */}
      <group ref={groupRef}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
          <meshStandardMaterial color="#6B4423" />
        </mesh>
      </group>

      {/* Canopy - scales with amount */}
      <mesh position={[0, 0.5 + targetHeight * 0.8, 0]} scale={[0.3 + targetHeight * 0.2, 0.3 + targetHeight * 0.15, 0.3 + targetHeight * 0.2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Coins on branches */}
      {Array.from({ length: coinCount }).map((_, i) => {
        const angle = (i / coinCount) * Math.PI * 2;
        const radius = 0.3 + targetHeight * 0.15;
        const y = 0.4 + targetHeight * 0.7 + Math.sin(i * 1.5) * 0.2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]} rotation={[Math.PI / 2, 0, angle]}>
            <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}

      {/* Label */}
      <Html position={[0, -0.2, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '4px 12px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#333',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#888' }}>{label}</div>
          <div style={{ color }}>₹{Math.round(amount).toLocaleString()}</div>
        </div>
      </Html>
    </group>
  );
}

// Year markers on ground
function Timeline({ years, position }: { years: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: years + 1 }).map((_, i) => (
        <group key={i} position={[i * 1.5 - (years * 0.75), 0, 0]}>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.15, 16]} />
            <meshStandardMaterial color="#DAA520" />
          </mesh>
          <Html position={[0, 0.1, 0.5]} center style={{ pointerEvents: 'none' }}>
            <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
              Year {i}
            </div>
          </Html>
        </group>
      ))}
      {/* Line connecting years */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[years * 1.5, 0.05]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
    </group>
  );
}

function GardenGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[3, 5, 32]} />
        <meshStandardMaterial color="#7CCD7C" />
      </mesh>
    </group>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 2 + 5;
    }
  });
  return (
    <mesh ref={ref} position={[5, 6, -5]}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial color="#FFD700" />
    </mesh>
  );
}

export function MoneyGardenScene({ phase, principal, rate, years, showCompound, onAnimationComplete }: MoneyGardenSceneProps) {
  const [animProgress, setAnimProgress] = useState(0);

  // Calculate amounts
  const simpleAmount = principal * (1 + (rate / 100) * years);
  const compoundAmount = principal * Math.pow(1 + rate / 100, years);
  const maxAmount = Math.max(simpleAmount, compoundAmount, principal * 2);

  useEffect(() => {
    if (phase === 'animation') {
      setAnimProgress(0);
      const timer = setInterval(() => {
        setAnimProgress(prev => {
          if (prev >= 1) {
            clearInterval(timer);
            setTimeout(onAnimationComplete, 500);
            return 1;
          }
          return prev + 0.015;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [phase, onAnimationComplete]);

  const displayPrincipal = phase === 'animation' ? principal : principal;
  const displaySimple = phase === 'animation' 
    ? principal + (simpleAmount - principal) * animProgress 
    : simpleAmount;
  const displayCompound = phase === 'animation'
    ? principal + (compoundAmount - principal) * animProgress
    : compoundAmount;

  return (
    <group>
      <GardenGround />
      <Sun />

      {/* Principal tree (always shown) */}
      <MoneyTree
        position={[-2.5, 0, 0]}
        amount={displayPrincipal}
        maxAmount={maxAmount}
        label="Principal"
        color="#4CAF50"
      />

      {/* Simple Interest tree */}
      <MoneyTree
        position={[0, 0, 0]}
        amount={displaySimple}
        maxAmount={maxAmount}
        label="Simple Interest"
        color="#2196F3"
      />

      {/* Compound Interest tree (shown when toggled) */}
      {showCompound && (
        <MoneyTree
          position={[2.5, 0, 0]}
          amount={displayCompound}
          maxAmount={maxAmount}
          label="Compound Interest"
          color="#FF9800"
        />
      )}

      {/* Timeline */}
      <Timeline years={years} position={[0, 0, 3]} />

      {/* Difference label */}
      {showCompound && phase !== 'animation' && (
        <Html position={[0, 4, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#333',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              Compound earns <span style={{ color: '#FF9800' }}>₹{Math.round(compoundAmount - simpleAmount).toLocaleString()}</span> more!
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              SI: ₹{Math.round(simpleAmount).toLocaleString()} vs CI: ₹{Math.round(compoundAmount).toLocaleString()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
