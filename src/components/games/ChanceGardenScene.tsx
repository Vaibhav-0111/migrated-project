import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ChanceGardenSceneProps {
  phase: 'tutorial' | 'animation' | 'play' | 'quiz' | 'complete';
  onAnimationComplete: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

function Basket({ position, balls, color, onClick, isActive, isHighlighted }: { 
  position: [number, number, number]; 
  balls: { color: string; count: number }[];
  color: string;
  onClick: () => void;
  isActive: boolean;
  isHighlighted?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle wobble when active
      if (isActive) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.08;
      }
      // Bounce when hovered
      if (hovered && isActive) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.05;
      } else {
        groupRef.current.position.y = 0;
      }
    }
    // Pulse glow
    if (glowRef.current && isHighlighted) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  const totalBalls = balls.reduce((sum, b) => sum + b.count, 0);

  // Generate stable ball positions
  const ballPositions = useMemo(() => {
    const positions: { x: number; y: number; z: number; color: string }[] = [];
    balls.forEach((ballType) => {
      for (let i = 0; i < Math.min(ballType.count, 6); i++) {
        const angle = (i / Math.min(ballType.count, 6)) * Math.PI * 2;
        const radius = 0.3 + (i % 2) * 0.2;
        positions.push({
          x: Math.cos(angle) * radius,
          y: 0.5 + Math.floor(i / 3) * 0.2,
          z: Math.sin(angle) * radius,
          color: ballType.color,
        });
      }
    });
    return positions;
  }, [balls]);

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={isActive ? onClick : undefined}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Basket base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[1.2, 0.8, 0.8, 32]} />
        <meshStandardMaterial 
          color={hovered && isActive ? '#D2691E' : color} 
          transparent 
          opacity={0.85} 
        />
      </mesh>
      
      {/* Basket rim */}
      <mesh position={[0, 0.7, 0]}>
        <torusGeometry args={[1.2, 0.1, 16, 32]} />
        <meshStandardMaterial color={hovered && isActive ? '#D2691E' : color} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Basket weave pattern */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.22, 0.82, 0.75, 32, 4, true]} />
        <meshStandardMaterial color="#654321" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Balls inside with stable positions */}
      {ballPositions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={pos.color} metalness={0.2} roughness={0.3} />
        </mesh>
      ))}

      {/* Highlight glow */}
      {(isHighlighted || (hovered && isActive)) && (
        <mesh ref={glowRef} position={[0, 0.3, 0]}>
          <cylinderGeometry args={[1.5, 1.1, 1.1, 32]} />
          <meshStandardMaterial color="#FFD700" transparent opacity={0.15} />
        </mesh>
      )}

      {/* Ball count label with background */}
      <group position={[0, 1.6, 0]}>
        <mesh>
          <planeGeometry args={[1.4, 0.5]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.9} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {`${totalBalls} balls total`}
        </Text>
      </group>

      {/* Color breakdown labels */}
      <group position={[0, 1.2, 0]}>
        {balls.map((ball, i) => (
          <Text
            key={i}
            position={[i === 0 ? -0.5 : 0.5, 0, 0]}
            fontSize={0.18}
            color={ball.color}
            anchorX="center"
            anchorY="middle"
          >
            {ball.count}
          </Text>
        ))}
      </group>

      {/* Click indicator */}
      {isActive && (
        <Text
          position={[0, -0.3, 1]}
          fontSize={0.2}
          color="#666"
          anchorX="center"
          anchorY="middle"
        >
          Tap me!
        </Text>
      )}
    </group>
  );
}

function FloatingBall({ color, startPos, targetPos, onComplete }: {
  color: string;
  startPos: [number, number, number];
  targetPos: [number, number, number];
  onComplete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && progress < 1 && !completed) {
      const newProgress = Math.min(progress + delta * 1.2, 1);
      setProgress(newProgress);
      
      // Smooth easing
      const t = 1 - Math.pow(1 - newProgress, 3);
      const x = startPos[0] + (targetPos[0] - startPos[0]) * t;
      const y = startPos[1] + (targetPos[1] - startPos[1]) * t + Math.sin(t * Math.PI) * 2.5;
      const z = startPos[2] + (targetPos[2] - startPos[2]) * t;
      
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.x += delta * 5;
      meshRef.current.rotation.z += delta * 3;
      
      // Scale animation
      const scale = 1 + Math.sin(t * Math.PI) * 0.3;
      meshRef.current.scale.set(scale, scale, scale);

      if (newProgress >= 1 && !completed) {
        setCompleted(true);
        onComplete();
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={startPos}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.2} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Glow effect */}
      <pointLight position={startPos} color={color} intensity={2} distance={3} />
    </group>
  );
}

function Garden({ animationProgress }: { animationProgress: number }) {
  const flowersRef = useRef<THREE.Group>(null);
  
  // Generate stable flower positions
  const flowerData = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      x: (Math.sin(i * 1.7) * 4) + (Math.cos(i * 2.3) * 3),
      z: (Math.cos(i * 1.3) * 4) + (Math.sin(i * 2.7) * 3),
      color: ['#FFB6C1', '#DDA0DD', '#FFF0F5', '#E6E6FA', '#FFE4E1', '#FFDAB9'][i % 6],
      scale: 0.8 + (i % 3) * 0.2,
    }));
  }, []);

  useFrame((state) => {
    if (flowersRef.current) {
      flowersRef.current.children.forEach((flower, i) => {
        const child = flower as THREE.Group;
        if (child.children[1]) {
          child.children[1].rotation.y = state.clock.elapsedTime * 0.5 + i;
        }
      });
    }
  });

  return (
    <group>
      {/* Ground with gradient effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#7CCD7C" />
      </mesh>
      
      {/* Grass patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <ringGeometry args={[3, 6, 32]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>

      {/* Decorative path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 2, 32]} />
        <meshStandardMaterial color="#DEB887" roughness={0.9} />
      </mesh>

      {/* Flowers */}
      <group ref={flowersRef}>
        {flowerData.map((flower, i) => (
          <group 
            key={i} 
            position={[flower.x, 0, flower.z]}
            scale={[flower.scale * animationProgress, flower.scale * animationProgress, flower.scale * animationProgress]}
          >
            {/* Stem */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.02, 0.03, 0.4]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* Flower head */}
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color={flower.color} emissive={flower.color} emissiveIntensity={0.1} />
            </mesh>
            {/* Petals */}
            {[0, 1, 2, 3, 4].map((j) => (
              <mesh 
                key={j} 
                position={[
                  Math.cos(j * Math.PI * 0.4) * 0.1, 
                  0.45, 
                  Math.sin(j * Math.PI * 0.4) * 0.1
                ]}
                rotation={[0, j * Math.PI * 0.4, Math.PI / 4]}
              >
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={flower.color} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Butterflies animation */}
      {animationProgress > 0.5 && (
        <group>
          {[0, 1, 2].map((i) => (
            <ButterflyAnimated key={i} index={i} />
          ))}
        </group>
      )}
    </group>
  );
}

function ButterflyAnimated({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + index * 2;
      ref.current.position.x = Math.sin(t * 0.5) * 3 + index * 2 - 2;
      ref.current.position.y = 2 + Math.sin(t * 2) * 0.5;
      ref.current.position.z = Math.cos(t * 0.3) * 2;
      ref.current.rotation.y = Math.sin(t) * 0.5;
    }
  });

  const colors = ['#FF69B4', '#87CEEB', '#FFD700'];
  
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={colors[index]} emissive={colors[index]} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function AnimationIntro({ progress }: { progress: number }) {
  const textRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={textRef} position={[0, 3, 0]}>
      <Text
        fontSize={0.5}
        color="#4A0E4E"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#fff"
      >
        {progress < 0.5 ? "Welcome to Chance Garden!" : "Pick the basket with MORE of the target color!"}
      </Text>
      
      {/* Animated stars */}
      {progress > 0.3 && [0, 1, 2].map((i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(i * 2) * 2, 
            Math.cos(i * 2) * 0.5 + 0.8, 
            0
          ]}
          scale={[0.1 * progress, 0.1 * progress, 0.1 * progress]}
        >
          <octahedronGeometry args={[1]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function ChanceGardenScene({ phase, onAnimationComplete, onCorrect, onIncorrect }: ChanceGardenSceneProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [floatingBall, setFloatingBall] = useState<{ color: string; from: [number, number, number] } | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  
  // Different basket configurations for each round
  const rounds = useMemo(() => [
    { 
      left: [{ color: '#4169E1', count: 8 }, { color: '#FFD700', count: 2 }], 
      right: [{ color: '#4169E1', count: 2 }, { color: '#FFD700', count: 8 }], 
      correctBasket: 'left' as const, 
      targetColor: '#4169E1',
      targetName: 'BLUE'
    },
    { 
      left: [{ color: '#FF69B4', count: 1 }, { color: '#32CD32', count: 9 }], 
      right: [{ color: '#FF69B4', count: 5 }, { color: '#32CD32', count: 5 }], 
      correctBasket: 'left' as const, 
      targetName: 'GREEN',
      targetColor: '#32CD32' 
    },
    { 
      left: [{ color: '#FF6347', count: 3 }, { color: '#9370DB', count: 7 }], 
      right: [{ color: '#FF6347', count: 7 }, { color: '#9370DB', count: 3 }], 
      correctBasket: 'right' as const, 
      targetName: 'RED',
      targetColor: '#FF6347' 
    },
    { 
      left: [{ color: '#FFA500', count: 6 }, { color: '#00CED1', count: 4 }], 
      right: [{ color: '#FFA500', count: 2 }, { color: '#00CED1', count: 8 }], 
      correctBasket: 'right' as const, 
      targetName: 'CYAN',
      targetColor: '#00CED1' 
    },
  ], []);

  const currentConfig = rounds[currentRound % rounds.length];

  useEffect(() => {
    if (phase === 'animation') {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, onAnimationComplete]);

  useFrame((state, delta) => {
    if (phase === 'animation') {
      setAnimationProgress(prev => Math.min(prev + delta * 0.6, 1));
    } else if (phase === 'play' && animationProgress < 1) {
      setAnimationProgress(1);
    }
  });

  const handleBasketClick = (basket: 'left' | 'right') => {
    if (phase !== 'play' || floatingBall) return;

    const from: [number, number, number] = basket === 'left' ? [-2.5, 0.8, 0] : [2.5, 0.8, 0];
    
    // Simply check if they picked the correct basket (the one with MORE of the target color)
    const isCorrect = basket === currentConfig.correctBasket;
    
    // Pick a random ball color for visual effect
    const balls = basket === 'left' ? currentConfig.left : currentConfig.right;
    const totalBalls = balls.reduce((sum, b) => sum + b.count, 0);
    const rand = Math.random() * totalBalls;
    let cumulative = 0;
    let pickedColor = balls[0].color;
    for (const ball of balls) {
      cumulative += ball.count;
      if (rand < cumulative) {
        pickedColor = ball.color;
        break;
      }
    }

    setFloatingBall({ color: pickedColor, from });
    
    // Trigger result after animation
    setTimeout(() => {
      if (isCorrect) {
        onCorrect();
        setCurrentRound(prev => prev + 1);
      } else {
        onIncorrect();
      }
      setFloatingBall(null);
    }, 1200);
  };

  return (
    <group>
      <Garden animationProgress={animationProgress} />
      
      {/* Animation intro */}
      {phase === 'animation' && (
        <AnimationIntro progress={animationProgress} />
      )}
      
      {/* Left Basket */}
      <Basket
        position={[-2.5, 0, 0]}
        balls={currentConfig.left}
        color="#8B4513"
        onClick={() => handleBasketClick('left')}
        isActive={phase === 'play' && !floatingBall}
      />
      
      {/* Right Basket */}
      <Basket
        position={[2.5, 0, 0]}
        balls={currentConfig.right}
        color="#A0522D"
        onClick={() => handleBasketClick('right')}
        isActive={phase === 'play' && !floatingBall}
      />

      {/* Floating Ball Animation */}
      {floatingBall && (
        <FloatingBall
          color={floatingBall.color}
          startPos={floatingBall.from}
          targetPos={[0, 4, 0]}
          onComplete={() => {}}
        />
      )}

      {/* Instruction text */}
      {phase === 'play' && !floatingBall && (
        <group position={[0, 4.5, 0]}>
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[6, 0.8]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.95} />
          </mesh>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.28}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            Which basket has MORE
          </Text>
          <Text
            position={[0, -0.2, 0]}
            fontSize={0.35}
            color={currentConfig.targetColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000"
          >
            {currentConfig.targetName} balls?
          </Text>
        </group>
      )}

      {/* Success indicator when choosing */}
      {floatingBall && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.4}
          color="#4A0E4E"
          anchorX="center"
          anchorY="middle"
        >
          Let's see...
        </Text>
      )}
    </group>
  );
}
