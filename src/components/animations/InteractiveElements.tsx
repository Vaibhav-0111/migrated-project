import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  delay?: number;
}

export function InteractiveCard({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  delay = 0 
}: InteractiveCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        damping: 20, 
        stiffness: 100,
        delay 
      }}
      whileHover={!disabled ? { 
        y: -4,
        scale: 1.02,
        transition: { type: 'spring', damping: 15, stiffness: 300 }
      } : undefined}
      whileTap={!disabled ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined}
      onClick={!disabled ? onClick : undefined}
      className={`${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </motion.div>
  );
}

interface InteractiveButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'gentle' | 'bouncy';
}

export function InteractiveButton({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  variant = 'default'
}: InteractiveButtonProps) {
  const hoverVariants = {
    default: { scale: 1.02, y: -2 },
    gentle: { scale: 1.01, y: -1 },
    bouncy: { scale: 1.05, y: -3 },
  };

  const tapVariants = {
    default: { scale: 0.98 },
    gentle: { scale: 0.99 },
    bouncy: { scale: 0.95 },
  };

  return (
    <motion.button
      whileHover={!disabled ? {
        ...hoverVariants[variant],
        transition: { type: 'spring', damping: 10, stiffness: 400 }
      } : undefined}
      whileTap={!disabled ? {
        ...tapVariants[variant],
        transition: { duration: 0.1 }
      } : undefined}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export function FloatingElement({ 
  children, 
  className = '',
  amplitude = 8,
  duration = 3,
  delay = 0
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PulseElementProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export function PulseElement({ 
  children, 
  className = '',
  scale = 1.05,
  duration = 2
}: PulseElementProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GlowOnHoverProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowOnHover({ 
  children, 
  className = '',
  glowColor = 'hsl(var(--primary) / 0.3)'
}: GlowOnHoverProps) {
  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}`,
        transition: { duration: 0.3 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ProgressRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ProgressReveal({ 
  children, 
  className = '',
  delay = 0
}: ProgressRevealProps) {
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: '100%', opacity: 1 }}
      transition={{
        width: { duration: 0.8, ease: 'easeOut', delay },
        opacity: { duration: 0.3, delay }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
