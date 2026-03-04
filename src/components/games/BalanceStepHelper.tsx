import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface BalanceStepHelperProps {
  leftSide: { apples: number; boxes: number };
  rightSide: { apples: number; boxes: number };
  onComplete: () => void;
}

export function BalanceStepHelper({ leftSide, rightSide, onComplete }: BalanceStepHelperProps) {
  const boxValue = 3;
  const leftTotal = leftSide.boxes * boxValue + leftSide.apples;
  const rightTotal = rightSide.boxes * boxValue + rightSide.apples;

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
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold">Let's Balance It!</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm mb-2">Current state:</p>
            <p className="font-mono text-center text-lg">
              📦×{leftSide.boxes} + 🍎×{leftSide.apples} = 📦×{rightSide.boxes} + 🍎×{rightSide.apples}
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Left total: {leftTotal} | Right total: {rightTotal}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm"><strong>Goal:</strong> x + 2 = 5, so x = 3</p>
            <p className="text-sm">📦 (mystery box) contains the value 3</p>
            <p className="text-sm text-muted-foreground">
              Keep 1 box on left with 2 apples, and 5 apples on right to balance!
            </p>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">Try Again</Button>
      </motion.div>
    </motion.div>
  );
}
