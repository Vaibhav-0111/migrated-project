import { useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { LiquidLabScene } from '@/components/games/LiquidLabScene';
import { LiquidLabStepHelper } from '@/components/games/LiquidLabStepHelper';
import { GameFeedback } from '@/components/games/GameFeedback';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { liquidLabQuiz } from '@/data/gameQuizzes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAppStore } from '@/store/useAppStore';

export default function GameLiquidLab() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { settings, updateSettings } = useAppStore();
  
  const [gamePhase, setGamePhase] = useState<'tutorial' | 'animation' | 'play' | 'quiz' | 'complete'>('tutorial');
  const [showHelper, setShowHelper] = useState(false);
  const [helperStep, setHelperStep] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'encouragement'; message: string } | null>(null);
  const [score, setScore] = useState(0);

  const handleTutorialComplete = useCallback(() => {
    setGamePhase('animation');
    play('whoosh');
  }, [play]);

  const handleAnimationComplete = useCallback(() => {
    setGamePhase('play');
    play('correct');
  }, [play]);

  const handleCorrectAnswer = useCallback(() => {
    setScore(prev => prev + 1);
    setFeedback({ type: 'success', message: 'Nice match!' });
    play('correct');
    
    setTimeout(() => {
      setFeedback(null);
      if (score + 1 >= 3) {
        setGamePhase('quiz');
      }
    }, 2000);
  }, [score, play]);

  const handleIncorrectAnswer = useCallback(() => {
    setFeedback({ type: 'encouragement', message: 'Watch the levels...' });
    play('incorrect');
    setShowHelper(true);
    setHelperStep(0);
    
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  }, [play]);

  const handleHelperComplete = useCallback(() => {
    setShowHelper(false);
    setHelperStep(0);
  }, []);

  const handleQuizComplete = useCallback((quizScore: number, total: number) => {
    setGamePhase('complete');
    play('celebration');
  }, [play]);

  const handleReset = useCallback(() => {
    setGamePhase('tutorial');
    setScore(0);
    setShowHelper(false);
    setFeedback(null);
  }, []);

  const handleFeedbackComplete = useCallback(() => {
    setFeedback(null);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-cyan-50 to-blue-100 dark:from-cyan-950/20 dark:to-blue-950/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <EnhancedButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/fractions')}
            >
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-lg font-bold text-foreground">Liquid Measure Lab</h1>
              <p className="text-xs text-muted-foreground">Fractions, decimals & percentages</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <EnhancedButton variant="ghost" size="icon" onClick={() => setShowHelper(true)}>
              <HelpCircle className="h-5 w-5" />
            </EnhancedButton>
            <EnhancedButton variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-5 w-5" />
            </EnhancedButton>
          </div>
        </div>
      </motion.header>

      {/* 3D Scene */}
      <div className="absolute inset-0 pt-16">
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas camera={{ position: [0, 4, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <LiquidLabScene 
              phase={gamePhase}
              onAnimationComplete={handleAnimationComplete}
              onCorrect={handleCorrectAnswer}
              onIncorrect={handleIncorrectAnswer}
            />
            <OrbitControls 
              enablePan={false} 
              enableZoom={false}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 4}
            />
            <Environment preset="studio" />
          </Canvas>
        </Suspense>
      </div>

      {/* Tutorial */}
      <AnimatePresence>
        {gamePhase === 'tutorial' && (
          <GameTutorial
            title="Liquid Measure Lab"
            topic="Connecting Representations"
            explanation="Welcome to the lab! Here you'll discover that fractions, decimals, and percentages are all different ways to show the SAME amount. Pour liquid between containers and watch how half a glass is 0.5, which is also 50%. They're all connected!"
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Step Helper */}
      <AnimatePresence>
        {showHelper && (
          <LiquidLabStepHelper
            step={helperStep}
            onNext={() => setHelperStep(prev => prev + 1)}
            onComplete={handleHelperComplete}
          />
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <GameFeedback
            type={feedback.type}
            message={feedback.message}
            onComplete={handleFeedbackComplete}
          />
        )}
      </AnimatePresence>

      {/* Quiz */}
      <AnimatePresence>
        {gamePhase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Fractions/Decimals/Percentages/Interest"
            gameTitle="Liquid Measure Lab"
            gameConcept="Fractions, Decimals & Percentages"
            fallbackQuestions={liquidLabQuiz}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {gamePhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-4"
              >
                🧪
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Brilliant Scientist!
              </h2>
              <p className="text-muted-foreground mb-6">
                You understand how fractions, decimals & percentages connect!
              </p>
              <div className="flex gap-4 justify-center">
                <EnhancedButton onClick={handleReset}>
                  Play Again
                </EnhancedButton>
                <EnhancedButton variant="outline" onClick={() => navigate('/fractions')}>
                  Back to Chapter
                </EnhancedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
