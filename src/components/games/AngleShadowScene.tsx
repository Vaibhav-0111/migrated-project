import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float, Line, Html } from '@react-three/drei';
import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface SceneProps {
  phase: 'animation' | 'interaction' | 'success' | 'helper';
  sunAngle: number;
  onAngleChange: (angle: number) => void;
  onAnimationComplete: () => void;
  targetAngle: number;
}

// ── Constants ──────────────────────────────────────────
// Tree height from ground to top of canopy
const TREE_HEIGHT = 2.5;

// The bench is placed so that the shadow tip reaches it ONLY at the target angle.
// Shadow length = TREE_HEIGHT / tan(targetAngle).
// For targetAngle = 60°: shadowLen = 2.5 / tan(60°) ≈ 2.5 / 1.732 ≈ 1.443
// Bench centre sits exactly at that distance (negative x = "away from the sun")
function benchDistanceForAngle(angleDeg: number) {
  return TREE_HEIGHT / Math.tan(THREE.MathUtils.degToRad(angleDeg));
}

// ── Tree ───────────────────────────────────────────────
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#A8D5BA" />
      </mesh>
      <mesh position={[0, 2.5, 0.2]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#98C9A3" />
      </mesh>
      <mesh position={[0.3, 2.3, -0.2]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#B5E2C4" />
      </mesh>
    </group>
  );
}

// ── Bench ──────────────────────────────────────────────
function Bench({ position, isTarget }: { position: [number, number, number]; isTarget?: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.5]} />
        <meshStandardMaterial color={isTarget ? '#F5D5C8' : '#E8D5C4'} />
      </mesh>
      <mesh position={[0, 0.65, -0.2]}>
        <boxGeometry args={[1.2, 0.5, 0.08]} />
        <meshStandardMaterial color={isTarget ? '#F5D5C8' : '#E8D5C4'} />
      </mesh>
      {[[-0.45, 0.15, 0.15], [0.45, 0.15, 0.15], [-0.45, 0.15, -0.15], [0.45, 0.15, -0.15]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#C4B8AC" />
        </mesh>
      ))}
      {isTarget && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color="#F5C4A8" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

// ── Sun ────────────────────────────────────────────────
function Sun({ angle }: { angle: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const distance = 8;
  const targetX = Math.cos(THREE.MathUtils.degToRad(angle)) * distance;
  const targetY = Math.sin(THREE.MathUtils.degToRad(angle)) * distance;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[targetX, targetY, 0]}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#FFE4B5" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#FFF8DC" transparent opacity={0.3} />
      </mesh>
      <pointLight intensity={1.5} distance={20} color="#FFFACD" />
    </group>
  );
}

// ── Shadow (trigonometrically accurate) ────────────────
function DynamicShadow({ treePosition, sunAngle }: { treePosition: [number, number, number]; sunAngle: number }) {
  // Shadow length = height / tan(angle)
  // Clamp to avoid infinite shadow at very low angles
  const clampedAngle = Math.max(sunAngle, 5);
  const shadowLength = TREE_HEIGHT / Math.tan(THREE.MathUtils.degToRad(clampedAngle));

  // Shadow stretches in the negative-x direction (away from the sun)
  // It starts at the tree base and extends by shadowLength
  const shadowStartX = treePosition[0];
  const shadowEndX = treePosition[0] - shadowLength;
  const shadowCenterX = (shadowStartX + shadowEndX) / 2;

  // Opacity gets softer as shadow gets longer (more diffuse when sun is low)
  const opacity = THREE.MathUtils.clamp(0.25 - (shadowLength - 1) * 0.015, 0.08, 0.25);

  return (
    <group>
      {/* Main shadow body */}
      <mesh
        position={[shadowCenterX, 0.02, treePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[Math.abs(shadowLength), 0.9]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={opacity} />
      </mesh>

      {/* Shadow tip (tapered) */}
      <mesh
        position={[shadowEndX - 0.15, 0.02, treePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.3, 0.5]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={opacity * 0.5} />
      </mesh>
    </group>
  );
}

// ── Angle arc indicator ───────────────────────────────
function AngleArc({ treePosition, sunAngle }: { treePosition: [number, number, number]; sunAngle: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const radius = 1.2;
    // Draw arc from 0° to current sun angle
    for (let i = 0; i <= 30; i++) {
      const a = THREE.MathUtils.degToRad((i / 30) * sunAngle);
      pts.push(new THREE.Vector3(
        treePosition[0] + Math.cos(a) * radius,
        treePosition[1] + Math.sin(a) * radius,
        treePosition[2]
      ));
    }
    return pts;
  }, [sunAngle, treePosition]);

  // Line from tree top to shadow tip (hypotenuse visualization)
  const clampedAngle = Math.max(sunAngle, 5);
  const shadowLength = TREE_HEIGHT / Math.tan(THREE.MathUtils.degToRad(clampedAngle));

  const trianglePoints = useMemo(() => [
    new THREE.Vector3(treePosition[0], 0.05, treePosition[2]),                    // base at tree
    new THREE.Vector3(treePosition[0] - shadowLength, 0.05, treePosition[2]),      // shadow tip
    new THREE.Vector3(treePosition[0], TREE_HEIGHT, treePosition[2]),              // tree top
    new THREE.Vector3(treePosition[0], 0.05, treePosition[2]),                    // close
  ], [shadowLength, treePosition]);

  return (
    <group>
      {/* Angle arc */}
      <Line points={points} color="#F5A623" lineWidth={2} transparent opacity={0.7} />
      
      {/* Right-angle triangle outline */}
      <Line points={trianglePoints} color="#F5A623" lineWidth={1.5} transparent opacity={0.35} dashed dashSize={0.15} gapSize={0.1} />

      {/* Angle label */}
      <Html
        position={[
          treePosition[0] + Math.cos(THREE.MathUtils.degToRad(sunAngle / 2)) * 1.8,
          treePosition[1] + Math.sin(THREE.MathUtils.degToRad(sunAngle / 2)) * 1.8,
          treePosition[2]
        ]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          background: 'rgba(245, 166, 35, 0.9)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {Math.round(sunAngle)}°
        </div>
      </Html>
    </group>
  );
}

// ── Flowers ───────────────────────────────────────────
function Flowers() {
  const positions: [number, number, number][] = [
    [-2, 0.1, 2], [-1.5, 0.1, 1.5], [2, 0.1, -1], [1.8, 0.1, 1], [-0.5, 0.1, -2],
    [2.5, 0.1, 0.5], [-2.2, 0.1, -0.5], [0.5, 0.1, 2.5],
  ];
  const colors = ['#F5B5C4', '#B4A7D6', '#A8D5F5', '#F5C4A8'];

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={pos}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={colors[i % colors.length]} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// ── Butterflies ───────────────────────────────────────
function Butterflies({ active }: { active: boolean }) {
  const butterflies = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (butterflies.current && active) {
      butterflies.current.children.forEach((butterfly, i) => {
        const t = clock.getElapsedTime() + i * 2;
        butterfly.position.x = Math.sin(t * 0.5) * 2 + (i - 1) * 1.5;
        butterfly.position.y = 2 + Math.sin(t * 2) * 0.3;
        butterfly.position.z = Math.cos(t * 0.3) * 2;
        butterfly.rotation.y = Math.sin(t * 3) * 0.3;
      });
    }
  });
  if (!active) return null;
  return (
    <group ref={butterflies}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i - 1, 2, 0]}>
          <planeGeometry args={[0.3, 0.2]} />
          <meshBasicMaterial color={['#F5B5C4', '#B4A7D6', '#A8D5F5'][i]} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main Scene ────────────────────────────────────────
function SceneContent({ phase, sunAngle, onAnimationComplete, targetAngle }: SceneProps) {
  const [animatedAngle, setAnimatedAngle] = useState(20);
  const treePosition: [number, number, number] = [0, 0, 0];

  // Place the bench exactly where the shadow tip lands at the target angle
  const benchDistance = benchDistanceForAngle(targetAngle);
  const benchPosition: [number, number, number] = [-benchDistance, 0, 0];

  // Animation phase
  useEffect(() => {
    if (phase === 'animation') {
      let startTime: number;
      const duration = 4000;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;
        if (progress < 1) {
          const angle = 20 + Math.sin(progress * Math.PI) * 50;
          setAnimatedAngle(angle);
          requestAnimationFrame(animate);
        } else {
          setAnimatedAngle(45);
          onAnimationComplete();
        }
      };
      requestAnimationFrame(animate);
    }
  }, [phase, onAnimationComplete]);

  const currentAngle = phase === 'animation' ? animatedAngle : sunAngle;

  return (
    <>
      <ambientLight intensity={0.6} />
      <Sun angle={currentAngle} />
      <directionalLight
        position={[
          Math.cos(THREE.MathUtils.degToRad(currentAngle)) * 5,
          Math.sin(THREE.MathUtils.degToRad(currentAngle)) * 5,
          2,
        ]}
        intensity={0.8}
        castShadow
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#C8E6C9" />
      </mesh>

      <Tree position={treePosition} />
      <DynamicShadow treePosition={treePosition} sunAngle={currentAngle} />
      <AngleArc treePosition={treePosition} sunAngle={currentAngle} />
      <Bench position={benchPosition} isTarget />
      <Flowers />
      <Butterflies active={phase === 'success'} />

      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={10} blur={2} far={4} color="#2d3436" />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
      />
    </>
  );
}

export function AngleShadowScene(props: SceneProps) {
  return (
    <Canvas shadows camera={{ position: [5, 4, 8], fov: 45 }} style={{ background: 'transparent' }}>
      <SceneContent {...props} />
    </Canvas>
  );
}
