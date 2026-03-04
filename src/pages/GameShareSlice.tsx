import { useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, RotateCcw, UndoIcon } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ShareSliceScene } from '@/components/games/ShareSliceScene';
import { ShareSliceStepHelper } from '@/components/games/ShareSliceStepHelper';
import { GameFeedback } from '@/components/games/GameFeedback';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { shareSliceQuiz } from '@/data/gameQuizzes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz' | 'complete';

const tutorialContent = {
  title: "Share & Slice Café",
  topic: "Fractions Basics",
  explanation: "Welcome to the Share & Slice Café! Here you'll learn that fractions are about sharing things EQUALLY. Tap a pizza slice to pick it up, then tap a friend to serve it to them. Your goal: give every friend the SAME number of slices. If a pizza has 6 slices and there are 3 friends, each friend should get exactly 2 slices (2/6 = 1/3 of the pizza). Think carefully — share fairly!"
};

// Challenges: slices available and people to serve
const challenges = [
  { slices: 4, targetPeople: 2, label: 'Easy: 4 slices ÷ 2 friends' },
  { slices: 6, targetPeople: 3, label: '6 slices ÷ 3 friends' },
  { slices: 8, targetPeople: 4, label: '8 slices ÷ 4 friends' },
  { slices: 6, targetPeople: 2, label: 'Tricky: 6 slices ÷ 2 friends' },
];

export default function GameShareSlice() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { settings } = useAppStore();

  const [gamePhase, setGamePhase] = useState<GamePhase>('tutorial');
  const [showHelper, setShowHelper] = useState(false);
  const [helperStep, setHelperStep] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'encouragement'; message: string } | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [servedPlates, setServedPlates] = useState<number[]>(new Array(challenges[0].targetPeople).fill(0));

  const challenge = challenges[currentRound];
  const slicesPerPerson = challenge.slices / challenge.targetPeople;

  // Init plates for current round
  const initPlates = useCallback((round: number) => {
    setServedPlates(new Array(challenges[round].targetPeople).fill(0));
  }, []);

  const handleTutorialComplete = useCallback(() => {
    setGamePhase('animation');
    initPlates(0);
    play('whoosh');
  }, [play, initPlates]);

  const handleAnimationComplete = useCallback(() => {
    setGamePhase('interaction');
    play('correct');
  }, [play]);

  const handleServeSlice = useCallback((personIndex: number) => {
    setServedPlates(prev => {
      const next = [...prev];
      const totalServed = next.reduce((a, b) => a + b, 0);
      if (totalServed >= challenge.slices) return prev; // no slices left
      next[personIndex] = (next[personIndex] || 0) + 1;

      // Check if all slices served
      const newTotal = next.reduce((a, b) => a + b, 0);
      if (newTotal >= challenge.slices) {
        // Check if equal
        const allEqual = next.every(n => n === next[0]) && next[0] > 0;
        setTimeout(() => {
          if (allEqual) {
            setGamePhase('success');
            play('correct');
            setFeedback({
              type: 'success',
              message: `Perfect! Each friend got ${next[0]} slice${next[0] > 1 ? 's' : ''} — that's ${next[0]}/${challenge.slices} = 1/${challenge.targetPeople} of the pizza each!`
            });
          } else {
            play('incorrect');
            setFeedback({
              type: 'encouragement',
              message: `Not quite equal! Some friends got more than others. Try again — everyone should get ${slicesPerPerson} slice${slicesPerPerson > 1 ? 's' : ''}.`
            });
            // Reset after delay
            setTimeout(() => {
              setFeedback(null);
              initPlates(currentRound);
            }, 2500);
          }
        }, 300);
      }
      return next;
    });
    play('whoosh');
  }, [challenge, slicesPerPerson, play, initPlates, currentRound]);

  const handleUndo = useCallback(() => {
    setServedPlates(prev => {
      const next = [...prev];
      // Find the last person who received a slice and remove one
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i] > 0) {
          next[i]--;
          break;
        }
      }
      return next;
    });
  }, []);

  const handleSuccessComplete = useCallback(() => {
    setFeedback(null);
    if (currentRound < challenges.length - 1) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      initPlates(nextRound);
      setGamePhase('interaction');
    } else {
      setGamePhase('quiz');
    }
  }, [currentRound, initPlates]);

  const handleHelperComplete = useCallback(() => {
    setShowHelper(false);
    setHelperStep(0);
    setGamePhase('interaction');
    setFeedback(null);
  }, []);

  const handleQuizComplete = useCallback((quizScore: number, total: number) => {
    const completed = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completed.includes('share-slice-cafe')) {
      completed.push('share-slice-cafe');
      localStorage.setItem('completedGames', JSON.stringify(completed));
    }
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores['share-slice-cafe'] = { score: quizScore, total, date: new Date().toISOString() };
    localStorage.setItem('quizScores', JSON.stringify(scores));
    setGamePhase('complete');
    play('celebration');
  }, [play]);

  const handleReset = useCallback(() => {
    setGamePhase('tutorial');
    setCurrentRound(0);
    setShowHelper(false);
    setFeedback(null);
    initPlates(0);
  }, [initPlates]);

  const handleFeedbackComplete = useCallback(() => {
    if (gamePhase === 'success') {
      handleSuccessComplete();
    } else {
      setFeedback(null);
    }
  }, [gamePhase, handleSuccessComplete]);

  const totalServed = servedPlates.reduce((a, b) => a + b, 0);
  const remaining = challenge.slices - totalServed;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <EnhancedButton variant="ghost" size="icon" onClick={() => navigate('/fractions')}>
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-lg font-bold text-foreground">Share & Slice Café</h1>
              <p className="text-xs text-muted-foreground">
                Round {currentRound + 1}/{challenges.length} • {challenge.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gamePhase === 'interaction' && totalServed > 0 && (
              <EnhancedButton variant="ghost" size="icon" onClick={handleUndo} title="Undo last serve">
                <UndoIcon className="h-5 w-5" />
              </EnhancedButton>
            )}
            <EnhancedButton variant="ghost" size="icon" onClick={() => { setShowHelper(true); setHelperStep(0); }}>
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
          <Canvas camera={{ position: [0, 6, 8], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <ShareSliceScene
              phase={gamePhase}
              slices={challenge.slices}
              targetPeople={challenge.targetPeople}
              servedPlates={servedPlates}
              onServeSlice={handleServeSlice}
              onAnimationComplete={handleAnimationComplete}
            />
            <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 4} />
            <Environment preset="apartment" />
          </Canvas>
        </Suspense>
      </div>

      {/* Bottom info panel during interaction */}
      <AnimatePresence>
        {gamePhase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-6"
          >
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-border">
              {/* Serving progress */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Serving Progress</span>
                <span className="text-sm text-muted-foreground">{totalServed}/{challenge.slices} slices served</span>
              </div>

              {/* Per-person breakdown */}
              <div className="flex gap-2 mb-3 justify-center">
                {servedPlates.map((count, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${
                      count === slicesPerPerson
                        ? 'bg-primary/10 border border-primary/30'
                        : count > 0
                        ? 'bg-secondary/50'
                        : 'bg-muted/30'
                    }`}
                  >
                    <span className="text-lg">👤</span>
                    <span className={`text-sm font-bold ${count === slicesPerPerson ? 'text-primary' : ''}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fraction hint */}
              <p className="text-xs text-center text-muted-foreground">
                {remaining > 0
                  ? `🍕 Tap a slice, then tap a friend to serve it (${remaining} left)`
                  : 'All slices served! Checking if it\'s fair...'}
              </p>

              {/* Reset round button */}
              {totalServed > 0 && remaining > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => initPlates(currentRound)}
                >
                  Start Over This Round
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial */}
      <AnimatePresence>
        {gamePhase === 'tutorial' && (
          <GameTutorial
            title={tutorialContent.title}
            topic={tutorialContent.topic}
            explanation={tutorialContent.explanation}
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Step Helper */}
      <AnimatePresence>
        {(showHelper || gamePhase === 'helper') && (
          <ShareSliceStepHelper
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
            gameTitle="Share & Slice Café"
            gameConcept="Fractions & Division"
            fallbackQuestions={shareSliceQuiz}
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
            <div className="text-center max-w-md px-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-6xl mb-4">
                🍕🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Amazing Work!</h2>
              <p className="text-muted-foreground mb-4">You've mastered sharing fractions!</p>
              <div className="bg-card rounded-lg p-4 mb-6 border">
                <h3 className="font-semibold mb-2">What you learned:</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• Fractions represent equal parts of a whole</li>
                  <li>• Fair sharing means everyone gets the same amount</li>
                  <li>• 6 slices ÷ 3 friends = 2 slices each (each gets 1/3)</li>
                  <li>• The fraction 2/6 simplifies to 1/3</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <EnhancedButton onClick={handleReset}>Play Again</EnhancedButton>
                <EnhancedButton variant="outline" onClick={() => navigate('/fractions')}>Back to Chapter</EnhancedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
