import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { InteractiveButton } from '@/components/animations/InteractiveElements';

interface GameFeedbackProps {
  type: 'success' | 'encouragement';
  message: string;
  onComplete: () => void;
}

// Pastel confetti particle
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  shape: 'circle' | 'square' | 'star';
}

export function GameFeedback({ type, message, onComplete }: GameFeedbackProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  const pastelColors = [
    '#B4A7D6', // lavender
    '#A8D5BA', // mint
    '#F5C4A8', // peach
    '#F5B5C4', // pink
    '#A8D5F5', // sky blue
    '#F5E6A8', // soft yellow
  ];

  useEffect(() => {
    // Generate more varied confetti particles
    const shapes: ('circle' | 'square' | 'star')[] = ['circle', 'square', 'star'];
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 30,
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setParticles(newParticles);

    // Show message with slight delay for dramatic effect
    setTimeout(() => setShowMessage(true), 400);
    
    // Auto-continue for success feedback after 2.5 seconds
    if (type === 'success') {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Soft radial overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-radial from-background/60 via-background/40 to-background/80 backdrop-blur-sm" 
      />

      {/* Confetti with varied shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              rotate: particle.rotation,
              scale: 0,
            }}
            animate={{
              y: '120vh',
              rotate: particle.rotation + 720 * (Math.random() > 0.5 ? 1 : -1),
              scale: [0, 1, 1, 0.5],
            }}
            transition={{
              duration: 3.5,
              delay: particle.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'star' ? '0' : '2px',
              clipPath: particle.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined,
            }}
          />
        ))}
      </div>

      {/* Message card with enhanced animation */}
      {showMessage && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="relative z-10 bg-card rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center border border-border/50"
        >
          {/* Animated sparkle icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 8 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>

          {/* Message with typewriter-like effect */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-foreground mb-3"
          >
            {message}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-6"
          >
            You have understood how this concept works!
          </motion.p>

          {/* Enhanced continue button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <InteractiveButton
              onClick={onComplete}
              variant="bouncy"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground font-medium shadow-lg"
            >
              Continue
            </InteractiveButton>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
