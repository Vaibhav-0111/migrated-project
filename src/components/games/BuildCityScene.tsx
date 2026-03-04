import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface BuildingDimensions {
  width: number;
  height: number;
  depth: number;
}

interface BuildCitySceneProps {
  phase: string;
  dimensions: BuildingDimensions;
  goalType: 'storage' | 'material' | 'balanced';
  onDimensionChange: (dimensions: BuildingDimensions) => void;
  onBuildComplete: () => void;
}

function Building({ dimensions }: { dimensions: BuildingDimensions }) {
  const { width, height, depth } = dimensions;
  
  return (
    <group>
      {/* Main building */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#ffd6a5" />
      </mesh>
      
      {/* Windows */}
      {Array.from({ length: Math.floor(height) }).map((_, y) =>
        Array.from({ length: Math.max(1, Math.floor(width / 1.5)) }).map((_, x) => (
          <mesh
            key={`window-${y}-${x}`}
            position={[
              -width / 2 + 0.5 + x * 1.2,
              0.5 + y,
              depth / 2 + 0.01
            ]}
          >
            <planeGeometry args={[0.4, 0.5]} />
            <meshBasicMaterial color="#87CEEB" />
          </mesh>
        ))
      )}

      {/* Roof */}
      <mesh position={[0, height + 0.15, 0]}>
        <boxGeometry args={[width + 0.2, 0.3, depth + 0.2]} />
        <meshStandardMaterial color="#c9b896" />
      </mesh>
    </group>
  );
}

function CityBackground() {
  return (
    <group>
      {/* Other buildings in background */}
      {[-6, -3, 3, 6].map((x, i) => (
        <mesh key={i} position={[x, 1.5 + i * 0.5, -4]} castShadow>
          <boxGeometry args={[1.5, 3 + i, 1.5]} />
          <meshStandardMaterial color="#d4c4b5" transparent opacity={0.6} />
        </mesh>
      ))}
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>
      
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5]}>
        <planeGeometry args={[30, 3]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
    </group>
  );
}

function EnergyFlow({ dimensions, goalType }: { dimensions: BuildingDimensions; goalType: string }) {
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  const surfaceArea = 2 * (
    dimensions.width * dimensions.height + 
    dimensions.height * dimensions.depth + 
    dimensions.width * dimensions.depth
  );
  
  const volumeIntensity = Math.min(volume / 100, 1);
  const surfaceIntensity = Math.min(surfaceArea / 200, 1);

  return (
    <group>
      {/* Volume energy (inside) */}
      <mesh position={[0, dimensions.height / 2, 0]}>
        <sphereGeometry args={[volumeIntensity * 1.5, 16, 16]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.3} />
      </mesh>
      
      {/* Surface energy (outside) */}
      <mesh position={[0, dimensions.height / 2, 0]}>
        <torusGeometry args={[surfaceIntensity * 2 + 1, 0.1, 8, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Scene({ dimensions, goalType }: { dimensions: BuildingDimensions; goalType: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ffd6a5" />
      
      <Float speed={0.3} rotationIntensity={0} floatIntensity={0.1}>
        <Building dimensions={dimensions} />
        <EnergyFlow dimensions={dimensions} goalType={goalType} />
      </Float>
      
      <CityBackground />
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        maxDistance={15}
        minDistance={5}
      />
    </>
  );
}

export function BuildCityScene({ 
  phase, 
  dimensions, 
  goalType,
  onDimensionChange, 
  onBuildComplete 
}: BuildCitySceneProps) {
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  const surfaceArea = 2 * (
    dimensions.width * dimensions.height + 
    dimensions.height * dimensions.depth + 
    dimensions.width * dimensions.depth
  );

  return (
    <div className="h-screen w-full relative">
      <Canvas shadows camera={{ position: [8, 6, 8], fov: 50 }}>
        <color attach="background" args={['#fef3e2']} />
        <fog attach="fog" args={['#fef3e2', 15, 35]} />
        <Scene dimensions={dimensions} goalType={goalType} />
      </Canvas>

      {/* Dimension controls */}
      {phase === 'interaction' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-2xl p-6 w-96 max-w-[90vw]"
        >
          <div className="space-y-4 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Width</span>
                <span className="font-medium">{dimensions.width.toFixed(1)}</span>
              </div>
              <Slider
                value={[dimensions.width]}
                onValueChange={([v]) => onDimensionChange({ ...dimensions, width: v })}
                min={1}
                max={6}
                step={0.5}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Height</span>
                <span className="font-medium">{dimensions.height.toFixed(1)}</span>
              </div>
              <Slider
                value={[dimensions.height]}
                onValueChange={([v]) => onDimensionChange({ ...dimensions, height: v })}
                min={1}
                max={8}
                step={0.5}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Depth</span>
                <span className="font-medium">{dimensions.depth.toFixed(1)}</span>
              </div>
              <Slider
                value={[dimensions.depth]}
                onValueChange={([v]) => onDimensionChange({ ...dimensions, depth: v })}
                min={1}
                max={6}
                step={0.5}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">{volume.toFixed(0)}</div>
              <div>📦 Volume</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{surfaceArea.toFixed(0)}</div>
              <div>🧱 Surface</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{(volume / surfaceArea).toFixed(2)}</div>
              <div>⚖️ Ratio</div>
            </div>
          </div>

          <Button onClick={onBuildComplete} className="w-full">
            Submit Building Design
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
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl mb-3"
            >
              🏙️
            </motion.div>
            <p className="text-lg font-medium">Design your building wisely...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
