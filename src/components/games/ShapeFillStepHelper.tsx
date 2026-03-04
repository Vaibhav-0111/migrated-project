import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, RotateCcw } from 'lucide-react';

interface ShapeFillStepHelperProps {
  currentFill: number;
  targetFill: number;
  shapeName: string;
  onComplete: () => void;
}

export function ShapeFillStepHelper({ currentFill, targetFill, shapeName, onComplete }: ShapeFillStepHelperProps) {
  const difference = currentFill - targetFill;
  const isOverfilled = difference > 0;
  const percentDiff = Math.abs(Math.round(difference * 100));

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
                <h3 className="font-semibold text-lg">Almost There!</h3>
                <p className="text-sm text-muted-foreground">Let's adjust the fill level</p>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Your fill:</span>
                <span className="text-lg font-bold text-primary">{Math.round(currentFill * 100)}%</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Target:</span>
                <span className="text-lg font-bold text-emerald-600">{Math.round(targetFill * 100)}%</span>
              </div>
              <div className="h-1 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isOverfilled ? 'bg-amber-500' : 'bg-cyan-500'}`}
                  style={{ width: `${Math.min(currentFill * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-cyan-800 dark:text-cyan-200">
                {isOverfilled ? (
                  <>
                    <strong>Too much!</strong> You poured {percentDiff}% more than needed. 
                    The {shapeName} is overflowing!
                  </>
                ) : (
                  <>
                    <strong>Not quite enough!</strong> You need {percentDiff}% more liquid 
                    to reach the target line.
                  </>
                )}
              </p>
            </div>

            <div className="text-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl"
              >
                {isOverfilled ? '💦' : '💧'}
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
