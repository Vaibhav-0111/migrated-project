import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Trophy, BookOpen, GraduationCap, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MathText } from '@/components/MathText';
import type { QuizQuestion } from '@/data/gameQuizzes';

interface MultiQuestionQuizProps {
  questions: QuizQuestion[];
  gameTitle: string;
  grade?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, total: number) => void;
}

export function MultiQuestionQuiz({ questions, gameTitle, grade, difficulty, onComplete }: MultiQuestionQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedIndex === currentQuestion.correctIndex;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = useCallback((index: number) => {
    if (showResult) return;
    setSelectedIndex(index);
  }, [showResult]);

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null) return;
    setShowResult(true);
    
    if (selectedIndex === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  }, [selectedIndex, currentQuestion.correctIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedIndex(null);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      setShowFinalResult(true);
    }
  }, [currentIndex, questions.length]);

  const handleFinish = useCallback(() => {
    onComplete(score, questions.length);
  }, [score, questions.length, onComplete]);

  // Final results screen
  if (showFinalResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const grade = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!';
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-md mx-4 w-full p-8 bg-card rounded-3xl shadow-2xl border border-border/50 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-primary" />
          </motion.div>

          <h2 className="text-2xl font-bold text-foreground mb-2">{grade}</h2>
          <p className="text-muted-foreground mb-6">Quiz Complete: {gameTitle}</p>

          <div className="bg-muted rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-sm text-muted-foreground">Questions Correct</p>
            
            <div className="mt-4 h-3 bg-background rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className={`h-full rounded-full ${
                  percentage >= 80 ? 'bg-emerald-500' : 
                  percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{percentage}% Score</p>
          </div>

          <Button onClick={handleFinish} size="lg" className="w-full gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-xl w-full bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 text-primary" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-foreground">{gameTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {grade && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <GraduationCap className="w-3 h-3" />
                  Grade {grade}
                </Badge>
              )}
              {difficulty && (
                <Badge 
                  variant="secondary" 
                  className={`gap-1 text-xs ${
                    difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                    difficulty === 'medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                    'bg-red-500/15 text-red-600 dark:text-red-400'
                  }`}
                >
                  <Signal className="w-3 h-3" />
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
              )}
              <p className="text-sm font-medium text-primary">{score} correct</p>
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-medium text-foreground mb-6"
          >
            <MathText text={currentQuestion.question} />
          </motion.div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrectOption = index === currentQuestion.correctIndex;
              
              let bgClass = 'bg-muted hover:bg-muted/80';
              let borderClass = 'border-transparent';
              
              if (showResult) {
                if (isCorrectOption) {
                  bgClass = 'bg-emerald-500/20';
                  borderClass = 'border-emerald-500';
                } else if (isSelected && !isCorrectOption) {
                  bgClass = 'bg-red-500/20';
                  borderClass = 'border-red-500';
                }
              } else if (isSelected) {
                bgClass = 'bg-primary/20';
                borderClass = 'border-primary';
              }

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgClass} ${borderClass} ${
                    !showResult ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-medium shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-foreground"><MathText text={option} /></span>
                    
                    {showResult && isCorrectOption && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      </motion.div>
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation with Formula */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className={`p-4 rounded-xl border ${
                  isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCorrect ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium mb-1 ${
                        isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {isCorrect ? 'Correct!' : 'Not quite!'}
                      </p>
                      <div className="text-sm text-muted-foreground mb-2">
                        <MathText text={currentQuestion.explanation} />
                      </div>
                      {currentQuestion.formula && (
                        <div className="mt-2 p-2 bg-background/50 rounded-lg border border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Formula:</p>
                          <div className="font-mono text-sm text-primary font-medium">
                            <MathText text={currentQuestion.formula} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end">
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedIndex === null}
                size="lg"
              >
                Check Answer
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button onClick={handleNext} size="lg" className="gap-2">
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
