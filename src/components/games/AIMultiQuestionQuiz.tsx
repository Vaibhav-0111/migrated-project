import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, GraduationCap } from 'lucide-react';
import { useAIQuestions, type AIQuizQuestion } from '@/hooks/useAIQuestions';
import { MultiQuestionQuiz } from './MultiQuestionQuiz';
import type { QuizQuestion } from '@/data/gameQuizzes';

interface AIMultiQuestionQuizProps {
  chapter: string;
  gameTitle: string;
  gameConcept: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  fallbackQuestions?: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

export function AIMultiQuestionQuiz({
  chapter,
  gameTitle,
  gameConcept,
  difficulty = 'medium',
  count = 8,
  fallbackQuestions = [],
  onComplete,
}: AIMultiQuestionQuizProps) {
  const { questions, loading, error, grade, retry } = useAIQuestions({
    chapter,
    gameTitle,
    gameConcept,
    difficulty,
    count,
    fallbackQuestions,
  });

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="max-w-md mx-4 p-8 bg-card rounded-3xl shadow-2xl border border-border/50 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Preparing Your Quiz
          </h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="gap-1">
              <GraduationCap className="w-3 h-3" />
              Grade {grade}
            </Badge>
            <Badge variant="secondary">{difficulty}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Generating {grade === 12 ? 'advanced' : 'foundation'} level questions tailored to your grade...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <div className="max-w-md mx-4 p-8 bg-card rounded-3xl shadow-2xl border border-border/50 text-center">
          <p className="text-foreground mb-4">{error}</p>
          <Button onClick={retry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  // Map AIQuizQuestion to QuizQuestion format for MultiQuestionQuiz
  const quizQuestions: QuizQuestion[] = questions.map((q) => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    formula: q.formula,
  }));

  return (
    <MultiQuestionQuiz
      questions={quizQuestions}
      gameTitle={gameTitle}
      grade={grade}
      difficulty={difficulty}
      onComplete={onComplete}
    />
  );
}
