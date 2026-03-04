import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, HelpCircle, Plus, Minus } from 'lucide-react';
import { BalanceGardenScene } from '@/components/games/BalanceGardenScene';
import { GameFeedback } from '@/components/games/GameFeedback';
import { BalanceStepHelper } from '@/components/games/BalanceStepHelper';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { balanceGardenQuestions } from '@/data/gameQuizzes';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Badge } from '@/components/ui/badge';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz' | 'complete';

const tutorialContent = {
  title: "Balance Garden",
  topic: "Variables & Expressions",
  explanation: "Welcome to the Balance Garden! Imagine a stone scale with two sides. The mystery box (x) hides a number — your job is to figure out what x equals by keeping both sides balanced. Remove apples from both sides equally until the box stands alone. This is how algebra works!"
};

// Progressive rounds with increasing complexity
const rounds = [
  { equation: 'x + 2 = 5', left: { apples: 2, boxes: 1 }, right: { apples: 5, boxes: 0 }, answer: 3 },
  { equation: 'x + 4 = 7', left: { apples: 4, boxes: 1 }, right: { apples: 7, boxes: 0 }, answer: 3 },
  { equation: '2x = 6', left: { apples: 0, boxes: 2 }, right: { apples: 6, boxes: 0 }, answer: 3 },
  { equation: 'x + 1 = 4', left: { apples: 1, boxes: 1 }, right: { apples: 4, boxes: 0 }, answer: 3 },
];

export default function GameBalanceGarden() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();

  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [currentRound, setCurrentRound] = useState(0);
  const [leftSide, setLeftSide] = useState(rounds[0].left);
  const [rightSide, setRightSide] = useState(rounds[0].right);
  const [showHelper, setShowHelper] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'encouragement'; message: string } | null>(null);
  const [guessValue, setGuessValue] = useState(1);

  const round = rounds[currentRound];

  const handleTutorialComplete = useCallback(() => {
    setPhase('animation');
    play('whoosh');
  }, [play]);

  const handleAnimationComplete = useCallback(() => {
    setPhase('interaction');
    play('correct');
  }, [play]);

  const handleRemoveBothSides = useCallback(() => {
    setLeftSide(prev => ({ ...prev, apples: Math.max(0, prev.apples - 1) }));
    setRightSide(prev => ({ ...prev, apples: Math.max(0, prev.apples - 1) }));
    play('click');
  }, [play]);

  const handleAddBothSides = useCallback(() => {
    setLeftSide(prev => ({ ...prev, apples: prev.apples + 1 }));
    setRightSide(prev => ({ ...prev, apples: prev.apples + 1 }));
    play('click');
  }, [play]);

  const handleCheckAnswer = useCallback(() => {
    if (guessValue === round.answer) {
      play('correct');
      setFeedback({ type: 'success', message: `Correct! x = ${round.answer}. The equation ${round.equation} is balanced!` });
      setPhase('success');
    } else {
      play('incorrect');
      setFeedback({ type: 'encouragement', message: `Not quite. Try removing apples from both sides to isolate x.` });
      setPhase('helper');
    }
  }, [guessValue, round, play]);

  const handleSuccessComplete = useCallback(() => {
    setFeedback(null);
    if (currentRound < rounds.length - 1) {
      const next = currentRound + 1;
      setCurrentRound(next);
      setLeftSide(rounds[next].left);
      setRightSide(rounds[next].right);
      setGuessValue(1);
      setPhase('interaction');
    } else {
      setPhase('quiz');
    }
  }, [currentRound]);

  const handleHelperComplete = useCallback(() => {
    setShowHelper(false);
    setPhase('interaction');
    setFeedback(null);
  }, []);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    const completed = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completed.includes('balance-garden')) {
      completed.push('balance-garden');
      localStorage.setItem('completedGames', JSON.stringify(completed));
    }
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores['balance-garden'] = { score, total, date: new Date().toISOString() };
    localStorage.setItem('quizScores', JSON.stringify(scores));
    setPhase('complete');
    play('celebration');
  }, [play]);

  const handleReset = useCallback(() => {
    setPhase('tutorial');
    setCurrentRound(0);
    setLeftSide(rounds[0].left);
    setRightSide(rounds[0].right);
    setGuessValue(1);
    setShowHelper(false);
    setFeedback(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-50 to-lime-50 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-lime-950/10 overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/algebra')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Balance Garden</h1>
              <p className="text-xs text-muted-foreground">
                Round {currentRound + 1}/{rounds.length} • Solve: {round.equation}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{round.equation}</Badge>
            <Button variant="ghost" size="icon" onClick={() => { setShowHelper(true); }}>
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* 3D Scene */}
      {phase !== 'tutorial' && (
        <div className="w-full h-screen">
          <BalanceGardenScene
            phase={phase === 'quiz' || phase === 'complete' ? 'success' : phase as any}
            leftSide={leftSide}
            rightSide={rightSide}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}

      {/* Tutorial */}
      <AnimatePresence>
        {phase === 'tutorial' && (
          <GameTutorial
            title={tutorialContent.title}
            topic={tutorialContent.topic}
            explanation={tutorialContent.explanation}
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Interaction Controls */}
      <AnimatePresence>
        {phase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4"
          >
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
              {/* Current equation display */}
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-xl font-mono font-bold text-foreground">
                  📦×{leftSide.boxes} + 🍎×{leftSide.apples} = 🍎×{rightSide.apples}
                </p>
              </div>

              {/* Balance operations */}
              <div className="flex justify-center gap-3 mb-4">
                <Button
                  variant="outline"
                  onClick={handleRemoveBothSides}
                  disabled={leftSide.apples === 0 || rightSide.apples === 0}
                  className="gap-2"
                >
                  <Minus className="w-4 h-4" />
                  Remove 🍎 from both sides
                </Button>
                <Button variant="outline" onClick={handleAddBothSides} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add 🍎 to both sides
                </Button>
              </div>

              {/* Answer guess */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-sm font-medium text-muted-foreground">x =</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuessValue(v => Math.max(1, v - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-3xl font-bold text-primary w-12 text-center">{guessValue}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuessValue(v => Math.min(10, v + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleCheckAnswer} className="w-full" size="lg">
                Check Answer
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && phase === 'success' && (
          <GameFeedback type="success" message={feedback.message} onComplete={handleSuccessComplete} />
        )}
      </AnimatePresence>

      {/* Helper */}
      <AnimatePresence>
        {(showHelper || phase === 'helper') && (
          <BalanceStepHelper
            leftSide={leftSide}
            rightSide={rightSide}
            onComplete={handleHelperComplete}
          />
        )}
      </AnimatePresence>

      {/* Quiz */}
      <AnimatePresence>
        {phase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Algebra"
            gameTitle="Balance Garden"
            gameConcept="Variables & Expressions"
            fallbackQuestions={balanceGardenQuestions}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center max-w-md px-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-4"
              >
                ⚖️🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Balance Master!</h2>
              <p className="text-muted-foreground mb-4">
                You solved {rounds.length} equations by keeping both sides balanced!
              </p>
              <div className="bg-card rounded-lg p-4 mb-6 border">
                <h3 className="font-semibold mb-2">What you learned:</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• Whatever you do to one side, do to the other</li>
                  <li>• Isolate x by removing equal amounts</li>
                  <li>• Variables represent unknown numbers</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleReset} variant="outline">Play Again</Button>
                <Button onClick={() => navigate('/algebra')}>Back to Chapter</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
