import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Scale, Zap } from 'lucide-react';

interface WaveStepHelperProps {
  currentTheta: number;
  targetTheta: number;
  sinSquared: number;
  cosSquared: number;
  onComplete: () => void;
}

export function WaveStepHelper({ 
  currentTheta, 
  targetTheta, 
  sinSquared, 
  cosSquared, 
  onComplete 
}: WaveStepHelperProps) {
  const [step, setStep] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const isSinHigher = sinSquared > cosSquared;
  const needsHigherAngle = currentTheta < targetTheta;

  useEffect(() => {
    const timer1 = setTimeout(() => setShowAnimation(true), 600);
    const timer2 = setTimeout(() => setStep(1), 2500);
    const timer3 = setTimeout(() => setStep(2), 4000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
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

      {/* Visual balance animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <svg width="300" height="200" className="opacity-90">
              {/* Balance scale base */}
              <motion.line
                x1="150" y1="180" x2="150" y2="100"
                stroke="#B8B0C8" strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Balance beam */}
              <motion.g
                initial={{ rotate: 0 }}
                animate={{ rotate: isSinHigher ? -15 : 15 }}
                transition={{ delay: 0.8, duration: 1 }}
                style={{ transformOrigin: '150px 100px' }}
              >
                <line x1="60" y1="100" x2="240" y2="100" stroke="#A8A0B8" strokeWidth="6" />
                
                {/* Sin side */}
                <motion.circle
                  cx="80" cy="100"
                  initial={{ r: 15 }}
                  animate={{ r: 15 + sinSquared * 20 }}
                  fill="#A78BFA"
                  transition={{ delay: 1, duration: 0.8 }}
                />
                
                {/* Cos side */}
                <motion.circle
                  cx="220" cy="100"
                  initial={{ r: 15 }}
                  animate={{ r: 15 + cosSquared * 20 }}
                  fill="#818CF8"
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </motion.g>
              
              {/* Labels */}
              <motion.text
                x="80" y="60"
                fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                sin² = {(sinSquared * 100).toFixed(0)}%
              </motion.text>
              
              <motion.text
                x="220" y="60"
                fill="#818CF8" fontSize="12" fontWeight="bold" textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                cos² = {(cosSquared * 100).toFixed(0)}%
              </motion.text>
              
              {/* Balance point indicator */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
              >
                <text x="150" y="30" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Balance at 45°
                </text>
                <text x="150" y="45" fill="#22c55e" fontSize="10" textAnchor="middle">
                  (50% each)
                </text>
              </motion.g>
              
              {/* Arrow showing direction */}
              <motion.g
                initial={{ opacity: 0, x: needsHigherAngle ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 }}
              >
                <text 
                  x={needsHigherAngle ? 270 : 30} 
                  y="140" 
                  fill="#B4A7D6" 
                  fontSize="24"
                >
                  {needsHigherAngle ? '→' : '←'}
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
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`} 
              />
            ))}
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
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-100 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">The energies are unbalanced</h3>
                <p className="text-sm text-muted-foreground">
                  {isSinHigher ? 'Sin energy is stronger' : 'Cos energy is stronger'}
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
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  The total always equals 100%
                </h3>
                <p className="text-sm text-muted-foreground">
                  sin² + cos² = 1 (always!)
                </p>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">45°</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Move {needsHigherAngle ? 'higher' : 'lower'}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  At 45°, both energies are exactly 50%
                </p>
                <p className="text-xs text-primary font-medium">
                  You were at {currentTheta}°
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={onComplete}
            className="w-full mt-4 gap-2"
            variant={step === 2 ? 'default' : 'outline'}
          >
            {step === 2 ? 'Try Again' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
