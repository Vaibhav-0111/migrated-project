import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { GameTutorial } from '@/components/games/GameTutorial';
import { WrapGiftScene } from '@/components/games/WrapGiftScene';
import { WrapGiftStepHelper } from '@/components/games/WrapGiftStepHelper';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { wrapGiftQuestions } from '@/data/gameQuizzes';
import { useSoundEffects } from '@/hooks/useSoundEffects';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'stepHelp' | 'success' | 'quiz' | 'complete';

export default function GameWrapGift() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [coveredFaces, setCoveredFaces] = useState<number[]>([]);
  const [currentShape, setCurrentShape] = useState<'cube' | 'rectangular' | 'triangular'>('cube');
  const [shapesCompleted, setShapesCompleted] = useState(0);
  const { play } = useSoundEffects();
  const totalFaces = currentShape === 'triangular' ? 5 : 6;

  useEffect(() => {
    if (phase === 'animation') {
      const timer = setTimeout(() => setPhase('interaction'), 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleTutorialComplete = () => { setPhase('animation'); play('whoosh'); };
  const handleFaceCovered = (faceIndex: number) => { if (!coveredFaces.includes(faceIndex)) { setCoveredFaces(prev => [...prev, faceIndex]); play('click'); } };

  const handleWrapComplete = () => {
    if (coveredFaces.length === totalFaces) {
      play('correct');
      setShapesCompleted(prev => prev + 1);
      if (shapesCompleted >= 2) { setPhase('quiz'); } 
      else {
        setPhase('success');
        setTimeout(() => {
          const shapes: ('cube' | 'rectangular' | 'triangular')[] = ['cube', 'rectangular', 'triangular'];
          setCurrentShape(shapes[(shapes.indexOf(currentShape) + 1) % 3]);
          setCoveredFaces([]);
          setPhase('animation');
        }, 2000);
      }
    } else { play('incorrect'); setPhase('stepHelp'); }
  };

  const handleQuizComplete = (score: number, total: number) => {
    const existingScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    existingScores['wrap-gift-studio'] = { score, total };
    localStorage.setItem('quizScores', JSON.stringify(existingScores));
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('wrap-gift-studio')) { completedGames.push('wrap-gift-studio'); localStorage.setItem('completedGames', JSON.stringify(completedGames)); }
    setPhase('complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-red-50 dark:from-pink-950 dark:via-rose-950 dark:to-red-900">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/volume')} className="bg-background/50 backdrop-blur-sm"><ArrowLeft className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" onClick={() => { setPhase('tutorial'); setCoveredFaces([]); setCurrentShape('cube'); setShapesCompleted(0); }} className="bg-background/50 backdrop-blur-sm"><RotateCcw className="w-5 h-5" /></Button>
      </div>

      <AnimatePresence>
        {phase === 'tutorial' && <GameTutorial title="Wrap the Gift Studio" topic="Surface Area" explanation="Surface area is the total area covering the outside of a 3D shape. Watch how wrapping paper unfolds into a flat net, then wraps around the shape. Cover all faces to complete the wrapping!" onComplete={handleTutorialComplete} />}
      </AnimatePresence>

      {phase !== 'tutorial' && phase !== 'quiz' && phase !== 'complete' && <WrapGiftScene phase={phase} currentShape={currentShape} coveredFaces={coveredFaces} onFaceCovered={handleFaceCovered} onWrapComplete={handleWrapComplete} />}

      <AnimatePresence>{phase === 'stepHelp' && <WrapGiftStepHelper coveredFaces={coveredFaces} totalFaces={totalFaces} shapeName={currentShape} onComplete={() => setPhase('interaction')} />}</AnimatePresence>

      <AnimatePresence>
        {phase === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-background/90 backdrop-blur-md rounded-3xl p-8 text-center"><div className="text-6xl mb-4">🎁</div><h2 className="text-2xl font-bold mb-2">Beautiful Wrap!</h2></div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'quiz' && <AIMultiQuestionQuiz chapter="Volume & Surface Area" gameTitle="Wrap the Gift Studio" gameConcept="Surface Area" fallbackQuestions={wrapGiftQuestions} onComplete={handleQuizComplete} />}

      {phase === 'complete' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center z-30 bg-background/80 backdrop-blur-md">
          <div className="text-center p-8"><div className="text-8xl mb-6">🏆</div><h2 className="text-3xl font-bold mb-4">Game Complete!</h2><Button onClick={() => navigate('/volume')} size="lg">Continue</Button></div>
        </motion.div>
      )}
    </div>
  );
}
