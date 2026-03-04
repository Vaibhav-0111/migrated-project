import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { GameTutorial } from '@/components/games/GameTutorial';
import { ShapeFillScene } from '@/components/games/ShapeFillScene';
import { ShapeFillStepHelper } from '@/components/games/ShapeFillStepHelper';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { shapeFillQuestions } from '@/data/gameQuizzes';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAppStore } from '@/store/useAppStore';

type GamePhase = 'tutorial' | 'animation' | 'interaction' | 'stepHelp' | 'success' | 'quiz' | 'complete';

const SHAPES: ('cube' | 'cylinder' | 'sphere')[] = ['cube', 'cylinder', 'sphere'];
const REQUIRED_SHAPES = 3;

export default function GameShapeFill() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [fillLevel, setFillLevel] = useState(0);
  const [targetLevel] = useState(0.7);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [shapesCompleted, setShapesCompleted] = useState(0);
  const { play } = useSoundEffects();
  const { settings, updateSettings } = useAppStore();

  const currentShape = SHAPES[currentShapeIndex];

  useEffect(() => {
    if (phase === 'animation') {
      const timer = setTimeout(() => setPhase('interaction'), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'success') {
      const timer = setTimeout(() => {
        if (shapesCompleted >= REQUIRED_SHAPES) {
          console.log('All shapes completed, moving to quiz');
          setPhase('quiz');
        } else {
          setCurrentShapeIndex(prev => (prev + 1) % SHAPES.length);
          setFillLevel(0);
          setPhase('animation');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, shapesCompleted]);

  const handleTutorialComplete = useCallback(() => {
    setPhase('animation');
    play('whoosh');
  }, [play]);

  const handleFillChange = useCallback((level: number) => {
    setFillLevel(level);
  }, []);

  const handleFillComplete = useCallback(() => {
    const accuracy = Math.abs(fillLevel - targetLevel);
    if (accuracy < 0.15) {
      play('correct');
      const newCompleted = shapesCompleted + 1;
      setShapesCompleted(newCompleted);
      console.log(`Shape completed! Total: ${newCompleted}/${REQUIRED_SHAPES}`);
      setPhase('success');
    } else {
      play('incorrect');
      setPhase('stepHelp');
    }
  }, [fillLevel, targetLevel, shapesCompleted, play]);

  const handleStepHelpComplete = useCallback(() => {
    setFillLevel(0);
    setPhase('interaction');
  }, []);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    console.log(`Quiz complete: ${score}/${total}`);
    const existingScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    existingScores['shape-fill-playground'] = { score, total };
    localStorage.setItem('quizScores', JSON.stringify(existingScores));
    
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('shape-fill-playground')) {
      completedGames.push('shape-fill-playground');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    setPhase('complete');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('tutorial');
    setFillLevel(0);
    setCurrentShapeIndex(0);
    setShapesCompleted(0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-sky-100 dark:from-cyan-950 dark:via-blue-950 dark:to-sky-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/volume')} className="bg-background/50 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          {phase !== 'tutorial' && phase !== 'quiz' && phase !== 'complete' && (
            <div className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-medium">
                Shapes: <span className="text-primary font-bold">{shapesCompleted}/{REQUIRED_SHAPES}</span>
              </span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={handleReset} className="bg-background/50 backdrop-blur-sm">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tutorial */}
      <AnimatePresence>
        {phase === 'tutorial' && (
          <GameTutorial 
            title="Shape Fill Playground" 
            topic="Understanding Volume" 
            explanation="Volume is the space inside a 3D shape. Watch how liquid fills each shape from bottom to top. Use the slider to pour liquid and fill the shape exactly to the glowing yellow line. Complete 3 shapes to unlock the quiz!" 
            onComplete={handleTutorialComplete} 
          />
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      {phase !== 'tutorial' && phase !== 'quiz' && phase !== 'complete' && (
        <ShapeFillScene 
          phase={phase} 
          currentShape={currentShape} 
          fillLevel={fillLevel} 
          targetLevel={targetLevel} 
          onFillChange={handleFillChange} 
          onFillComplete={handleFillComplete} 
        />
      )}

      {/* Step Helper */}
      <AnimatePresence>
        {phase === 'stepHelp' && (
          <ShapeFillStepHelper 
            currentFill={fillLevel} 
            targetFill={targetLevel} 
            shapeName={currentShape} 
            onComplete={handleStepHelpComplete} 
          />
        )}
      </AnimatePresence>

      {/* Success feedback */}
      <AnimatePresence>
        {phase === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <div className="bg-background/90 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                💧
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-primary">Perfect Pour!</h2>
              <p className="text-muted-foreground">
                {shapesCompleted >= REQUIRED_SHAPES 
                  ? "All shapes complete! Let's test your knowledge!"
                  : `${REQUIRED_SHAPES - shapesCompleted} more shape${REQUIRED_SHAPES - shapesCompleted > 1 ? 's' : ''} to go!`
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz */}
      {phase === 'quiz' && (
        <AIMultiQuestionQuiz 
          chapter="Volume & Surface Area"
          gameTitle="Shape Fill Playground"
          gameConcept="Understanding Volume"
          fallbackQuestions={shapeFillQuestions}
          onComplete={handleQuizComplete} 
        />
      )}

      {/* Complete */}
      {phase === 'complete' && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0 flex items-center justify-center z-30 bg-background/80 backdrop-blur-md"
        >
          <div className="text-center p-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-6"
            >
              🏆
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">Volume Master!</h2>
            <p className="text-muted-foreground mb-6">You understand how 3D shapes hold space!</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleReset} variant="outline" size="lg">Play Again</Button>
              <Button onClick={() => navigate('/volume')} size="lg">Continue</Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
