import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';

export interface AIQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formula?: string;
  hint?: string;
}

interface UseAIQuestionsOptions {
  chapter: string;
  gameTitle: string;
  gameConcept: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  fallbackQuestions?: AIQuizQuestion[];
}

export function useAIQuestions({
  chapter,
  gameTitle,
  gameConcept,
  difficulty = 'medium',
  count = 8,
  fallbackQuestions = [],
}: UseAIQuestionsOptions) {
  const [questions, setQuestions] = useState<AIQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useAppStore();
  const grade = settings.grade || 11;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Try to load from the database first (no API credits used)
      const { data: gameData } = await supabase
        .from('games')
        .select('id')
        .eq('game_title', gameTitle)
        .eq('chapter', chapter)
        .maybeSingle();

      if (gameData?.id) {
        const { data: dbQuestions } = await supabase
          .from('questions')
          .select('*')
          .eq('game_id', gameData.id)
          .eq('difficulty', difficulty);

        if (dbQuestions && dbQuestions.length >= count) {
          // Shuffle and pick `count` questions from the database
          const shuffled = dbQuestions.sort(() => Math.random() - 0.5).slice(0, count);
          const mapped: AIQuizQuestion[] = shuffled.map((q) => ({
            question: q.question_text,
            options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as string),
            correctIndex: q.correct_answer,
            explanation: q.explanation,
            hint: q.hint || undefined,
          }));
          setQuestions(mapped);
          setLoading(false);
          return;
        }

        // If we have some DB questions but not enough, grab all difficulties
        if (dbQuestions && dbQuestions.length > 0) {
          const { data: allDbQ } = await supabase
            .from('questions')
            .select('*')
            .eq('game_id', gameData.id);

          if (allDbQ && allDbQ.length >= count) {
            const shuffled = allDbQ.sort(() => Math.random() - 0.5).slice(0, count);
            const mapped: AIQuizQuestion[] = shuffled.map((q) => ({
              question: q.question_text,
              options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as string),
              correctIndex: q.correct_answer,
              explanation: q.explanation,
              hint: q.hint || undefined,
            }));
            setQuestions(mapped);
            setLoading(false);
            return;
          }
        }
      }

      // Step 2: Fall back to AI generation if DB has insufficient questions
      const generated: AIQuizQuestion[] = [];

      for (let i = 0; i < count; i += 4) {
        const batch = Array.from({ length: Math.min(4, count - i) }, (_, j) =>
          fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-question`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                chapter,
                gameTitle,
                gameConcept,
                difficulty,
                grade,
                questionNumber: i + j + 1,
              }),
            }
          )
        );

        const results = await Promise.allSettled(batch);

        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.ok) {
            try {
              const data = await result.value.json();
              if (data && data.options && Array.isArray(data.options)) {
                generated.push({
                  question: data.question || '',
                  options: data.options,
                  correctIndex: typeof data.correctAnswer === 'number' ? data.correctAnswer : 0,
                  explanation: data.explanation || '',
                  formula: data.formula,
                  hint: data.hint,
                });
              }
            } catch {
              // skip malformed response
            }
          }
        }
      }

      if (generated.length >= 3) {
        setQuestions(generated);
      } else if (fallbackQuestions.length > 0) {
        console.warn('AI questions insufficient, using fallback');
        setQuestions(fallbackQuestions);
      } else {
        setError('Could not generate enough questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      if (fallbackQuestions.length > 0) {
        setQuestions(fallbackQuestions);
      } else {
        setError('Failed to load questions');
      }
    } finally {
      setLoading(false);
    }
  }, [chapter, gameTitle, gameConcept, difficulty, grade, count, fallbackQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, loading, error, grade, retry: fetchQuestions };
}
