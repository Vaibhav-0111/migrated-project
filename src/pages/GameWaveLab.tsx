import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { WaveLabScene } from '@/components/games/WaveLabScene';
import { GameFeedback } from '@/components/games/GameFeedback';
import { WaveStepHelper } from '@/components/games/WaveStepHelper';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { waveLabQuestions } from '@/data/gameQuizzes';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'success' | 'helper' | 'quiz';

// Tutorial content for this game
const tutorialContent = {
  title: "Wave Balance Lab",
  topic: "Pythagorean Identity",
  explanation: "Welcome to the Wave Balance Lab! Here you will discover one of the most beautiful truths in trigonometry: sine squared plus cosine squared always equals one. This is called the Pythagorean Identity. Imagine two waves of energy - one powered by sine, one by cosine. As you change the angle, the energy shifts between them, but together they always add up to 100%. Your challenge is to find the special angle where both waves have exactly equal energy. When you find it, the system will be perfectly balanced!"
};

export default function GameWaveLab() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [theta, setTheta] = useState(45);
  const [challengeTheta, setChallengeTheta] = useState(30);
  const [attempts, setAttempts] = useState(0);

  // Calculate sin² and cos² values
  const sinSquared = Math.pow(Math.sin(theta * Math.PI / 180), 2);
  const cosSquared = Math.pow(Math.cos(theta * Math.PI / 180), 2);
  const total = sinSquared + cosSquared; // Should always equal 1

  // Challenge: find the angle where sin²θ = cos²θ (answer: 45°)
  const targetTheta = 45;
  const tolerance = 3;

  const handleTutorialComplete = useCallback(() => {
    setPhase('animation');
  }, []);

  const handleAnimationComplete = useCallback(() => {
    // Set a random challenge
    const challenges = [30, 60, 20, 70];
    setChallengeTheta(challenges[Math.floor(Math.random() * challenges.length)]);
    setTheta(challengeTheta);
    setPhase('interaction');
  }, [challengeTheta]);

  const handleThetaChange = useCallback((newTheta: number) => {
    setTheta(newTheta);
  }, []);

  const handleCheckBalance = useCallback(() => {
    setAttempts(prev => prev + 1);
    
    // Check if sin² ≈ cos² (which happens at 45°)
    if (Math.abs(theta - targetTheta) <= tolerance) {
      setPhase('success');
    } else {
      setPhase('helper');
    }
  }, [theta]);

  const handleHelperComplete = useCallback(() => {
    setPhase('interaction');
  }, []);

  const handleSuccessComplete = useCallback(() => {
    setPhase('quiz');
  }, []);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    const completed = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completed.includes('wave-balance-lab')) {
      completed.push('wave-balance-lab');
      localStorage.setItem('completedGames', JSON.stringify(completed));
    }
    // Store quiz score
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores['wave-balance-lab'] = { score, total, date: new Date().toISOString() };
    localStorage.setItem('quizScores', JSON.stringify(scores));
    navigate('/chapters');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-indigo-50 to-purple-100 overflow-hidden">
      {/* Header */}
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
                Watch the energy waves...
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
                Balance the energy waves equally
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3D Scene - show after tutorial */}
      {phase !== 'tutorial' && (
        <div className="w-full h-screen">
          <WaveLabScene
            phase={phase === 'quiz' ? 'success' : phase as 'animation' | 'interaction' | 'success' | 'helper'}
            theta={theta}
            onThetaChange={handleThetaChange}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}

      {/* Control Panel */}
      <AnimatePresence>
        {phase === 'interaction' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-8"
          >
            <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              {/* Energy balance visualization */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-violet-600">Sin Energy</span>
                  <span className="text-sm font-medium text-indigo-600">Cos Energy</span>
                </div>
                
                {/* Balance bar */}
                <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                  {/* Sin² portion (left, violet) */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-violet-400 to-violet-300"
                    animate={{ width: `${sinSquared * 100}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                  {/* Cos² portion (right, indigo) */}
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-indigo-400 to-indigo-300"
                    animate={{ width: `${cosSquared * 100}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                  {/* Center line indicator */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-foreground/30 -translate-x-1/2" />
                  
                  {/* Balance indicator */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2"
                    animate={{ 
                      left: `${sinSquared * 100}%`,
                      borderColor: Math.abs(sinSquared - 0.5) < 0.05 ? '#22c55e' : '#f59e0b'
                    }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{ marginLeft: '-8px' }}
                  />
                </div>
                
                {/* Values */}
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>sin²θ = {(sinSquared * 100).toFixed(0)}%</span>
                  <span className="font-medium text-foreground">Total = {(total * 100).toFixed(0)}%</span>
                  <span>cos²θ = {(cosSquared * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Theta slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Angle (θ)</span>
                  <span className="text-lg font-bold text-primary">{theta}°</span>
                </div>
                
                <div className="relative h-3 bg-muted rounded-full">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 rounded-full transition-all"
                    style={{ width: `${((theta - 5) / 80) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="5"
                    max="85"
                    value={theta}
                    onChange={(e) => handleThetaChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-purple-500 border-4 border-background rounded-full shadow-lg transition-all"
                    style={{ left: `calc(${((theta - 5) / 80) * 100}% - 12px)` }}
                  />
                </div>
              </div>

              {/* Hint text */}
              <p className="text-xs text-center text-muted-foreground mb-4">
                Find the angle where both energies are equal
              </p>

              <Button
                onClick={handleCheckBalance}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white"
                size="lg"
              >
                Check Balance
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
            message="You got it!"
            onComplete={handleSuccessComplete}
          />
        )}
      </AnimatePresence>

      {/* Step-wise Helper */}
      <AnimatePresence>
        {phase === 'helper' && (
          <WaveStepHelper
            currentTheta={theta}
            targetTheta={targetTheta}
            sinSquared={sinSquared}
            cosSquared={cosSquared}
            onComplete={handleHelperComplete}
          />
        )}
      </AnimatePresence>

      {/* Quiz Phase */}
      <AnimatePresence>
        {phase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Trigonometry"
            gameTitle="Wave Balance Lab"
            gameConcept="Pythagorean Identity & Wave Functions"
            fallbackQuestions={waveLabQuestions}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
