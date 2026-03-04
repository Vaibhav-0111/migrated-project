import { useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { MoneyGardenScene } from '@/components/games/MoneyGardenScene';
import { MoneyGardenStepHelper } from '@/components/games/MoneyGardenStepHelper';
import { GameFeedback } from '@/components/games/GameFeedback';
import { GameTutorial } from '@/components/games/GameTutorial';
import { AIMultiQuestionQuiz } from '@/components/games/AIMultiQuestionQuiz';
import { moneyGardenQuiz } from '@/data/gameQuizzes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type GamePhase = 'tutorial' | 'animation' | 'play' | 'quiz' | 'complete';

interface Challenge {
  principal: number;
  rate: number;
  years: number;
  question: string;
  options: { label: string; value: number }[];
  correctIndex: number;
  showCompound: boolean;
}

const challenges: Challenge[] = [
  {
    principal: 1000,
    rate: 10,
    years: 2,
    question: "₹1000 at 10% for 2 years. What is the Simple Interest?",
    options: [
      { label: "₹150", value: 150 },
      { label: "₹200", value: 200 },
      { label: "₹250", value: 250 },
      { label: "₹100", value: 100 },
    ],
    correctIndex: 1,
    showCompound: false,
  },
  {
    principal: 1000,
    rate: 10,
    years: 2,
    question: "Same ₹1000 at 10% for 2 years. What is Compound Interest?",
    options: [
      { label: "₹200", value: 200 },
      { label: "₹210", value: 210 },
      { label: "₹220", value: 220 },
      { label: "₹250", value: 250 },
    ],
    correctIndex: 1,
    showCompound: true,
  },
  {
    principal: 5000,
    rate: 8,
    years: 3,
    question: "₹5000 at 8% for 3 years. How much MORE does CI give compared to SI?",
    options: [
      { label: "₹38.72", value: 38.72 },
      { label: "₹98.56", value: 98.56 },
      { label: "₹150", value: 150 },
      { label: "₹200", value: 200 },
    ],
    correctIndex: 1,
    showCompound: true,
  },
];

export default function GameMoneyGarden() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  
  const [gamePhase, setGamePhase] = useState<GamePhase>('tutorial');
  const [currentRound, setCurrentRound] = useState(0);
  const [showHelper, setShowHelper] = useState(false);
  const [helperStep, setHelperStep] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'encouragement'; message: string } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const challenge = challenges[currentRound];

  const handleTutorialComplete = useCallback(() => {
    setGamePhase('animation');
    play('whoosh');
  }, [play]);

  const handleAnimationComplete = useCallback(() => {
    setGamePhase('play');
  }, []);

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const isCorrect = index === challenge.correctIndex;

    setTimeout(() => {
      if (isCorrect) {
        play('correct');
        setFeedback({ type: 'success', message: 'Correct! You understand interest!' });
        
        setTimeout(() => {
          setFeedback(null);
          setSelectedAnswer(null);
          if (currentRound + 1 >= challenges.length) {
            setGamePhase('quiz');
          } else {
            setCurrentRound(prev => prev + 1);
            setGamePhase('animation');
          }
        }, 1500);
      } else {
        play('incorrect');
        setFeedback({ type: 'encouragement', message: 'Look at the trees — the difference shows the answer!' });
        setShowHelper(true);
        setHelperStep(0);
        setTimeout(() => {
          setFeedback(null);
          setSelectedAnswer(null);
        }, 2000);
      }
    }, 500);
  }, [selectedAnswer, challenge, currentRound, play]);

  const handleHelperComplete = useCallback(() => {
    setShowHelper(false);
    setHelperStep(0);
  }, []);

  const handleQuizComplete = useCallback((quizScore: number, total: number) => {
    const existingScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    existingScores['money-garden'] = { score: quizScore, total };
    localStorage.setItem('quizScores', JSON.stringify(existingScores));
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('money-garden')) {
      completedGames.push('money-garden');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    setGamePhase('complete');
    play('celebration');
  }, [play]);

  const handleReset = useCallback(() => {
    setGamePhase('tutorial');
    setCurrentRound(0);
    setShowHelper(false);
    setFeedback(null);
    setSelectedAnswer(null);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-emerald-50 to-green-100 dark:from-emerald-950/20 dark:to-green-950/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <EnhancedButton variant="ghost" size="icon" onClick={() => navigate('/fractions')}>
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-lg font-bold text-foreground">Growing Money Garden</h1>
              <p className="text-xs text-muted-foreground">
                Round {currentRound + 1}/{challenges.length} • Simple vs Compound Interest
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EnhancedButton variant="ghost" size="icon" onClick={() => { setShowHelper(true); setHelperStep(0); }}>
              <HelpCircle className="h-5 w-5" />
            </EnhancedButton>
            <EnhancedButton variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-5 w-5" />
            </EnhancedButton>
          </div>
        </div>
      </motion.header>

      {/* 3D Scene */}
      {gamePhase !== 'tutorial' && gamePhase !== 'quiz' && gamePhase !== 'complete' && (
        <div className="absolute inset-0 pt-16">
          <Suspense fallback={<LoadingSpinner />}>
            <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 10, 5]} intensity={0.8} />
              <MoneyGardenScene
                phase={gamePhase}
                principal={challenge.principal}
                rate={challenge.rate}
                years={challenge.years}
                showCompound={challenge.showCompound}
                onAnimationComplete={handleAnimationComplete}
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
      )}

      {/* Tutorial */}
      <AnimatePresence>
        {gamePhase === 'tutorial' && (
          <GameTutorial
            title="Growing Money Garden"
            topic="Simple & Compound Interest"
            explanation="Welcome to the Money Garden! Here you'll see how money grows over time. Simple Interest grows the SAME amount each year — like adding the same water every day. Compound Interest grows on top of previous growth — like a snowball getting bigger! Watch the trees grow and answer the questions to master interest calculations."
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Interactive challenge panel */}
      <AnimatePresence>
        {gamePhase === 'play' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4"
          >
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-border">
              {/* Formula reference */}
              <div className="flex gap-2 mb-3 text-xs">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                  SI = P × R × T / 100
                </span>
                {challenge.showCompound && (
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                    CI = P(1 + R/100)ᵀ − P
                  </span>
                )}
              </div>

              {/* Question */}
              <p className="text-sm font-semibold text-foreground mb-4">
                {challenge.question}
              </p>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {challenge.options.map((opt, i) => (
                  <Button
                    key={i}
                    variant={selectedAnswer === i 
                      ? (i === challenge.correctIndex ? "default" : "destructive")
                      : "outline"
                    }
                    className={`h-12 text-base font-bold ${
                      selectedAnswer !== null && i === challenge.correctIndex
                        ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/30'
                        : ''
                    }`}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Helper */}
      <AnimatePresence>
        {showHelper && (
          <MoneyGardenStepHelper
            step={helperStep}
            onNext={() => setHelperStep(prev => prev + 1)}
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
            onComplete={() => setFeedback(null)}
          />
        )}
      </AnimatePresence>

      {/* Quiz */}
      <AnimatePresence>
        {gamePhase === 'quiz' && (
          <AIMultiQuestionQuiz
            chapter="Fractions/Decimals/Percentages/Interest"
            gameTitle="Growing Money Garden"
            gameConcept="Simple & Compound Interest Calculations"
            fallbackQuestions={moneyGardenQuiz}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {gamePhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center max-w-md px-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-6xl mb-4">
                💰🌳
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Financial Expert!</h2>
              <p className="text-muted-foreground mb-4">You understand how Simple and Compound Interest work!</p>
              <div className="bg-card rounded-lg p-4 mb-6 border text-left">
                <h3 className="font-semibold mb-2">Key takeaways:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• SI grows linearly: same amount each year</li>
                  <li>• CI grows exponentially: interest earns interest</li>
                  <li>• CI always gives more than SI for t &gt; 1 year</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <EnhancedButton onClick={handleReset}>Play Again</EnhancedButton>
                <EnhancedButton variant="outline" onClick={() => navigate('/fractions')}>Back to Chapter</EnhancedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
