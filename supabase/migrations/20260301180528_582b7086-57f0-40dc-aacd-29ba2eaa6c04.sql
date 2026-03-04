
-- Drop the old unique constraint that doesn't include grade
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_chapter_game_number_key;
