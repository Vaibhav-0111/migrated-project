import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface PatternStepHelperProps {
  selectedSequence: number[];
  correctSequence: number[];
  onComplete: () => void;
}

export function PatternStepHelper({ selectedSequence, correctSequence, onComplete }: PatternStepHelperProps) {
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
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold">Pattern Hint</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm mb-2">Your sequence:</p>
            <p className="font-mono text-center text-lg">{selectedSequence.join(' → ') || 'Empty'}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm"><strong>Pattern rule:</strong> Each number DOUBLES</p>
            <div className="flex justify-center gap-2 text-lg font-mono">
              <span>1</span>
              <span className="text-muted-foreground">×2→</span>
              <span>2</span>
              <span className="text-muted-foreground">×2→</span>
              <span>4</span>
              <span className="text-muted-foreground">×2→</span>
              <span>8</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Formula: aₙ = 2^(n-1)
            </p>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">Try Again</Button>
      </motion.div>
    </motion.div>
  );
}
