import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, RotateCcw } from 'lucide-react';

interface WrapGiftStepHelperProps {
  coveredFaces: number[];
  totalFaces: number;
  shapeName: string;
  onComplete: () => void;
}

export function WrapGiftStepHelper({ coveredFaces, totalFaces, shapeName, onComplete }: WrapGiftStepHelperProps) {
  const missingCount = totalFaces - coveredFaces.length;
  const missingFaces = Array.from({ length: totalFaces })
    .map((_, i) => i)
    .filter(i => !coveredFaces.includes(i));

  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];

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
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Some faces are uncovered!</h3>
                <p className="text-sm text-muted-foreground">Let's find the missing wrapping</p>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Covered faces:</span>
                <span className="text-lg font-bold text-primary">{coveredFaces.length}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Total faces:</span>
                <span className="text-lg font-bold text-emerald-600">{totalFaces}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: totalFaces }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded ${
                      coveredFaces.includes(i) ? 'bg-emerald-500' : 'bg-rose-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-rose-800 dark:text-rose-200">
                <strong>{missingCount} face{missingCount > 1 ? 's' : ''} still need wrapping:</strong>
                <br />
                {missingFaces.map(i => faceNames[i] || `Face ${i + 1}`).join(', ')}
              </p>
            </div>

            <div className="text-center mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl"
              >
                📦
              </motion.div>
              <p className="text-xs text-muted-foreground mt-2">
                Rotate the {shapeName} to find uncovered sides
              </p>
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
