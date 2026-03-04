import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, RotateCcw } from 'lucide-react';

interface BuildingDimensions {
  width: number;
  height: number;
  depth: number;
}

interface BuildCityStepHelperProps {
  dimensions: BuildingDimensions;
  goalType: 'storage' | 'material' | 'balanced';
  volume: number;
  surfaceArea: number;
  onComplete: () => void;
}

export function BuildCityStepHelper({ 
  dimensions, 
  goalType, 
  volume, 
  surfaceArea, 
  onComplete 
}: BuildCityStepHelperProps) {
  const ratio = volume / surfaceArea;

  const getHint = () => {
    switch (goalType) {
      case 'storage':
        if (volume < 64) {
          return {
            title: "Need More Storage Space!",
            hint: "Try making the building larger in all dimensions. Volume = Width × Height × Depth. Aim for at least 64 cubic units.",
            suggestion: "Increase height and width for more storage capacity."
          };
        }
        break;
      case 'material':
        if (ratio < 0.4) {
          return {
            title: "Using Too Much Material!",
            hint: "A cube-like shape uses less material per unit of volume. Try making dimensions more equal.",
            suggestion: "Make width, height, and depth closer to each other."
          };
        }
        if (volume < 24) {
          return {
            title: "Need More Space!",
            hint: "The building needs at least 24 cubic units of volume.",
            suggestion: "Increase dimensions while keeping the shape compact."
          };
        }
        break;
      case 'balanced':
        if (ratio < 0.35 || ratio > 0.5) {
          return {
            title: "Balance Needed!",
            hint: `Your ratio is ${ratio.toFixed(2)}. Aim for 0.35-0.50. A ratio closer to 0.4 means efficient use of materials for the space inside.`,
            suggestion: ratio < 0.35 
              ? "Make the building more compact (cube-like)." 
              : "Spread out the dimensions a bit more."
          };
        }
        if (volume < 32) {
          return {
            title: "More Volume Required!",
            hint: "The building needs at least 32 cubic units of volume for a balanced design.",
            suggestion: "Scale up while maintaining proportions."
          };
        }
        break;
    }
    
    return {
      title: "Almost There!",
      hint: "Your design is close but needs some adjustments.",
      suggestion: "Review the goal requirements and try again."
    };
  };

  const hint = getHint();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{hint.title}</h3>
                <p className="text-sm text-muted-foreground">Let's optimize the design</p>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4 mb-4">
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <div className="text-lg font-bold text-primary">{dimensions.width}</div>
                  <div className="text-xs text-muted-foreground">Width</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{dimensions.height}</div>
                  <div className="text-xs text-muted-foreground">Height</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{dimensions.depth}</div>
                  <div className="text-xs text-muted-foreground">Depth</div>
                </div>
              </div>
              <div className="flex justify-around text-sm">
                <span>📦 Volume: <strong>{volume}</strong></span>
                <span>🧱 Surface: <strong>{surfaceArea}</strong></span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                {hint.hint}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300 font-medium">
                💡 {hint.suggestion}
              </p>
            </div>

            <div className="text-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl"
              >
                🏗️
              </motion.div>
            </div>

            <Button onClick={onComplete} className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
