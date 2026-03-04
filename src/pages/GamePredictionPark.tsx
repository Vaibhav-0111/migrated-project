import { useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, RotateCcw, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { PredictionParkScene } from '@/components/games/PredictionParkScene';
import { PredictionParkStepHelper } from '@/components/games/PredictionParkStepHelper';
import { GameFeedback } from '@/components/games/GameFeedback';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { predictionParkQuiz } from '@/data/gameQuizzes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function GamePredictionPark() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  
  const [gamePhase, setGamePhase] = useState<'tutorial' | 'animation' | 'play' | 'quiz' | 'complete'>('tutorial');
  const [showHelper, setShowHelper] = useState(false);
  const [helperStep, setHelperStep] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'encouragement'; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, number>>({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
  const [rollCount, setRollCount] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [roundPhase, setRoundPhase] = useState<'roll' | 'predict' | 'result'>('roll');
  const REQUIRED_ROUNDS = 3;
  const ROLLS_PER_ROUND = 10;

  const handleTutorialComplete = useCallback(() => {
    setGamePhase('animation');
    play('whoosh');
  }, [play]);

  const handleAnimationComplete = useCallback(() => {
    setGamePhase('play');
    setResults({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
    setRollCount(0);
    setRoundPhase('roll');
    play('correct');
  }, [play]);

  const handleRollDice = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setDiceResult(null);
    play('whoosh');
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult(result);
      setResults(prev => ({ ...prev, [result.toString()]: prev[result.toString()] + 1 }));
      setRollCount(prev => {
        const newCount = prev + 1;
        if (newCount >= ROLLS_PER_ROUND) {
          setTimeout(() => setRoundPhase('predict'), 500);
        }
        return newCount;
      });
      setRolling(false);
      play('click');
    }, 800);
  }, [rolling, play]);

  const handlePredict = useCallback((num: number) => {
    setPrediction(num);
  }, []);

  const handleSubmitPrediction = useCallback(() => {
    if (prediction === null) return;
    
    // Find the most frequent number
    const maxCount = Math.max(...Object.values(results));
    const mostFrequent = Object.entries(results)
      .filter(([, count]) => count === maxCount)
      .map(([num]) => parseInt(num));
    
    setRoundPhase('result');
    
    if (mostFrequent.includes(prediction)) {
      setScore(prev => prev + 1);
      setRoundsCompleted(prev => {
        const newRounds = prev + 1;
        setFeedback({ 
          type: 'success', 
          message: `Correct! ${prediction} appeared ${results[prediction.toString()]} times — the most frequent!` 
        });
        play('correct');
        
        setTimeout(() => {
          setFeedback(null);
          if (newRounds >= REQUIRED_ROUNDS) {
            setGamePhase('quiz');
          } else {
            // Reset for next round
            setResults({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
            setRollCount(0);
            setDiceResult(null);
            setPrediction(null);
            setRoundPhase('roll');
          }
        }, 2000);
        
        return newRounds;
      });
    } else {
      setFeedback({ 
        type: 'encouragement', 
        message: `Not quite! ${mostFrequent[0]} appeared most (${maxCount} times). Look at the tallest bar!` 
      });
      play('incorrect');
      setShowHelper(true);
      
      setTimeout(() => {
        setFeedback(null);
        setResults({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
        setRollCount(0);
        setDiceResult(null);
        setPrediction(null);
        setRoundPhase('roll');
      }, 3000);
    }
  }, [prediction, results, play]);

  const handleHelperComplete = useCallback(() => {
    setShowHelper(false);
    setHelperStep(0);
  }, []);

  const handleQuizComplete = useCallback((quizScore: number, total: number) => {
    const existingScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    existingScores['prediction-park'] = { score: quizScore, total };
    localStorage.setItem('quizScores', JSON.stringify(existingScores));
    
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('prediction-park')) {
      completedGames.push('prediction-park');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    
    setGamePhase('complete');
    play('celebration');
  }, [play]);

  const handleReset = useCallback(() => {
    setGamePhase('tutorial');
    setScore(0);
    setRoundsCompleted(0);
    setResults({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
    setRollCount(0);
    setDiceResult(null);
    setPrediction(null);
    setRolling(false);
    setRoundPhase('roll');
    setShowHelper(false);
    setFeedback(null);
  }, []);

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
            <EnhancedButton variant="ghost" size="icon" onClick={() => navigate('/probability')}>
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-lg font-bold text-foreground">Prediction Park</h1>
              <p className="text-xs text-muted-foreground">
                Round {roundsCompleted + 1}/{REQUIRED_ROUNDS} • Roll dice & predict patterns
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {gamePhase === 'play' && (
              <Badge variant="outline" className="text-xs">
                Score: {score}
              </Badge>
            )}
            <EnhancedButton variant="ghost" size="icon" onClick={() => setShowHelper(true)}>
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
          <Canvas camera={{ position: [0, 6, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <PredictionParkScene 
              phase={gamePhase}
              onAnimationComplete={handleAnimationComplete}
              onCorrect={() => {}}
              onIncorrect={() => {}}
              diceResult={diceResult}
              results={results}
            />
            <OrbitControls 
              enablePan={false} 
              enableZoom={false}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 4}
            />
            <Environment preset="park" />
          </Canvas>
        </Suspense>
      </div>

      {/* Tutorial */}
      <AnimatePresence>
        {gamePhase === 'tutorial' && (
          <GameTutorial
            title="Prediction Park"
            topic="Experimental Probability"
            explanation="Welcome to Prediction Park! You'll roll a dice many times and watch which numbers come up most often. After rolling, predict which number appeared the most. This is experimental probability — the more you experiment, the clearer the patterns become!"
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Game Controls — Roll Phase */}
      <AnimatePresence>
        {gamePhase === 'play' && roundPhase === 'roll' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4"
          >
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Rolls</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-primary">{rollCount}</span>
                  <span className="text-muted-foreground">/ {ROLLS_PER_ROUND}</span>
                </div>
                {diceResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2"
                  >
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      Last roll: {diceResult}
                    </Badge>
                  </motion.div>
                )}
              </div>

              {/* Roll progress bar */}
              <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${(rollCount / ROLLS_PER_ROUND) * 100}%` }}
                />
              </div>

              <Button
                onClick={handleRollDice}
                disabled={rolling || rollCount >= ROLLS_PER_ROUND}
                className="w-full gap-2"
                size="lg"
              >
                {rolling ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    🎲
                  </motion.span>
                ) : '🎲'} 
                {rolling ? 'Rolling...' : rollCount >= ROLLS_PER_ROUND ? 'All rolled!' : 'Roll Dice'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Controls — Predict Phase */}
      <AnimatePresence>
        {gamePhase === 'play' && roundPhase === 'predict' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4"
          >
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
              <h3 className="text-center font-semibold text-foreground mb-2">
                Which number appeared MOST often?
              </h3>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Look at the tallest bar in the 3D chart above!
              </p>

              {/* Dice number buttons */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const DiceIcon = DiceIcons[num - 1];
                  return (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePredict(num)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        prediction === num
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <DiceIcon className="w-6 h-6" />
                      <span className="text-xs text-muted-foreground">
                        ({results[num.toString()]})
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <Button
                onClick={handleSubmitPrediction}
                disabled={prediction === null}
                className="w-full"
                size="lg"
              >
                Submit Prediction
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Helper */}
      <AnimatePresence>
        {showHelper && (
          <PredictionParkStepHelper
            step={helperStep}
            onNextStep={() => setHelperStep(prev => prev + 1)}
            onComplete={handleHelperComplete}
          />
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <GameFeedback type={feedback.type} message={feedback.message} onComplete={() => setFeedback(null)} />
        )}
      </AnimatePresence>

      {/* Quiz */}
      <AnimatePresence>
        {gamePhase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Probability"
            gameTitle="Prediction Park"
            gameConcept="Predicting Outcomes & Probability"
            fallbackQuestions={predictionParkQuiz}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {gamePhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 rounded-3xl bg-card shadow-2xl max-w-md mx-4"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                🎲🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Pattern Master!</h2>
              <p className="text-muted-foreground mb-4">
                You predicted {score}/{REQUIRED_ROUNDS} patterns correctly!
              </p>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2 text-foreground">What you learned:</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• More experiments reveal clearer patterns</li>
                  <li>• Frequency helps predict future outcomes</li>
                  <li>• This is experimental probability!</li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center">
                <EnhancedButton onClick={handleReset} variant="outline">
                  Play Again
                </EnhancedButton>
                <EnhancedButton onClick={() => navigate('/probability')}>
                  Back to Chapter
                </EnhancedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
