import { motion } from 'framer-motion';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface LiquidLabStepHelperProps {
  step: number;
  onNext: () => void;
  onComplete: () => void;
}

const steps = [
  {
    title: "Look at the Fill Level",
    description: "See how much liquid is in each beaker. Compare to the marks on the side.",
    visual: "🧪",
    hint: "The lines show quarters: 1/4, 1/2, 3/4",
  },
  {
    title: "Half Means 50%",
    description: "When a beaker is half full, that's 1/2, or 0.5, or 50% - they're all the same!",
    visual: "½ = 0.5 = 50%",
    hint: "Half is always in the middle",
  },
  {
    title: "Match the Target",
    description: "Look for the red target line. Find the beaker that matches that level.",
    visual: "🎯",
    hint: "The ring at the top also shows the fill percentage",
  },
  {
    title: "Try Again!",
    description: "Now you know how to read the levels. Pick the beaker that matches 50%!",
    visual: "✨",
    hint: "You've got this!",
  },
];

export function LiquidLabStepHelper({ step, onNext, onComplete }: LiquidLabStepHelperProps) {
  const currentStep = steps[step] || steps[0];
  const isLastStep = step >= steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md"
    >
      <div className="rounded-2xl bg-card/95 backdrop-blur-sm border-2 border-cyan-200 dark:border-cyan-800 shadow-xl p-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step
                  ? 'bg-cyan-500'
                  : i < step
                  ? 'bg-cyan-300'
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
        <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-cyan-700 dark:text-cyan-300 text-center">
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
