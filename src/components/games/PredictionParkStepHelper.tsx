import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';

interface PredictionParkStepHelperProps {
  step: number;
  onNextStep: () => void;
  onComplete: () => void;
}

const steps = [
  {
    title: "Watch the Bars",
    description: "See how each color's bar grows as experiments happen.",
    visual: "📊 Red: ████ Blue: ██ Green: █",
  },
  {
    title: "Find the Pattern",
    description: "The tallest bar happened the MOST times!",
    visual: "🏆 Tallest bar = Most common outcome",
  },
  {
    title: "Make Your Prediction",
    description: "Place your flag on the color that happened most!",
    visual: "🚩 Tap the flag of the tallest bar!",
  },
];

export function PredictionParkStepHelper({ step, onNextStep, onComplete }: PredictionParkStepHelperProps) {
  const currentStep = steps[Math.min(step, steps.length - 1)];
  const isLastStep = step >= steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-24 left-4 right-4 z-30 flex justify-center"
    >
      <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-bold text-foreground">{currentStep.title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onComplete} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-muted-foreground mb-4">{currentStep.description}</p>
        
        <div className="bg-muted/50 rounded-xl p-4 mb-4 text-center font-mono text-sm">
          <span>{currentStep.visual}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button 
            onClick={isLastStep ? onComplete : onNextStep}
            className="gap-2"
          >
            {isLastStep ? 'Got it!' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
