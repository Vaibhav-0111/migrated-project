import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GameQuizProps {
  question: QuizQuestion;
  onComplete: (correct: boolean) => void;
}

export function GameQuiz({ question, onComplete }: GameQuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selectedIndex === question.correctIndex;

  const handleSelect = useCallback((index: number) => {
    if (showResult) return;
    setSelectedIndex(index);
  }, [showResult]);

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null) return;
    setShowResult(true);
    
    // Show explanation after a short delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  }, [selectedIndex]);

  const handleContinue = useCallback(() => {
    onComplete(isCorrect);
  }, [isCorrect, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-xl mx-4 w-full p-6 md:p-8 bg-card rounded-3xl shadow-2xl border border-border/50"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Lightbulb className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">Quick Check</h3>
            <p className="text-sm text-muted-foreground">Test what you learned!</p>
          </div>
        </div>

        {/* Question */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-medium text-foreground mb-6"
        >
          {question.question}
        </motion.p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrectOption = index === question.correctIndex;
            
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
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgClass} ${borderClass} ${
                  !showResult ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-foreground">{option}</span>
                  
                  {showResult && isCorrectOption && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </motion.div>
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <XCircle className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-muted/50 border border-border"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCorrect ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                }`}>
                  {isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className={`font-medium mb-1 ${
                    isCorrect ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {isCorrect ? 'Great job!' : 'Good try!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {question.explanation}
                  </p>
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
              <Button onClick={handleContinue} size="lg" className="gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
