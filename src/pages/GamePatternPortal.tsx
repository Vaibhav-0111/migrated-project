import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { PatternPortalScene } from '@/components/games/PatternPortalScene';
import { GameFeedback } from '@/components/games/GameFeedback';
import { PatternStepHelper } from '@/components/games/PatternStepHelper';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { patternPortalQuestions } from '@/data/gameQuizzes';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz' | 'complete';

const tutorialContent = {
  title: "Pattern Portal World",
  topic: "Patterns & Substitution",
  explanation: "Welcome to the Pattern Portal World! In this mystical space, floating portals transform objects according to hidden rules. Watch carefully as shapes enter portals and emerge changed. Colors shift, sizes grow, patterns repeat. Your mission is to discover the pattern rule and choose the right sequence to activate the final portal. Remember: in algebra, we often substitute one expression for another. If you know the rule, you can predict what comes next. Explore, experiment, and unlock the secrets of patterns!"
};

export default function GamePatternPortal() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [selectedSequence, setSelectedSequence] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  
  // Pattern: Each number doubles (1, 2, 4, 8)
  const correctSequence = [1, 2, 4, 8];
  const availableNumbers = [1, 2, 3, 4, 6, 8, 10, 16];

  const handleTutorialComplete = useCallback(() => {
    setPhase('animation');
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setPhase('interaction');
  }, []);

  const handleSelectNumber = useCallback((num: number) => {
    if (selectedSequence.length < 4) {
      setSelectedSequence(prev => [...prev, num]);
    }
  }, [selectedSequence]);

  const handleClearSequence = useCallback(() => {
    setSelectedSequence([]);
  }, []);

  const handleCheckPattern = useCallback(() => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = selectedSequence.length === 4 && 
      selectedSequence.every((num, i) => num === correctSequence[i]);
    
    if (isCorrect) {
      setPhase('success');
    } else {
      setPhase('helper');
    }
  }, [selectedSequence]);

  const handleHelperComplete = useCallback(() => {
    setSelectedSequence([]);
    setPhase('interaction');
  }, []);

  const handleSuccessComplete = useCallback(() => {
    setPhase('quiz');
  }, []);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    const completed = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completed.includes('pattern-portal')) {
      completed.push('pattern-portal');
      localStorage.setItem('completedGames', JSON.stringify(completed));
    }
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores['pattern-portal'] = { score, total, date: new Date().toISOString() };
    localStorage.setItem('quizScores', JSON.stringify(scores));
    navigate('/algebra');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-blue-50 to-cyan-50 overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/algebra')}
          className="bg-background/80 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

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

      <AnimatePresence mode="wait">
        {phase === 'animation' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-background/80 backdrop-blur-sm px-6 py-2 rounded-full">
              <p className="text-sm text-muted-foreground">
                Watch the patterns...
              </p>
            </div>
          </motion.div>
        )}

        {phase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-background/80 backdrop-blur-sm px-6 py-2 rounded-full">
              <p className="text-sm text-foreground font-medium">
                Find the pattern: 1 → ? → ? → ?
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== 'tutorial' && (
        <div className="w-full h-screen">
          <PatternPortalScene
            phase={phase === 'quiz' ? 'success' : phase as 'animation' | 'interaction' | 'success' | 'helper'}
            selectedSequence={selectedSequence}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}

      <AnimatePresence>
        {phase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4"
          >
            <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Your sequence:</p>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-lg font-bold"
                    >
                      {selectedSequence[i] || '?'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {availableNumbers.map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectNumber(num)}
                    disabled={selectedSequence.length >= 4}
                    className="w-10 h-10"
                  >
                    {num}
                  </Button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearSequence}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCheckPattern}
                  disabled={selectedSequence.length !== 4}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Activate Portal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'success' && (
          <GameFeedback
            type="success"
            message="You figured it out!"
            onComplete={handleSuccessComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'helper' && (
          <PatternStepHelper
            selectedSequence={selectedSequence}
            correctSequence={correctSequence}
            onComplete={handleHelperComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Algebra"
            gameTitle="Pattern Portal World"
            gameConcept="Patterns & Substitution"
            fallbackQuestions={patternPortalQuestions}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
