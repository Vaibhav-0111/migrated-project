import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface EquationStepHelperProps {
  variableCoeff: number;
  leftBlocks: number;
  rightBlocks: number;
  onComplete: () => void;
}

export function EquationStepHelper({ variableCoeff, leftBlocks, rightBlocks, onComplete }: EquationStepHelperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/90 backdrop-blur-sm z-30 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold">Step-by-Step Solution</h3>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Step 1: Remove constants from both sides</p>
            <p className="font-mono">2x + 4 = 10 → 2x = 6</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Step 2: Divide both sides by coefficient</p>
            <p className="font-mono">2x = 6 → x = 3</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium">Your current: {variableCoeff}x + {leftBlocks} = {rightBlocks}</p>
            <p className="text-sm text-muted-foreground">Goal: x = 3 (coeff=1, left=0, right=3)</p>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">Try Again</Button>
      </motion.div>
    </motion.div>
  );
}
