-- Fix 1: Revoke EXECUTE on internal-only SECURITY DEFINER functions from public/authenticated roles
REVOKE EXECUTE ON FUNCTION public.generate_questions_for_game(uuid, text, integer) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.increment_session_stats(uuid, boolean) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.unlock_first_games_for_user(uuid) FROM PUBLIC, authenticated, anon;

-- Fix 2: Add explicit SELECT policy on analytics_events so users can only read their own events
CREATE POLICY "Users can view own analytics events"
ON public.analytics_events
FOR SELECT
USING (auth.uid() = user_id);