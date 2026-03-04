import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, RotateCcw, Divide } from 'lucide-react';
import { EquationFactoryScene } from '@/components/games/EquationFactoryScene';
import { GameFeedback } from '@/components/games/GameFeedback';
import { EquationStepHelper } from '@/components/games/EquationStepHelper';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { equationFactoryQuestions } from '@/data/gameQuizzes';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { EnhancedButton } from '@/components/ui/enhanced-button';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz' | 'complete';

const tutorialContent = {
  title: "Equation Factory",
  topic: "Solving Equations",
  explanation: "Welcome to the Equation Factory! Conveyor belts carry blocks representing numbers and a glowing cube for the variable. To solve the equation, TAP blocks on either side to remove them — but remember, you must remove from BOTH sides equally! Once only number blocks remain on the right and the variable on the left, tap 'Divide Both Sides' to find the answer. Keep the equation balanced at all times!"
};

// Progressive rounds
const rounds = [
  { leftConst: 3, rightConst: 7, coeff: 1, label: 'x + 3 = 7', solution: 4 },
  { leftConst: 4, rightConst: 10, coeff: 2, label: '2x + 4 = 10', solution: 3 },
  { leftConst: 2, rightConst: 11, coeff: 3, label: '3x + 2 = 11', solution: 3 },
  { leftConst: 5, rightConst: 17, coeff: 4, label: '4x + 5 = 17', solution: 3 },
];

export default function GameEquationFactory() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [currentRound, setCurrentRound] = useState(0);
  const [leftBlocks, setLeftBlocks] = useState(rounds[0].leftConst);
  const [rightBlocks, setRightBlocks] = useState(rounds[0].rightConst);
  const [variableCoeff, setVariableCoeff] = useState(rounds[0].coeff);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'encouragement'; message: string } | null>(null);

  const round = rounds[currentRound];

  const handleTutorialComplete = useCallback(() => {
    setPhase('animation');
    play('whoosh');
  }, [play]);

  const handleAnimationComplete = useCallback(() => {
    setPhase('interaction');
    play('correct');
  }, [play]);

  const handleRemoveFromBoth = useCallback(() => {
    if (leftBlocks > 0 && rightBlocks > 0) {
      setLeftBlocks(p => p - 1);
      setRightBlocks(p => p - 1);
      play('whoosh');
    }
  }, [leftBlocks, rightBlocks, play]);

  const handleDivideBoth = useCallback(() => {
    if (leftBlocks === 0 && variableCoeff > 1) {
      const newRight = rightBlocks / variableCoeff;
      if (Number.isInteger(newRight)) {
        setRightBlocks(newRight);
        setVariableCoeff(1);
        play('correct');
      }
    }
  }, [leftBlocks, variableCoeff, rightBlocks, play]);

  const handleCheckSolution = useCallback(() => {
    if (variableCoeff === 1 && leftBlocks === 0 && rightBlocks === round.solution) {
      setPhase('success');
      play('correct');
      setFeedback({
        type: 'success',
        message: `x = ${round.solution}! You solved ${round.label} perfectly!`
      });
    } else if (leftBlocks > 0) {
      play('incorrect');
      setFeedback({
        type: 'encouragement',
        message: `Remove ${leftBlocks} more block${leftBlocks > 1 ? 's' : ''} from both sides first!`
      });
      setTimeout(() => setFeedback(null), 2000);
    } else if (variableCoeff > 1) {
      play('incorrect');
      setFeedback({
        type: 'encouragement',
        message: `Now divide both sides by ${variableCoeff}!`
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [variableCoeff, leftBlocks, rightBlocks, round, play]);

  const handleSuccessComplete = useCallback(() => {
    setFeedback(null);
    if (currentRound < rounds.length - 1) {
      const next = currentRound + 1;
      setCurrentRound(next);
      setLeftBlocks(rounds[next].leftConst);
      setRightBlocks(rounds[next].rightConst);
      setVariableCoeff(rounds[next].coeff);
      setPhase('interaction');
    } else {
      setPhase('quiz');
    }
  }, [currentRound]);

  const handleHelperComplete = useCallback(() => {
    setPhase('interaction');
  }, []);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    const completed = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completed.includes('equation-factory')) {
      completed.push('equation-factory');
      localStorage.setItem('completedGames', JSON.stringify(completed));
    }
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores['equation-factory'] = { score, total, date: new Date().toISOString() };
    localStorage.setItem('quizScores', JSON.stringify(scores));
    setPhase('complete');
    play('celebration');
  }, [play]);

  const handleReset = useCallback(() => {
    setPhase('tutorial');
    setCurrentRound(0);
    setLeftBlocks(rounds[0].leftConst);
    setRightBlocks(rounds[0].rightConst);
    setVariableCoeff(rounds[0].coeff);
    setFeedback(null);
  }, []);

  const handleFeedbackComplete = useCallback(() => {
    if (phase === 'success') {
      handleSuccessComplete();
    } else {
      setFeedback(null);
    }
  }, [phase, handleSuccessComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-violet-50 to-indigo-50 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-indigo-950/10 overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <EnhancedButton variant="ghost" size="icon" onClick={() => navigate('/algebra')}>
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-lg font-bold text-foreground">Equation Factory</h1>
              <p className="text-xs text-muted-foreground">
                Round {currentRound + 1}/{rounds.length} • Solve: {round.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EnhancedButton variant="ghost" size="icon" onClick={() => { setPhase('helper'); }}>
              <HelpCircle className="h-5 w-5" />
            </EnhancedButton>
            <EnhancedButton variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-5 w-5" />
            </EnhancedButton>
          </div>
        </div>
      </motion.header>

      {/* 3D Scene */}
      {phase !== 'tutorial' && (
        <div className="w-full h-screen pt-16">
          <EquationFactoryScene
            phase={phase === 'quiz' || phase === 'complete' ? 'success' : phase as any}
            leftBlocks={leftBlocks}
            rightBlocks={rightBlocks}
            variableCoeff={variableCoeff}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}

      {/* Bottom control panel */}
      <AnimatePresence>
        {phase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-6"
          >
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-border">
              {/* Equation display */}
              <div className="text-center mb-4">
                <p className="text-2xl font-mono font-bold">
                  <span className="text-purple-600 dark:text-purple-400">{variableCoeff > 1 ? `${variableCoeff}x` : 'x'}</span>
                  {leftBlocks > 0 && <span> + {leftBlocks}</span>}
                  <span className="mx-2">=</span>
                  <span className="text-blue-600 dark:text-blue-400">{rightBlocks}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {leftBlocks > 0
                    ? `Step 1: Remove ${leftBlocks} from both sides`
                    : variableCoeff > 1
                    ? `Step 2: Divide both sides by ${variableCoeff}`
                    : `✓ Solved! x = ${rightBlocks}`}
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Button
                  variant="outline"
                  onClick={handleRemoveFromBoth}
                  disabled={leftBlocks === 0}
                  className="text-sm gap-2"
                >
                  ➖ Remove 1 from both
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDivideBoth}
                  disabled={leftBlocks > 0 || variableCoeff <= 1}
                  className="text-sm gap-2"
                >
                  <Divide className="w-4 h-4" /> Divide by {variableCoeff}
                </Button>
              </div>

              <Button
                onClick={handleCheckSolution}
                className="w-full"
                size="lg"
              >
                Check Solution
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Helper */}
      <AnimatePresence>
        {phase === 'helper' && (
          <EquationStepHelper
            variableCoeff={variableCoeff}
            leftBlocks={leftBlocks}
            rightBlocks={rightBlocks}
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
        {phase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Algebra"
            gameTitle="Equation Factory"
            gameConcept="Solving Linear Equations"
            fallbackQuestions={equationFactoryQuestions}
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
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center max-w-md px-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-6xl mb-4">
                🏭✨
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Factory Complete!</h2>
              <p className="text-muted-foreground mb-4">You mastered equation solving!</p>
              <div className="bg-card rounded-lg p-4 mb-6 border">
                <h3 className="font-semibold mb-2">What you learned:</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• Remove the same amount from both sides</li>
                  <li>• Divide both sides by the coefficient</li>
                  <li>• Always keep the equation balanced</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <EnhancedButton onClick={handleReset}>Play Again</EnhancedButton>
                <EnhancedButton variant="outline" onClick={() => navigate('/algebra')}>Back to Chapter</EnhancedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
