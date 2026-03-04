
-- Add grade column to games table
ALTER TABLE public.games ADD COLUMN grade integer NOT NULL DEFAULT 11;

-- Create index for faster grade-based queries
CREATE INDEX idx_games_grade ON public.games (grade);

-- Create unique constraint to prevent duplicate games per grade
ALTER TABLE public.games ADD CONSTRAINT unique_game_per_grade UNIQUE (chapter, game_number, grade);
