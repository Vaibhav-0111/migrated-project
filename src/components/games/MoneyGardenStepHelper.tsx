import { motion } from 'framer-motion';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface MoneyGardenStepHelperProps {
  step: number;
  onNext: () => void;
  onComplete: () => void;
}

const steps = [
  {
    title: "Plant Your Seeds",
    description: "Each plant starts small - just like when you first save money!",
    visual: "🌱",
    hint: "Small starts lead to big growth",
  },
  {
    title: "Water to Grow",
    description: "Tap on plants to water them. More water = more growth. Like adding money to savings!",
    visual: "💧",
    hint: "Regular watering helps plants grow bigger",
  },
  {
    title: "Watch Time Pass",
    description: "The longer you wait, the more your plants grow. This is like interest - money grows over time!",
    visual: "⏰",
    hint: "Patience makes savings grow",
  },
  {
    title: "Harvest Your Rewards",
    description: "When plants are fully grown, they bloom with golden coins. Your savings have grown!",
    visual: "🌻💰",
    hint: "Growth takes time but the reward is worth it!",
  },
];

export function MoneyGardenStepHelper({ step, onNext, onComplete }: MoneyGardenStepHelperProps) {
  const currentStep = steps[step] || steps[0];
  const isLastStep = step >= steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md"
    >
      <div className="rounded-2xl bg-card/95 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-800 shadow-xl p-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step
                  ? 'bg-emerald-500'
                  : i < step
                  ? 'bg-emerald-300'
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
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center">
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
