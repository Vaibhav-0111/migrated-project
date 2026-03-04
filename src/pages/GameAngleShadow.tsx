import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AngleShadowScene } from '@/components/games/AngleShadowScene';
import { GameFeedback } from '@/components/games/GameFeedback';
import { StepWiseHelper } from '@/components/games/StepWiseHelper';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { angleShadowQuestions } from '@/data/gameQuizzes';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz' | 'complete';

// Tutorial content for this game
const tutorialContent = {
  title: "Shadow Garden Challenge",
  topic: "Angles & Trigonometry",
  explanation: "Welcome to the Shadow Garden! In this game, you will learn how the angle of the sun affects the length and position of shadows. When the sun is low in the sky, shadows are long. When the sun is high, shadows are short. This is because of trigonometry - the relationship between angles and the sides of triangles. Your goal is to position the sun at just the right angle so the tree's shadow covers the bench. Think about it: as you change the sun's angle, watch how the shadow changes. Can you find the perfect angle?"
};

export default function GameAngleShadow() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [sunAngle, setSunAngle] = useState(45);
  const [attempts, setAttempts] = useState(0);

  // Target: shadow should cover the bench (angle ~60 degrees)
  const targetAngle = 60;
  const tolerance = 3;

  const handleTutorialComplete = useCallback(() => {
    setPhase('animation');
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setPhase('interaction');
  }, []);

  const handleAngleChange = useCallback((newAngle: number) => {
    setSunAngle(newAngle);
  }, []);

  const handleCheckAnswer = useCallback(() => {
    setAttempts(prev => prev + 1);
    
    if (Math.abs(sunAngle - targetAngle) <= tolerance) {
      setPhase('success');
    } else {
      setPhase('helper');
    }
  }, [sunAngle]);

  const handleHelperComplete = useCallback(() => {
    setPhase('interaction');
  }, []);

  const handleSuccessComplete = useCallback(() => {
    // Move to quiz after success
    setPhase('quiz');
  }, []);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    // Mark game as completed
    const completed = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completed.includes('angle-shadow-garden')) {
      completed.push('angle-shadow-garden');
      localStorage.setItem('completedGames', JSON.stringify(completed));
    }
    // Store quiz score
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores['angle-shadow-garden'] = { score, total, date: new Date().toISOString() };
    localStorage.setItem('quizScores', JSON.stringify(scores));
    navigate('/chapters');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 overflow-hidden">
      {/* Minimal Header */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/chapters')}
          className="bg-background/80 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Tutorial Phase */}
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

      {/* Phase Indicator - subtle */}
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
                Watch and learn...
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
                Make the shadow cover half the bench
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3D Scene - show after tutorial */}
      {phase !== 'tutorial' && (
        <div className="w-full h-screen">
          <AngleShadowScene
            phase={phase === 'quiz' ? 'success' : phase as 'animation' | 'interaction' | 'success' | 'helper'}
            sunAngle={sunAngle}
            onAngleChange={handleAngleChange}
            onAnimationComplete={handleAnimationComplete}
            targetAngle={targetAngle}
          />
        </div>
      )}

      {/* Angle Slider - only during interaction */}
      <AnimatePresence>
        {phase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-8"
          >
            <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              {/* Sun position indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Sun Position</span>
                <span className="text-lg font-bold text-primary">{sunAngle}°</span>
              </div>
              
              {/* Custom styled slider */}
              <div className="relative h-2 bg-muted rounded-full mb-6">
                <div 
                  className="absolute h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full transition-all"
                  style={{ width: `${(sunAngle / 90) * 100}%` }}
                />
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={sunAngle}
                  onChange={(e) => handleAngleChange(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-amber-400 border-4 border-background rounded-full shadow-lg transition-all"
                  style={{ left: `calc(${(sunAngle / 90) * 100}% - 12px)` }}
                />
              </div>

              <Button
                onClick={handleCheckAnswer}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                Check Shadow
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Feedback */}
      <AnimatePresence>
        {phase === 'success' && (
          <GameFeedback
            type="success"
            message="Well done!"
            onComplete={handleSuccessComplete}
          />
        )}
      </AnimatePresence>

      {/* Step-wise Helper */}
      <AnimatePresence>
        {phase === 'helper' && (
          <StepWiseHelper
            currentAngle={sunAngle}
            targetAngle={targetAngle}
            onComplete={handleHelperComplete}
          />
        )}
      </AnimatePresence>

      {/* Quiz Phase */}
      <AnimatePresence>
        {phase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Trigonometry"
            gameTitle="Shadow Garden Challenge"
            gameConcept="Angles & Shadows using Trigonometry"
            fallbackQuestions={angleShadowQuestions}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
