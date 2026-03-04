import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sun, Ruler } from 'lucide-react';

interface StepWiseHelperProps {
  currentAngle: number;
  targetAngle: number;
  onComplete: () => void;
}

const steps = [
  {
    title: "Watch the shadow",
    description: "When the sun is higher, shadows are shorter",
    icon: Sun,
  },
  {
    title: "Find the right angle",
    description: "Move the sun until the shadow reaches the bench",
    icon: Ruler,
  },
];

export function StepWiseHelper({ currentAngle, targetAngle, onComplete }: StepWiseHelperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTriangle, setShowTriangle] = useState(false);

  const direction = currentAngle < targetAngle ? 'higher' : 'lower';

  useEffect(() => {
    // Auto-progress through visual steps
    const timer1 = setTimeout(() => setShowTriangle(true), 1000);
    const timer2 = setTimeout(() => setCurrentStep(1), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Dimmed background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" 
      />

      {/* Visual helper overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Ghost triangle visualization */}
        <AnimatePresence>
          {showTriangle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Animated triangle showing angle relationship */}
              <svg width="300" height="200" className="opacity-70">
                {/* Ground line */}
                <motion.line
                  x1="50"
                  y1="150"
                  x2="250"
                  y2="150"
                  stroke="#A8D5BA"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
                
                {/* Tree (vertical line) */}
                <motion.line
                  x1="200"
                  y1="150"
                  x2="200"
                  y2="50"
                  stroke="#8B7355"
                  strokeWidth="4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
                
                {/* Shadow line - animated to target */}
                <motion.line
                  x1="200"
                  y1="150"
                  x2="80"
                  y2="150"
                  stroke="#2d3436"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.8 }}
                />
                
                {/* Sun ray line */}
                <motion.line
                  x1="200"
                  y1="50"
                  x2="80"
                  y2="150"
                  stroke="#FFB347"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
                
                {/* Angle arc */}
                <motion.path
                  d={`M 180 150 A 20 20 0 0 1 ${180 + 20 * Math.cos(Math.PI - targetAngle * Math.PI / 180)} ${150 - 20 * Math.sin(targetAngle * Math.PI / 180)}`}
                  fill="none"
                  stroke="#B4A7D6"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                />
                
                {/* Angle label */}
                <motion.text
                  x="155"
                  y="140"
                  fill="#B4A7D6"
                  fontSize="14"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  {targetAngle}°
                </motion.text>

                {/* Small sun icon */}
                <motion.circle
                  cx="80"
                  cy="50"
                  r="15"
                  fill="#FFE4B5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-8 left-4 right-4 max-w-md mx-auto"
      >
        <div className="bg-card rounded-2xl p-6 shadow-lg">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Current step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className="w-6 h-6 text-primary" />;
                })()}
              </div>
              
              <h3 className="text-lg font-semibold mb-2">
                {steps[currentStep].title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                {steps[currentStep].description}
              </p>

              {/* Hint about direction */}
              {currentStep === 1 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-primary font-medium mb-4"
                >
                  Try moving the sun {direction} ↗
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Continue button */}
          <Button
            onClick={onComplete}
            className="w-full gap-2"
            variant={currentStep === steps.length - 1 ? 'default' : 'outline'}
          >
            {currentStep === steps.length - 1 ? 'Try Again' : 'I understand'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
