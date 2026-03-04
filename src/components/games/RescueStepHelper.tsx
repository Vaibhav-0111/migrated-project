import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUp, ArrowDown, Target } from 'lucide-react';

interface RescueStepHelperProps {
  currentAngle: number;
  targetAngle: number;
  onComplete: () => void;
}

export function RescueStepHelper({ currentAngle, targetAngle, onComplete }: RescueStepHelperProps) {
  const [step, setStep] = useState(0);
  const [showDiagram, setShowDiagram] = useState(false);

  const isAngleTooLow = currentAngle < targetAngle;
  const difference = Math.abs(currentAngle - targetAngle);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowDiagram(true), 800);
    const timer2 = setTimeout(() => setStep(1), 2500);
    
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
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />

      {/* Visual diagram */}
      <AnimatePresence>
        {showDiagram && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <svg width="320" height="220" className="opacity-80">
              {/* Ground */}
              <motion.line
                x1="40" y1="180" x2="280" y2="180"
                stroke="#A5D6A7" strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
              
              {/* Cliff (vertical) */}
              <motion.line
                x1="220" y1="180" x2="220" y2="60"
                stroke="#9E8B7D" strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              
              {/* Climber dot */}
              <motion.circle
                cx="220" cy="70" r="10"
                fill="#E57373"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              />
              
              {/* Current rope (wrong) */}
              <motion.line
                x1="80" y1="100"
                x2={80 + 140 * Math.cos((90 - currentAngle) * Math.PI / 180)}
                y2={100 + 140 * Math.sin((90 - currentAngle) * Math.PI / 180)}
                stroke="#FFAB91" strokeWidth="3" strokeDasharray="6,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              />
              
              {/* Target rope (correct) */}
              <motion.line
                x1="80" y1="100"
                x2={80 + 140 * Math.cos((90 - targetAngle) * Math.PI / 180)}
                y2={100 + 140 * Math.sin((90 - targetAngle) * Math.PI / 180)}
                stroke="#81C784" strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              />
              
              {/* Drone */}
              <motion.rect
                x="65" y="90" width="30" height="15"
                fill="#5C6BC0" rx="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              />
              
              {/* Angle arc - current */}
              <motion.path
                d={`M 100 100 A 25 25 0 0 1 ${100 + 25 * Math.cos((90 - currentAngle) * Math.PI / 180)} ${100 + 25 * Math.sin((90 - currentAngle) * Math.PI / 180)}`}
                fill="none" stroke="#FFAB91" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              />
              
              {/* Angle label - current */}
              <motion.text
                x="115" y="125"
                fill="#FF8A65" fontSize="12" fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                {currentAngle}°
              </motion.text>
              
              {/* Angle label - target */}
              <motion.text
                x="135" y="95"
                fill="#66BB6A" fontSize="12" fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                {targetAngle}°
              </motion.text>
              
              {/* Arrow showing direction */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                <text x="50" y="70" fill="#B4A7D6" fontSize="20">
                  {isAngleTooLow ? '↗' : '↘'}
                </text>
              </motion.g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-8 left-4 right-4 max-w-md mx-auto"
      >
        <div className="bg-card rounded-2xl p-6 shadow-lg">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${step >= 0 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">The rope missed!</h3>
                <p className="text-sm text-muted-foreground">
                  Watch the diagram to see where it should go
                </p>
              </motion.div>
            )}
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  {isAngleTooLow ? (
                    <ArrowUp className="w-6 h-6 text-primary" />
                  ) : (
                    <ArrowDown className="w-6 h-6 text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Move the angle {isAngleTooLow ? 'higher' : 'lower'}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  A {isAngleTooLow ? 'steeper' : 'gentler'} angle will {isAngleTooLow ? 'shorten' : 'lengthen'} the reach
                </p>
                <p className="text-xs text-primary font-medium">
                  You were {difference.toFixed(0)}° {isAngleTooLow ? 'too low' : 'too high'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={onComplete}
            className="w-full mt-4 gap-2"
            variant={step === 1 ? 'default' : 'outline'}
          >
            {step === 1 ? 'Try Again' : 'I understand'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
