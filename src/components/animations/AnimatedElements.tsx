import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function AnimatedText({ 
  children, 
  className = '',
  delay = 0,
  staggerDelay = 0.03
}: AnimatedTextProps) {
  const words = children.split(' ');

  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * staggerDelay }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

interface AnimatedNumberProps {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedNumber({ 
  value, 
  className = '',
  suffix = '',
  prefix = ''
}: AnimatedNumberProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      {prefix}{value}{suffix}
    </motion.span>
  );
}

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function RevealOnScroll({ 
  children, 
  className = '',
  direction = 'up'
}: RevealOnScrollProps) {
  const directionMap = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ShimmerProps {
  children: ReactNode;
  className?: string;
}

export function Shimmer({ children, className = '' }: ShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      />
    </div>
  );
}

interface SuccessCheckmarkProps {
  show: boolean;
  size?: number;
  className?: string;
}

export function SuccessCheckmark({ show, size = 60, className = '' }: SuccessCheckmarkProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      className={className}
    >
      <svg width={size} height={size} viewBox="0 0 60 60">
        {/* Circle */}
        <motion.circle
          cx="30"
          cy="30"
          r="28"
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Checkmark */}
        <motion.path
          d="M18 30 L26 38 L42 22"
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
}

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function RippleButton({ children, className = '', onClick }: RippleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.span
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 1 }}
        whileTap={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ borderRadius: '50%', transformOrigin: 'center' }}
      />
      {children}
    </motion.button>
  );
}
