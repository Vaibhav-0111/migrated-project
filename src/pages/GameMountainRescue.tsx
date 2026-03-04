import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MountainRescueScene } from '@/components/games/MountainRescueScene';
import { GameFeedback } from '@/components/games/GameFeedback';
import { RescueStepHelper } from '@/components/games/RescueStepHelper';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { mountainRescueQuestions } from '@/data/gameQuizzes';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz';

// Tutorial content for this game
const tutorialContent = {
  title: "Mountain Rescue Mission",
  topic: "Sine & Right Triangles",
  explanation: "A climber is stuck on a cliff and needs your help! In this game, you will use the sine function to calculate how to rescue them. The drone is at a certain angle from the climber. The sine of an angle in a right triangle equals the opposite side divided by the hypotenuse. Here, the opposite side is the height of the climber, and the hypotenuse is the rope length. By adjusting the drone angle, you change how much rope is needed. Find the right angle to reach the climber with the rope you have!"
};

export default function GameMountainRescue() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [droneAngle, setDroneAngle] = useState(30);
  const [attempts, setAttempts] = useState(0);

  // Target: angle ~55 degrees to reach the climber
  const targetAngle = 55;
  const tolerance = 4;

  const handleTutorialComplete = useCallback(() => {
    setPhase('animation');
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setPhase('interaction');
  }, []);

  const handleAngleChange = useCallback((newAngle: number) => {
    setDroneAngle(newAngle);
  }, []);

  const handleLaunchRope = useCallback(() => {
    setAttempts(prev => prev + 1);
    
    if (Math.abs(droneAngle - targetAngle) <= tolerance) {
      setPhase('success');
    } else {
      setPhase('helper');
    }
  }, [droneAngle]);

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
    if (!completed.includes('mountain-rope-rescue')) {
      completed.push('mountain-rope-rescue');
      localStorage.setItem('completedGames', JSON.stringify(completed));
    }
    // Store quiz score
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores['mountain-rope-rescue'] = { score, total, date: new Date().toISOString() };
    localStorage.setItem('quizScores', JSON.stringify(scores));
    navigate('/chapters');
  }, [navigate]);

  // Calculate rope length based on angle (tan relationship)
  const climberHeight = 40; // meters
  const ropeLength = climberHeight / Math.sin(droneAngle * Math.PI / 180);
  const horizontalDistance = climberHeight / Math.tan(droneAngle * Math.PI / 180);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-stone-200 overflow-hidden">
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

      {/* Phase Indicator */}
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
                Watch how angle affects the rope...
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
                Adjust the drone angle to rescue the climber
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3D Scene - show after tutorial */}
      {phase !== 'tutorial' && (
        <div className="w-full h-screen">
          <MountainRescueScene
            phase={phase === 'quiz' ? 'success' : phase as 'animation' | 'interaction' | 'success' | 'helper'}
            droneAngle={droneAngle}
            onAngleChange={handleAngleChange}
            onAnimationComplete={handleAnimationComplete}
            targetAngle={targetAngle}
          />
        </div>
      )}

      {/* Control Panel - only during interaction */}
      <AnimatePresence>
        {phase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-8"
          >
            <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              {/* Visual ratio bars */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Angle indicator */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Angle</div>
                  <div className="h-16 bg-muted rounded-lg relative overflow-hidden">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/60"
                      animate={{ height: `${(droneAngle / 90) * 100}%` }}
                      transition={{ type: 'spring', damping: 20 }}
                    />
                  </div>
                  <div className="text-lg font-bold text-primary mt-1">{droneAngle}°</div>
                </div>
                
                {/* Height indicator */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Height</div>
                  <div className="h-16 bg-muted rounded-lg relative overflow-hidden">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-400 to-emerald-300"
                      style={{ height: '67%' }}
                    />
                  </div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">{climberHeight}m</div>
                </div>
                
                {/* Rope length indicator */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Rope</div>
                  <div className="h-16 bg-muted rounded-lg relative overflow-hidden">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-400 to-amber-300"
                      animate={{ height: `${Math.min((ropeLength / 100) * 100, 100)}%` }}
                      transition={{ type: 'spring', damping: 20 }}
                    />
                  </div>
                  <div className="text-lg font-bold text-amber-600 mt-1">{ropeLength.toFixed(0)}m</div>
                </div>
              </div>

              {/* Angle slider */}
              <div className="mb-4">
                <div className="relative h-3 bg-muted rounded-full">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full transition-all"
                    style={{ width: `${((droneAngle - 20) / 60) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={droneAngle}
                    onChange={(e) => handleAngleChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-500 border-4 border-background rounded-full shadow-lg transition-all"
                    style={{ left: `calc(${((droneAngle - 20) / 60) * 100}% - 12px)` }}
                  />
                </div>
              </div>

              <Button
                onClick={handleLaunchRope}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                size="lg"
              >
                Launch Rescue Rope
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
            message="Nice thinking!"
            onComplete={handleSuccessComplete}
          />
        )}
      </AnimatePresence>

      {/* Step-wise Helper */}
      <AnimatePresence>
        {phase === 'helper' && (
          <RescueStepHelper
            currentAngle={droneAngle}
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
            gameTitle="Mountain Rescue Mission"
            gameConcept="Sine & Right Triangles"
            fallbackQuestions={mountainRescueQuestions}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
