import { motion } from 'framer-motion';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface ShareSliceStepHelperProps {
  step: number;
  onNext: () => void;
  onComplete: () => void;
}

const steps = [
  {
    title: "Count the Friends",
    description: "Look at how many friends want to share. Count them carefully!",
    visual: "👥",
    hint: "Each friend should get the same amount",
  },
  {
    title: "Count the Pieces",
    description: "Now look at the food. How many pieces do we have?",
    visual: "🍕",
    hint: "We need to divide equally",
  },
  {
    title: "Match Pieces to Friends",
    description: "Give each friend the same number of pieces. That's fair sharing!",
    visual: "✂️ → 👤👤👤👤",
    hint: "Everyone gets equal parts",
  },
  {
    title: "Check Your Work",
    description: "Does everyone have the same amount? That's a fraction - parts of a whole!",
    visual: "✅",
    hint: "Equal sharing = fractions!",
  },
];

export function ShareSliceStepHelper({ step, onNext, onComplete }: ShareSliceStepHelperProps) {
  const currentStep = steps[step] || steps[0];
  const isLastStep = step >= steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md"
    >
      <div className="rounded-2xl bg-card/95 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-800 shadow-xl p-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step
                  ? 'bg-amber-500'
                  : i < step
                  ? 'bg-amber-300'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Visual */}
        <div className="text-center mb-4">
          <span className="text-4xl">{currentStep.visual}</span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-center text-foreground mb-2">
          {currentStep.title}
        </h3>
        <p className="text-center text-muted-foreground mb-4">
          {currentStep.description}
        </p>

        {/* Hint */}
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
            💡 {currentStep.hint}
          </p>
        </div>

        {/* Action button */}
        <div className="flex justify-center">
          {isLastStep ? (
            <EnhancedButton onClick={onComplete} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </EnhancedButton>
          ) : (
            <EnhancedButton onClick={onNext} className="gap-2">
              Next Step
              <ChevronRight className="w-4 h-4" />
            </EnhancedButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}
