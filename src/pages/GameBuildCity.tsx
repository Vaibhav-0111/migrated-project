import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { GameTutorial } from '@/components/games/GameTutorial';
import { BuildCityScene } from '@/components/games/BuildCityScene';
import { BuildCityStepHelper } from '@/components/games/BuildCityStepHelper';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { buildCityQuestions } from '@/data/gameQuizzes';
import { useSoundEffects } from '@/hooks/useSoundEffects';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'stepHelp' | 'success' | 'quiz' | 'complete';
interface BuildingDimensions { width: number; height: number; depth: number; }
interface CityGoal { type: 'storage' | 'material' | 'balanced'; description: string; }

const cityGoals: CityGoal[] = [
  { type: 'storage', description: 'Build a warehouse: Maximum storage (volume ≥ 64)' },
  { type: 'material', description: 'Build efficiently: Good storage, minimum materials' },
  { type: 'balanced', description: 'Build smart: Balance storage and materials perfectly' }
];

export default function GameBuildCity() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [dimensions, setDimensions] = useState<BuildingDimensions>({ width: 2, height: 2, depth: 2 });
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [goalsCompleted, setGoalsCompleted] = useState(0);
  const { play } = useSoundEffects();

  const currentGoal = cityGoals[currentGoalIndex];
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  const surfaceArea = 2 * (dimensions.width * dimensions.height + dimensions.height * dimensions.depth + dimensions.width * dimensions.depth);

  useEffect(() => { if (phase === 'animation') { const timer = setTimeout(() => setPhase('interaction'), 4000); return () => clearTimeout(timer); } }, [phase]);

  const handleTutorialComplete = () => { setPhase('animation'); play('whoosh'); };

  const evaluateBuilding = (): boolean => {
    const ratio = volume / surfaceArea;
    switch (currentGoal.type) {
      case 'storage': return volume >= 64;
      case 'material': return ratio >= 0.4 && volume >= 24;
      case 'balanced': return ratio >= 0.35 && ratio <= 0.5 && volume >= 32;
      default: return false;
    }
  };

  const handleBuildComplete = () => {
    if (evaluateBuilding()) {
      play('correct');
      setGoalsCompleted(prev => prev + 1);
      if (goalsCompleted >= 2) { setPhase('quiz'); } 
      else {
        setPhase('success');
        setTimeout(() => { setCurrentGoalIndex(prev => (prev + 1) % cityGoals.length); setDimensions({ width: 2, height: 2, depth: 2 }); setPhase('animation'); }, 2000);
      }
    } else { play('incorrect'); setPhase('stepHelp'); }
  };

  const handleQuizComplete = (score: number, total: number) => {
    const existingScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    existingScores['build-balance-city'] = { score, total };
    localStorage.setItem('quizScores', JSON.stringify(existingScores));
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('build-balance-city')) { completedGames.push('build-balance-city'); localStorage.setItem('completedGames', JSON.stringify(completedGames)); }
    setPhase('complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-900">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/volume')} className="bg-background/50 backdrop-blur-sm"><ArrowLeft className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" onClick={() => { setPhase('tutorial'); setDimensions({ width: 2, height: 2, depth: 2 }); setCurrentGoalIndex(0); setGoalsCompleted(0); }} className="bg-background/50 backdrop-blur-sm"><RotateCcw className="w-5 h-5" /></Button>
      </div>

      {phase === 'interaction' && (
        <div className="absolute top-20 left-4 right-4 z-20">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto text-center">
            <p className="text-sm font-medium text-primary">{currentGoal.description}</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {phase === 'tutorial' && <GameTutorial title="Build & Balance City" topic="Volume vs Surface Area" explanation="Design buildings that meet the city's needs! Volume is storage space inside. Surface area is the material needed for walls. Stretch buildings taller or wider to find the perfect balance!" onComplete={handleTutorialComplete} />}
      </AnimatePresence>

      {phase !== 'tutorial' && phase !== 'quiz' && phase !== 'complete' && <BuildCityScene phase={phase} dimensions={dimensions} goalType={currentGoal.type} onDimensionChange={setDimensions} onBuildComplete={handleBuildComplete} />}

      <AnimatePresence>{phase === 'stepHelp' && <BuildCityStepHelper dimensions={dimensions} goalType={currentGoal.type} volume={volume} surfaceArea={surfaceArea} onComplete={() => setPhase('interaction')} />}</AnimatePresence>

      <AnimatePresence>
        {phase === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-background/90 backdrop-blur-md rounded-3xl p-8 text-center"><div className="text-6xl mb-4">🏙️</div><h2 className="text-2xl font-bold mb-2">Smart Design!</h2></div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'quiz' && <AIMultiQuestionQuiz chapter="Volume & Surface Area" gameTitle="Build & Balance City" gameConcept="Volume Calculation & Optimization" fallbackQuestions={buildCityQuestions} onComplete={handleQuizComplete} />}

      {phase === 'complete' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center z-30 bg-background/80 backdrop-blur-md">
          <div className="text-center p-8"><div className="text-8xl mb-6">🏆</div><h2 className="text-3xl font-bold mb-4">Chapter Complete!</h2><Button onClick={() => navigate('/volume')} size="lg">Back to Chapter</Button></div>
        </motion.div>
      )}
    </div>
  );
}
