import { useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ChanceGardenScene } from '@/components/games/ChanceGardenScene';
import { ChanceGardenStepHelper } from '@/components/games/ChanceGardenStepHelper';
import { GameFeedback } from '@/components/games/GameFeedback';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { chanceGardenQuiz } from '@/data/gameQuizzes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAppStore } from '@/store/useAppStore';

export default function GameChanceGarden() {
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
    play('correct');
    
    console.log(`Chance Garden: Round ${newRounds}/${REQUIRED_ROUNDS} completed`);
    
    if (newRounds >= REQUIRED_ROUNDS) {
      // Show success feedback then go to quiz
      setFeedback({ type: 'success', message: 'All rounds complete! Time for the quiz!' });
      setTimeout(() => {
        setFeedback(null);
        setGamePhase('quiz');
      }, 2000);
    } else {
      setFeedback({ type: 'success', message: `Great! ${REQUIRED_ROUNDS - newRounds} more to go!` });
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  }, [score, roundsCompleted, play]);

  const handleIncorrectAnswer = useCallback(() => {
    setFeedback({ type: 'encouragement', message: 'Let\'s look closer...' });
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
    existingScores['chance-garden'] = { score: quizScore, total };
    localStorage.setItem('quizScores', JSON.stringify(existingScores));
    
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('chance-garden')) {
      completedGames.push('chance-garden');
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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-pink-50 to-rose-100 dark:from-pink-950/20 dark:to-rose-950/30">
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
              <h1 className="text-lg font-bold text-foreground">Chance Garden</h1>
              <p className="text-xs text-muted-foreground">Probability as likelihood</p>
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
          <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <ChanceGardenScene 
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
            <Environment preset="sunset" />
          </Canvas>
        </Suspense>
      </div>

      {/* Tutorial */}
      <AnimatePresence>
        {gamePhase === 'tutorial' && (
          <GameTutorial
            title="Chance Garden"
            topic="Probability Basics"
            explanation="Welcome to the Chance Garden! Here you'll discover that some things happen more often than others. When a basket has MORE balls of one color, that color is MORE likely to come out. Complete 3 rounds to unlock the quiz!"
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Step Helper */}
      <AnimatePresence>
        {showHelper && (
          <ChanceGardenStepHelper
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
            gameTitle="Chance Garden"
            gameConcept="Basic Probability & Events"
            fallbackQuestions={chanceGardenQuiz}
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
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                🌸
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-high-contrast">Amazing Work!</h2>
              <p className="text-muted-foreground mb-6">
                You understand that more balls means more chances!
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
            <span className="text-sm font-medium text-muted-foreground">Good choices: </span>
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
