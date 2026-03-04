-- Fix increment_session_stats: add ownership validation
CREATE OR REPLACE FUNCTION public.increment_session_stats(p_session_id uuid, p_is_correct boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.sessions
  SET 
    tasks_completed = tasks_completed + 1,
    tasks_correct = tasks_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END
  WHERE id = p_session_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;
END;
$$;

-- Add DELETE policies to all user-scoped tables
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "Users can delete own sessions"
ON public.sessions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own task results"
ON public.task_results
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics events"
ON public.analytics_events
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own game progress"
ON public.game_progress
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own performance"
ON public.user_performance
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rewards"
ON public.rewards
FOR DELETE
USING (auth.uid() = user_id);