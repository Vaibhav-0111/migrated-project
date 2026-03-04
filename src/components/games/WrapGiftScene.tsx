import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';

interface WrapGiftSceneProps {
  phase: string;
  currentShape: 'cube' | 'rectangular' | 'triangular';
  coveredFaces: number[];
  onFaceCovered: (faceIndex: number) => void;
  onWrapComplete: () => void;
}

function GiftShape({ shape, coveredFaces, onFaceCovered, interactive }: { 
  shape: string; 
  coveredFaces: number[];
  onFaceCovered: (index: number) => void;
  interactive: boolean;
}) {
  const faceColors = [
    '#ffb3ba', // pink
    '#baffc9', // green
    '#bae1ff', // blue
    '#ffffba', // yellow
    '#ffdfba', // orange
    '#e0bbff', // purple
  ];

  const getFaceCount = () => {
    if (shape === 'cube' || shape === 'rectangular') return 6;
    return 5; // triangular prism
  };

  return (
    <group>
      {/* Main shape */}
      {shape === 'cube' && (
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#f0e6d8" />
        </mesh>
      )}
      {shape === 'rectangular' && (
        <mesh>
          <boxGeometry args={[3, 2, 1.5]} />
          <meshStandardMaterial color="#f0e6d8" />
        </mesh>
      )}
      {shape === 'triangular' && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1, 1, 2.5, 3]} />
          <meshStandardMaterial color="#f0e6d8" />
        </mesh>
      )}

      {/* Wrapped faces */}
      {Array.from({ length: getFaceCount() }).map((_, i) => {
        if (!coveredFaces.includes(i)) return null;
        
        const positions = [
          [0, 0, 1.02],   // front
          [0, 0, -1.02],  // back
          [1.02, 0, 0],   // right
          [-1.02, 0, 0],  // left
          [0, 1.02, 0],   // top
          [0, -1.02, 0],  // bottom
        ];
        const rotations = [
          [0, 0, 0],
          [0, Math.PI, 0],
          [0, Math.PI / 2, 0],
          [0, -Math.PI / 2, 0],
          [-Math.PI / 2, 0, 0],
          [Math.PI / 2, 0, 0],
        ];

        return (
          <mesh 
            key={i}
            position={positions[i] as [number, number, number]}
            rotation={rotations[i] as [number, number, number]}
          >
            <planeGeometry args={[1.95, 1.95]} />
            <meshStandardMaterial color={faceColors[i]} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Clickable uncovered faces */}
      {interactive && Array.from({ length: getFaceCount() }).map((_, i) => {
        if (coveredFaces.includes(i)) return null;
        
        const positions = [
          [0, 0, 1.03],
          [0, 0, -1.03],
          [1.03, 0, 0],
          [-1.03, 0, 0],
          [0, 1.03, 0],
          [0, -1.03, 0],
        ];
        const rotations = [
          [0, 0, 0],
          [0, Math.PI, 0],
          [0, Math.PI / 2, 0],
          [0, -Math.PI / 2, 0],
          [-Math.PI / 2, 0, 0],
          [Math.PI / 2, 0, 0],
        ];

        return (
          <mesh 
            key={`uncovered-${i}`}
            position={positions[i] as [number, number, number]}
            rotation={rotations[i] as [number, number, number]}
            onClick={() => onFaceCovered(i)}
          >
            <planeGeometry args={[1.9, 1.9]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Scene({ shape, coveredFaces, onFaceCovered, interactive }: { 
  shape: string; 
  coveredFaces: number[];
  onFaceCovered: (index: number) => void;
  interactive: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.4} color="#ffcccc" />
      
      <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <GiftShape 
          shape={shape} 
          coveredFaces={coveredFaces}
          onFaceCovered={onFaceCovered}
          interactive={interactive}
        />
      </Float>
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#fff0f5" />
      </mesh>
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate={!interactive}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function WrapGiftScene({ 
  phase, 
  currentShape, 
  coveredFaces, 
  onFaceCovered, 
  onWrapComplete 
}: WrapGiftSceneProps) {
  const totalFaces = currentShape === 'triangular' ? 5 : 6;

  return (
    <div className="h-screen w-full relative">
      <Canvas shadows camera={{ position: [4, 3, 4], fov: 50 }}>
        <color attach="background" args={['#fff0f5']} />
        <fog attach="fog" args={['#fff0f5', 8, 25]} />
        <Scene 
          shape={currentShape} 
          coveredFaces={coveredFaces}
          onFaceCovered={onFaceCovered}
          interactive={phase === 'interaction'}
        />
      </Canvas>

      {/* Instructions */}
      {phase === 'interaction' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-2xl p-6 w-80"
        >
          <p className="text-sm text-center text-muted-foreground mb-4">
            Click on each face to wrap it with paper
          </p>
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: totalFaces }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                  coveredFaces.includes(i)
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {coveredFaces.includes(i) ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <Button 
            onClick={onWrapComplete} 
            className="w-full"
            disabled={coveredFaces.length === 0}
          >
            Check Wrapping
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
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 text-center">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="text-4xl mb-3"
            >
              🎁
            </motion.div>
            <p className="text-lg font-medium">Watch how paper covers each face...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
