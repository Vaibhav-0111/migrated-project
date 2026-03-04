import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshTransmissionMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';

interface ShapeFillSceneProps {
  phase: string;
  currentShape: 'cube' | 'cylinder' | 'sphere';
  fillLevel: number;
  targetLevel: number;
  onFillChange: (level: number) => void;
  onFillComplete: () => void;
}

function WaterSurface({ fillLevel, shape }: { fillLevel: number; shape: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(time.current * 2) * 0.02;
    }
  });

  if (fillLevel < 0.05) return null;

  const getRadius = () => {
    if (shape === 'cube') return 0.9;
    if (shape === 'cylinder') return 0.9;
    return 1.1 * Math.sin(Math.acos(1 - fillLevel));
  };

  return (
    <mesh ref={meshRef} position={[0, -1 + fillLevel * 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[getRadius(), 32]} />
      <meshStandardMaterial 
        color="#4da6ff" 
        transparent 
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function LiquidFill({ shape, fillLevel }: { shape: string; fillLevel: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  
  const fillColor = useMemo(() => 
    new THREE.Color().setHSL(0.55, 0.8, 0.55 + fillLevel * 0.1), 
    [fillLevel]
  );

  useFrame((state, delta) => {
    time.current += delta;
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.7 + Math.sin(time.current * 3) * 0.1;
    }
  });

  if (fillLevel < 0.01) return null;

  const height = fillLevel * 2;

  return (
    <group>
      <mesh position={[0, -1 + height / 2, 0]} ref={meshRef}>
        {shape === 'cube' && <boxGeometry args={[1.85, height, 1.85]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[0.9, 0.9, height, 32]} />}
        {shape === 'sphere' && <sphereGeometry args={[1.1, 32, 32, 0, Math.PI * 2, Math.PI - (fillLevel * Math.PI), fillLevel * Math.PI]} />}
        <meshStandardMaterial 
          color={fillColor} 
          transparent 
          opacity={0.75}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <WaterSurface fillLevel={fillLevel} shape={shape} />
    </group>
  );
}

function TransparentShape({ shape, fillLevel, targetLevel }: { shape: string; fillLevel: number; targetLevel: number }) {
  const shellRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (shellRef.current) {
      shellRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Outer transparent shell */}
      <mesh ref={shellRef}>
        {shape === 'cube' && <boxGeometry args={[2, 2, 2]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[1, 1, 2.5, 32]} />}
        {shape === 'sphere' && <sphereGeometry args={[1.2, 32, 32]} />}
        <meshPhysicalMaterial 
          color="#88ddff" 
          transparent 
          opacity={0.15} 
          roughness={0}
          transmission={0.9}
          thickness={0.5}
          envMapIntensity={1}
        />
      </mesh>

      {/* Edge highlights */}
      <mesh>
        {shape === 'cube' && <boxGeometry args={[2.02, 2.02, 2.02]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[1.02, 1.02, 2.52, 32]} />}
        {shape === 'sphere' && <sphereGeometry args={[1.22, 32, 32]} />}
        <meshBasicMaterial color="#aaeeff" transparent opacity={0.1} wireframe />
      </mesh>

      {/* Liquid fill */}
      <LiquidFill shape={shape} fillLevel={fillLevel} />

      {/* Target line - glowing ring */}
      <group position={[0, -1 + targetLevel * 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[shape === 'sphere' ? 1.25 : shape === 'cylinder' ? 1.05 : 1.05, 0.03, 8, 64]} />
          <meshBasicMaterial color="#ffdd00" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[shape === 'sphere' ? 1.25 : shape === 'cylinder' ? 1.05 : 1.05, 0.08, 8, 64]} />
          <meshBasicMaterial color="#ffdd00" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function PouringWater({ isPouring }: { isPouring: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (groupRef.current && isPouring) {
      particles.current.forEach((p, i) => {
        if (p) {
          p.position.y -= 0.15;
          if (p.position.y < -3) p.position.y = 0;
        }
      });
    }
  });

  if (!isPouring) return null;

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[Math.random() * 0.2 - 0.1, -i * 0.3, Math.random() * 0.2 - 0.1]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#4da6ff" transparent opacity={0.8} />
        </mesh>
      ))}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.5, 16]} />
        <meshStandardMaterial color="#4da6ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Tap({ onPour, isPouring }: { onPour: () => void; isPouring: boolean }) {
  const handleRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (handleRef.current) {
      handleRef.current.rotation.z = isPouring ? -0.3 : 0;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={[0, 2.8, 0]}>
        {/* Tap body */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.25, 0.6, 16]} />
          <meshStandardMaterial color="#5599dd" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Handle */}
        <group ref={handleRef} position={[0.3, 0.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
            <meshStandardMaterial color="#3377bb" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.25, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#4488cc" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        {/* Spout */}
        <mesh position={[0, -0.4, 0]}>
          <coneGeometry args={[0.12, 0.3, 16]} />
          <meshStandardMaterial color="#4488cc" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Click area */}
        <mesh onClick={onPour} visible={false}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ shape, fillLevel, targetLevel, onPour, isPouring }: { 
  shape: string; 
  fillLevel: number; 
  targetLevel: number;
  onPour: () => void;
  isPouring: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#88ccff" />
      <pointLight position={[3, 2, 3]} intensity={0.2} color="#ffffff" />
      
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.2}>
        <TransparentShape shape={shape} fillLevel={fillLevel} targetLevel={targetLevel} />
      </Float>
      
      <Tap onPour={onPour} isPouring={isPouring} />
      <PouringWater isPouring={isPouring} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#d0e8f8" />
      </mesh>
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}

export function ShapeFillScene({ 
  phase, 
  currentShape, 
  fillLevel, 
  targetLevel, 
  onFillChange, 
  onFillComplete 
}: ShapeFillSceneProps) {
  const [isPouring, setIsPouring] = useState(false);
  const pourIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePour = () => {
    if (phase !== 'interaction' || isPouring) return;
    
    setIsPouring(true);
    pourIntervalRef.current = setInterval(() => {
      onFillChange(Math.min(1, fillLevel + 0.02));
    }, 50);

    setTimeout(() => {
      if (pourIntervalRef.current) {
        clearInterval(pourIntervalRef.current);
      }
      setIsPouring(false);
    }, 400);
  };

  const percentFill = Math.round(fillLevel * 100);
  const percentTarget = Math.round(targetLevel * 100);

  return (
    <div className="h-screen w-full relative">
      <Canvas shadows camera={{ position: [5, 4, 5], fov: 45 }}>
        <color attach="background" args={['#e0f0ff']} />
        <fog attach="fog" args={['#e0f0ff', 10, 30]} />
        <Scene 
          shape={currentShape} 
          fillLevel={fillLevel} 
          targetLevel={targetLevel}
          onPour={handlePour}
          isPouring={isPouring}
        />
      </Canvas>

      {/* Shape indicator */}
      {phase === 'interaction' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-20 left-4 bg-background/90 backdrop-blur-sm rounded-xl p-3"
        >
          <p className="text-xs text-muted-foreground">Shape</p>
          <p className="font-bold capitalize text-primary">{currentShape}</p>
        </motion.div>
      )}

      {/* Fill level display */}
      {phase === 'interaction' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-20 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-3"
        >
          <p className="text-xs text-muted-foreground">Fill Level</p>
          <p className={`text-2xl font-bold ${Math.abs(percentFill - percentTarget) < 10 ? 'text-green-500' : 'text-primary'}`}>
            {percentFill}%
          </p>
        </motion.div>
      )}

      {/* Fill control slider */}
      {phase === 'interaction' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-2xl p-6 w-80 shadow-xl"
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium">Pour water to fill the {currentShape}</p>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Target: {percentTarget}%
            </span>
          </div>
          
          <div className="relative mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={percentFill}
              onChange={(e) => onFillChange(Number(e.target.value) / 100)}
              className="w-full h-4 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, hsl(200, 80%, 55%) 0%, hsl(200, 80%, 55%) ${percentFill}%, hsl(var(--muted)) ${percentFill}%, hsl(var(--muted)) 100%)`
              }}
            />
            <div 
              className="absolute top-0 h-4 w-1 bg-yellow-400 rounded-full pointer-events-none"
              style={{ left: `calc(${percentTarget}% - 2px)` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground mb-4">
            <span>Empty</span>
            <span className="text-primary font-medium">Target: {percentTarget}%</span>
            <span>Full</span>
          </div>
          
          <Button 
            onClick={onFillComplete} 
            className="w-full"
            size="lg"
            disabled={fillLevel < 0.05}
          >
            Check Fill Level
          </Button>
        </motion.div>
      )}

      {/* Animation overlay */}
      {phase === 'animation' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 text-center">
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-5xl mb-4"
            >
              💧
            </motion.div>
            <p className="text-lg font-medium">Watch how liquid fills the shape...</p>
            <p className="text-sm text-muted-foreground mt-2">Notice how volume works in 3D!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
