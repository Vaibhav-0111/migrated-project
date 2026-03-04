import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface SceneProps {
  phase: 'animation' | 'interaction' | 'success' | 'helper';
  theta: number;
  onThetaChange: (theta: number) => void;
  onAnimationComplete: () => void;
}

// Animated wave mesh
function WaveRibbon({ 
  color, 
  amplitude, 
  offset = 0,
  position 
}: { 
  color: string; 
  amplitude: number; 
  offset?: number;
  position: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(8, 0.5, 64, 1);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = clock.getElapsedTime();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const wave = Math.sin(x * 1.5 + time * 2 + offset) * amplitude;
        positions.setZ(i, wave);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} rotation={[-Math.PI / 6, 0, 0]}>
      <meshStandardMaterial 
        color={color} 
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Energy orb that pulses based on value
function EnergyOrb({ 
  position, 
  color, 
  energy, 
  label 
}: { 
  position: [number, number, number]; 
  color: string; 
  energy: number;
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.05;
      const scale = 0.3 + energy * 0.5;
      meshRef.current.scale.setScalar(scale * pulse);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.5 + energy * 0.8);
    }
  });

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      
      {/* Core orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.2}
          radius={1}
        />
      </mesh>
      
      {/* Floating particles around orb */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Float key={i} speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh 
            position={[
              Math.cos(i * Math.PI / 3) * (0.6 + energy * 0.3),
              Math.sin(i * Math.PI / 3) * (0.6 + energy * 0.3),
              0
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Lab environment
function LabEnvironment({ isShaking }: { isShaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && isShaking) {
      const shake = Math.sin(clock.getElapsedTime() * 20) * 0.02;
      groupRef.current.position.x = shake;
      groupRef.current.rotation.z = shake * 0.5;
    } else if (groupRef.current) {
      groupRef.current.position.x = 0;
      groupRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floor - glowing grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#E8E0F0" />
      </mesh>
      
      {/* Grid lines */}
      {Array.from({ length: 21 }).map((_, i) => (
        <group key={i}>
          <mesh position={[i - 10, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 20]} />
            <meshBasicMaterial color="#C8B8E8" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -0.99, i - 10]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[0.02, 20]} />
            <meshBasicMaterial color="#C8B8E8" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Lab pillars */}
      {[[-4, 0, -4], [4, 0, -4], [-4, 0, 4], [4, 0, 4]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.2, 0.3, 4, 8]} />
          <meshStandardMaterial color="#D0C8E0" />
        </mesh>
      ))}
    </group>
  );
}

// Balance beam that tilts based on sin/cos ratio
function BalanceBeam({ sinEnergy, cosEnergy }: { sinEnergy: number; cosEnergy: number }) {
  const beamRef = useRef<THREE.Group>(null);
  const tilt = (sinEnergy - cosEnergy) * 0.3;

  useFrame(() => {
    if (beamRef.current) {
      beamRef.current.rotation.z = THREE.MathUtils.lerp(
        beamRef.current.rotation.z,
        tilt,
        0.05
      );
    }
  });

  return (
    <group ref={beamRef} position={[0, 2, 0]}>
      {/* Central pivot */}
      <mesh position={[0, -0.3, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="#A8A0B8" />
      </mesh>
      
      {/* Beam */}
      <mesh>
        <boxGeometry args={[4, 0.1, 0.3]} />
        <meshStandardMaterial color="#B8B0C8" />
      </mesh>
      
      {/* Sin side marker */}
      <mesh position={[-1.8, 0.1, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#A78BFA" />
      </mesh>
      
      {/* Cos side marker */}
      <mesh position={[1.8, 0.1, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#818CF8" />
      </mesh>
    </group>
  );
}

// Sparkle particles for success
function SuccessSparkles({ active }: { active: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions] = useState(() => {
    const pos = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame(({ clock }) => {
    if (particlesRef.current && active) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      const positions = particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < 100; i++) {
        const y = positions.getY(i);
        positions.setY(i, y > 4 ? 0 : y + 0.02);
      }
      positions.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#FFD700" transparent opacity={0.8} />
    </points>
  );
}

// Main scene content
function SceneContent({ phase, theta, onAnimationComplete }: SceneProps) {
  const [animatedTheta, setAnimatedTheta] = useState(10);
  
  const currentTheta = phase === 'animation' ? animatedTheta : theta;
  const sinSquared = Math.pow(Math.sin(currentTheta * Math.PI / 180), 2);
  const cosSquared = Math.pow(Math.cos(currentTheta * Math.PI / 180), 2);

  // Animation phase
  useEffect(() => {
    if (phase === 'animation') {
      let startTime: number;
      const duration = 5000;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;
        
        if (progress < 1) {
          // Sweep through angles to show how energies change
          const angle = 10 + progress * 70;
          setAnimatedTheta(angle);
          requestAnimationFrame(animate);
        } else {
          setAnimatedTheta(45);
          onAnimationComplete();
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [phase, onAnimationComplete]);

  const isUnbalanced = Math.abs(sinSquared - cosSquared) > 0.3;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#E8D0FF" />
      <pointLight position={[-5, 5, -5]} intensity={0.4} color="#D0E0FF" />
      
      {/* Lab environment */}
      <LabEnvironment isShaking={isUnbalanced && phase === 'interaction'} />
      
      {/* Sine wave ribbon */}
      <WaveRibbon 
        color="#A78BFA" 
        amplitude={sinSquared * 0.8} 
        offset={0}
        position={[-2, 0, 0]} 
      />
      
      {/* Cosine wave ribbon */}
      <WaveRibbon 
        color="#818CF8" 
        amplitude={cosSquared * 0.8} 
        offset={Math.PI / 2}
        position={[2, 0, 0]} 
      />
      
      {/* Energy orbs */}
      <EnergyOrb 
        position={[-3, 1.5, 0]} 
        color="#A78BFA" 
        energy={sinSquared}
        label="sin²θ"
      />
      <EnergyOrb 
        position={[3, 1.5, 0]} 
        color="#818CF8" 
        energy={cosSquared}
        label="cos²θ"
      />
      
      {/* Balance beam */}
      <BalanceBeam sinEnergy={sinSquared} cosEnergy={cosSquared} />
      
      {/* Success sparkles */}
      <SuccessSparkles active={phase === 'success'} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />
    </>
  );
}

export function WaveLabScene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 4, 8], fov: 50 }}
      style={{ background: 'linear-gradient(to bottom, #E8E0F8, #F0E8FF, #E0E8F8)' }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
