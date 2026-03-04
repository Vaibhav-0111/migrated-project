import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Cloud, Line } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface SceneProps {
  phase: 'animation' | 'interaction' | 'success' | 'helper';
  droneAngle: number;
  onAngleChange: (angle: number) => void;
  onAnimationComplete: () => void;
  targetAngle: number;
}

// Mountain component
function Mountain({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Main peak */}
      <mesh>
        <coneGeometry args={[3, 5, 6]} />
        <meshStandardMaterial color="#8B9A82" flatShading />
      </mesh>
      {/* Snow cap */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[1.2, 1.5, 6]} />
        <meshStandardMaterial color="#F5F5F0" flatShading />
      </mesh>
    </group>
  );
}

// Cliff face where climber is stuck
function Cliff() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main cliff */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2, 4, 1.5]} />
        <meshStandardMaterial color="#9E8B7D" />
      </mesh>
      {/* Ledges */}
      <mesh position={[0.8, 1.5, 0.5]}>
        <boxGeometry args={[0.8, 0.2, 0.5]} />
        <meshStandardMaterial color="#B5A397" />
      </mesh>
      <mesh position={[-0.5, 3, 0.6]}>
        <boxGeometry args={[1, 0.15, 0.4]} />
        <meshStandardMaterial color="#B5A397" />
      </mesh>
    </group>
  );
}

// Climber (stuck on cliff)
function Climber() {
  return (
    <group position={[0.3, 3.2, 0.8]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 8]} />
        <meshStandardMaterial color="#E57373" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFCCBC" />
      </mesh>
      {/* Arms (waving) */}
      <Float speed={4} rotationIntensity={0.5} floatIntensity={0.2}>
        <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, 0.5]}>
          <capsuleGeometry args={[0.05, 0.2, 4, 4]} />
          <meshStandardMaterial color="#E57373" />
        </mesh>
      </Float>
    </group>
  );
}

// Drone
function Drone({ position, ropeEnd }: { position: [number, number, number]; ropeEnd: [number, number, number] }) {
  const droneRef = useRef<THREE.Group>(null);
  
  // Subtle hovering animation
  useFrame(({ clock }) => {
    if (droneRef.current) {
      droneRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 3) * 0.05;
    }
  });

  return (
    <group ref={droneRef} position={position}>
      {/* Drone body */}
      <mesh>
        <boxGeometry args={[0.4, 0.15, 0.4]} />
        <meshStandardMaterial color="#5C6BC0" />
      </mesh>
      
      {/* Propeller arms */}
      {[[0.3, 0, 0.3], [-0.3, 0, 0.3], [0.3, 0, -0.3], [-0.3, 0, -0.3]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
            <meshStandardMaterial color="#424242" />
          </mesh>
          {/* Spinning propeller */}
          <mesh position={[0, 0.08, 0]} rotation={[0, Date.now() * 0.01 + i, 0]}>
            <boxGeometry args={[0.25, 0.02, 0.05]} />
            <meshStandardMaterial color="#90A4AE" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Rope */}
      <Line
        points={[
          [0, -0.1, 0],
          [
            ropeEnd[0] - position[0],
            ropeEnd[1] - position[1],
            ropeEnd[2] - position[2],
          ],
        ]}
        color="#FFB74D"
        lineWidth={3}
      />
      
      {/* Rope end hook */}
      <mesh position={[ropeEnd[0] - position[0], ropeEnd[1] - position[1], ropeEnd[2] - position[2]]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FF8A65" />
      </mesh>
    </group>
  );
}

// Visual triangle overlay
function TriangleGuide({ dronePos, climberPos, show }: { 
  dronePos: [number, number, number]; 
  climberPos: [number, number, number];
  show: boolean;
}) {
  if (!show) return null;

  const groundPoint: [number, number, number] = [dronePos[0], climberPos[1], dronePos[2]];

  return (
    <group>
      {/* Triangle lines */}
      <Line
        points={[dronePos, climberPos, groundPoint, dronePos]}
        color="#B4A7D6"
        lineWidth={2}
      />
    </group>
  );
}

// Ground with grass texture
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#A5D6A7" />
    </mesh>
  );
}

// Decorative trees
function Trees() {
  const positions: [number, number, number][] = [
    [-4, 0, 2], [-5, 0, -1], [4, 0, 3], [5, 0, -2], [-3, 0, -3]
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 1, 6]} />
            <meshStandardMaterial color="#8D6E63" />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.5, 1.2, 6]} />
            <meshStandardMaterial color="#66BB6A" />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Main scene content
function SceneContent({ phase, droneAngle, onAnimationComplete, targetAngle }: SceneProps) {
  const [animatedAngle, setAnimatedAngle] = useState(25);
  
  const climberHeight = 3.2;
  const droneDistance = 5;
  
  // Calculate drone position based on angle
  const currentAngle = phase === 'animation' ? animatedAngle : droneAngle;
  const angleRad = currentAngle * Math.PI / 180;
  
  const droneX = -droneDistance * Math.cos(angleRad);
  const droneY = climberHeight + droneDistance * Math.sin(angleRad);
  const dronePos: [number, number, number] = [droneX, droneY, 2];
  
  // Rope end (towards climber, length based on angle)
  const ropeLength = droneDistance * 0.9;
  const ropeEndX = droneX + ropeLength * Math.cos(angleRad);
  const ropeEndY = droneY - ropeLength * Math.sin(angleRad);
  const ropeEnd: [number, number, number] = [ropeEndX, ropeEndY, 1];

  const climberPos: [number, number, number] = [0.3, climberHeight, 0.8];

  // Animation phase
  useEffect(() => {
    if (phase === 'animation') {
      let startTime: number;
      const duration = 4000;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;
        
        if (progress < 1) {
          // Animate through different angles
          const angle = 25 + Math.sin(progress * Math.PI * 1.5) * 40;
          setAnimatedAngle(Math.max(20, Math.min(75, angle)));
          requestAnimationFrame(animate);
        } else {
          setAnimatedAngle(30);
          onAnimationComplete();
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [phase, onAnimationComplete]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      
      {/* Sky elements */}
      <Cloud position={[-8, 8, -5]} opacity={0.5} speed={0.2} />
      <Cloud position={[6, 10, -8]} opacity={0.4} speed={0.15} />
      
      {/* Background mountains */}
      <Mountain position={[-8, 0, -8]} scale={1.5} />
      <Mountain position={[8, 0, -10]} scale={2} />
      <Mountain position={[0, 0, -12]} scale={2.5} />
      
      {/* Ground */}
      <Ground />
      
      {/* Trees */}
      <Trees />
      
      {/* Cliff with climber */}
      <Cliff />
      <Climber />
      
      {/* Drone with rope */}
      <Drone position={dronePos} ropeEnd={ropeEnd} />
      
      {/* Triangle guide (visible during interaction) */}
      <TriangleGuide 
        dronePos={dronePos} 
        climberPos={climberPos}
        show={phase === 'interaction' || phase === 'helper'}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />
    </>
  );
}

export function MountainRescueScene(props: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 5, 10], fov: 50 }}
      style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F2F1)' }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
