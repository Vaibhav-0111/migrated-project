import { useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { SpinnerDiceLabScene } from '@/components/games/SpinnerDiceLabScene';
import { SpinnerDiceStepHelper } from '@/components/games/SpinnerDiceStepHelper';
import { GameFeedback } from '@/components/games/GameFeedback';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { spinnerDiceLabQuiz } from '@/data/gameQuizzes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAppStore } from '@/store/useAppStore';

export default function GameSpinnerDiceLab() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { settings, updateSettings } = useAppStore();
  
  const [gamePhase, setGamePhase] = useState<'tutorial' | 'animation' | 'play' | 'quiz' | 'complete'>('tutorial');
  const [showHelper, setShowHelper] = useState(false);
  const [helperStep, setHelperStep] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'encouragement'; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const REQUIRED_ROUNDS = 3;

  const handleTutorialComplete = useCallback(() => {
    setGamePhase('animation');
    play('whoosh');
  }, [play]);

  const handleAnimationComplete = useCallback(() => {
    setGamePhase('play');
    play('correct');
  }, [play]);

  const handleCorrectAnswer = useCallback(() => {
    const newScore = score + 1;
    const newRounds = roundsCompleted + 1;
    setScore(newScore);
    setRoundsCompleted(newRounds);
    setFeedback({ type: 'success', message: 'Nice thinking!' });
    play('correct');
    
    console.log(`Spinner Dice Lab: Round ${newRounds}/${REQUIRED_ROUNDS} completed`);
    
    setTimeout(() => {
      setFeedback(null);
      if (newRounds >= REQUIRED_ROUNDS) {
        console.log('All rounds complete, moving to quiz');
        setGamePhase('quiz');
      }
    }, 1500);
  }, [score, roundsCompleted, play]);

  const handleIncorrectAnswer = useCallback(() => {
    setFeedback({ type: 'encouragement', message: 'Watch the sizes...' });
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
    console.log(`Quiz complete: ${quizScore}/${total}`);
    const existingScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    existingScores['spinner-dice-lab'] = { score: quizScore, total };
    localStorage.setItem('quizScores', JSON.stringify(existingScores));
    
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('spinner-dice-lab')) {
      completedGames.push('spinner-dice-lab');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    
    setGamePhase('complete');
    play('celebration');
  }, [play]);

  const handleReset = useCallback(() => {
    setGamePhase('tutorial');
    setScore(0);
    setRoundsCompleted(0);
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
              onClick={() => navigate('/probability')}
            >
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-lg font-bold text-foreground">Spinner & Dice Lab</h1>
              <p className="text-xs text-muted-foreground">Comparing outcomes & fairness</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {gamePhase === 'play' && (
              <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 mr-2">
                <span className="text-xs font-medium">
                  Round: <span className="text-primary font-bold">{roundsCompleted}/{REQUIRED_ROUNDS}</span>
                </span>
              </div>
            )}
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
            <SpinnerDiceLabScene 
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
            title="Spinner & Dice Lab"
            topic="Fairness & Comparing Outcomes"
            explanation="Welcome to the probability lab! Here you'll discover that BIGGER sections on a spinner mean MORE chance of landing there. Complete 3 rounds to unlock the quiz!"
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Step Helper */}
      <AnimatePresence>
        {showHelper && (
          <SpinnerDiceStepHelper
            step={helperStep}
            onNextStep={() => setHelperStep(prev => prev + 1)}
            onComplete={handleHelperComplete}
          />
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <GameFeedback type={feedback.type} message={feedback.message} onComplete={handleFeedbackComplete} />
        )}
      </AnimatePresence>

      {/* Quiz */}
      <AnimatePresence>
        {gamePhase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Probability"
            gameTitle="Spinner & Dice Lab"
            gameConcept="Experimental Probability & Dice"
            fallbackQuestions={spinnerDiceLabQuiz}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {gamePhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 rounded-3xl bg-card shadow-2xl max-w-md mx-4"
            >
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="text-6xl mb-4"
              >
                🎯
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-high-contrast">Lab Complete!</h2>
              <p className="text-muted-foreground mb-6">
                You understand how to compare chances!
              </p>
              <div className="flex gap-3 justify-center">
                <EnhancedButton onClick={handleReset} variant="outline">
                  Play Again
                </EnhancedButton>
                <EnhancedButton onClick={() => navigate('/probability')}>
                  Continue
                </EnhancedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Display */}
      {gamePhase === 'play' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="bg-card/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-border/50">
            <span className="text-sm font-medium text-muted-foreground">Correct predictions: </span>
            <span className="text-lg font-bold text-primary">{score}</span>
            <span className="text-sm text-muted-foreground ml-3">
              ({REQUIRED_ROUNDS - roundsCompleted} round{REQUIRED_ROUNDS - roundsCompleted !== 1 ? 's' : ''} left)
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
