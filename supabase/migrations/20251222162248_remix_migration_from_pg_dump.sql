CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: generate_questions_for_game(uuid, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_questions_for_game(p_game_id uuid, p_difficulty text, p_count integer DEFAULT 10) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_game RECORD;
  v_question_data JSONB;
  i INTEGER;
BEGIN
  -- Get game details
  SELECT * INTO v_game FROM public.games WHERE id = p_game_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;
  
  -- This function creates placeholder questions
  -- In production, you would call the AI API here to generate real questions
  FOR i IN 1..p_count LOOP
    INSERT INTO public.questions (
      game_id,
      difficulty,
      question_text,
      options,
      correct_answer,
      explanation,
      hint,
      topic
    ) VALUES (
      p_game_id,
      p_difficulty,
      format('Question %s for %s - %s (Difficulty: %s)', i, v_game.chapter, v_game.game_title, p_difficulty),
      jsonb_build_array(
        'Option A',
        'Option B', 
        'Option C',
        'Option D'
      ),
      floor(random() * 4)::INTEGER,
      format('This is the explanation for question %s', i),
      format('Here is a hint for question %s', i),
      v_game.game_concept
    );
  END LOOP;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, grade, subjects)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    COALESCE((NEW.raw_user_meta_data->>'grade')::INTEGER, 11),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'subjects')),
      '{}'::TEXT[]
    )
  );
  
  -- Unlock first game of each chapter
  PERFORM unlock_first_games_for_user(NEW.id);
  
  RETURN NEW;
END;
$$;


--
-- Name: increment_session_stats(uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_session_stats(p_session_id uuid, p_is_correct boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.sessions
  SET 
    tasks_completed = tasks_completed + 1,
    tasks_correct = tasks_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END
  WHERE id = p_session_id;
END;
$$;


--
-- Name: unlock_first_games_for_user(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.unlock_first_games_for_user(p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Unlock Easy level for ALL games (not just first in each chapter)
  INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
  SELECT p_user_id, g.id, 'easy', true
  FROM public.games g
  ON CONFLICT (user_id, game_id, difficulty) 
  DO UPDATE SET unlocked = true;
END;
$$;


--
-- Name: unlock_next_level(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.unlock_next_level() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_next_difficulty text;
BEGIN
  -- Only process if completed with decent accuracy (>50%)
  IF NEW.completed_at IS NOT NULL AND NEW.best_accuracy >= 50 THEN
    
    -- Determine next difficulty level within the SAME game
    IF NEW.difficulty = 'easy' THEN
      v_next_difficulty := 'medium';
      
      -- Unlock medium difficulty for same game
      INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
      VALUES (NEW.user_id, NEW.game_id, v_next_difficulty, true)
      ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
      SET unlocked = true;
      
    ELSIF NEW.difficulty = 'medium' THEN
      v_next_difficulty := 'hard';
      
      -- Unlock hard difficulty for same game
      INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
      VALUES (NEW.user_id, NEW.game_id, v_next_difficulty, true)
      ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
      SET unlocked = true;
    
    -- When hard is completed, do nothing (no cross-game unlocking)
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    event_type text NOT NULL,
    session_id uuid,
    task_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: game_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    game_id uuid NOT NULL,
    difficulty text NOT NULL,
    stars_earned integer DEFAULT 0,
    best_accuracy numeric DEFAULT 0,
    questions_completed integer DEFAULT 0,
    hints_used integer DEFAULT 0,
    unlocked boolean DEFAULT false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT game_progress_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]))),
    CONSTRAINT game_progress_stars_earned_check CHECK (((stars_earned >= 0) AND (stars_earned <= 3)))
);


--
-- Name: games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.games (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chapter text NOT NULL,
    game_number integer NOT NULL,
    game_title text NOT NULL,
    game_concept text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text NOT NULL,
    grade integer NOT NULL,
    subjects text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_grade_check CHECK ((grade = ANY (ARRAY[11, 12])))
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    game_id uuid NOT NULL,
    difficulty text NOT NULL,
    question_text text NOT NULL,
    options jsonb NOT NULL,
    correct_answer integer NOT NULL,
    explanation text NOT NULL,
    hint text,
    topic text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT questions_correct_answer_check CHECK (((correct_answer >= 0) AND (correct_answer <= 3))),
    CONSTRAINT questions_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])))
);


--
-- Name: rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reward_type text NOT NULL,
    reward_title text NOT NULL,
    reward_description text,
    earned_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subject text NOT NULL,
    start_time timestamp with time zone DEFAULT now(),
    end_time timestamp with time zone,
    duration_seconds integer,
    tasks_completed integer DEFAULT 0,
    tasks_correct integer DEFAULT 0,
    total_hints_used integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    game_id uuid,
    difficulty text,
    CONSTRAINT sessions_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])))
);


--
-- Name: task_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    task_id text NOT NULL,
    subject text NOT NULL,
    topic text NOT NULL,
    difficulty integer NOT NULL,
    correct boolean NOT NULL,
    response_time_ms integer NOT NULL,
    hints_used integer DEFAULT 0,
    skipped boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subject text NOT NULL,
    ema_accuracy numeric DEFAULT 0.7,
    ema_time numeric DEFAULT 10,
    ema_hints numeric DEFAULT 0,
    difficulty_level integer DEFAULT 2,
    streak_days integer DEFAULT 0,
    tokens integer DEFAULT 0,
    last_session_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_performance_difficulty_level_check CHECK (((difficulty_level >= 1) AND (difficulty_level <= 5)))
);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: game_progress game_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_progress
    ADD CONSTRAINT game_progress_pkey PRIMARY KEY (id);


--
-- Name: game_progress game_progress_user_id_game_id_difficulty_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_progress
    ADD CONSTRAINT game_progress_user_id_game_id_difficulty_key UNIQUE (user_id, game_id, difficulty);


--
-- Name: games games_chapter_game_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_chapter_game_number_key UNIQUE (chapter, game_number);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: task_results task_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_results
    ADD CONSTRAINT task_results_pkey PRIMARY KEY (id);


--
-- Name: user_performance user_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_performance
    ADD CONSTRAINT user_performance_pkey PRIMARY KEY (id);


--
-- Name: user_performance user_performance_user_id_subject_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_performance
    ADD CONSTRAINT user_performance_user_id_subject_key UNIQUE (user_id, subject);


--
-- Name: idx_questions_game_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_game_difficulty ON public.questions USING btree (game_id, difficulty);


--
-- Name: game_progress auto_unlock_next_level; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auto_unlock_next_level AFTER UPDATE ON public.game_progress FOR EACH ROW WHEN (((new.completed_at IS NOT NULL) AND (old.completed_at IS NULL))) EXECUTE FUNCTION public.unlock_next_level();


--
-- Name: game_progress update_game_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_game_progress_updated_at BEFORE UPDATE ON public.game_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_performance update_performance_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_performance_updated_at BEFORE UPDATE ON public.user_performance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: questions update_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: analytics_events analytics_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: game_progress game_progress_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_progress
    ADD CONSTRAINT game_progress_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: game_progress game_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_progress
    ADD CONSTRAINT game_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: questions questions_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: rewards rewards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id);


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: task_results task_results_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_results
    ADD CONSTRAINT task_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: task_results task_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_results
    ADD CONSTRAINT task_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_performance user_performance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_performance
    ADD CONSTRAINT user_performance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sessions Users can create own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own sessions" ON public.sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: analytics_events Users can insert own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own events" ON public.analytics_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: game_progress Users can insert own game progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own game progress" ON public.game_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_performance Users can insert own performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own performance" ON public.user_performance FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: rewards Users can insert own rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own rewards" ON public.rewards FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: task_results Users can insert own task results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own task results" ON public.task_results FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: game_progress Users can update own game progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own game progress" ON public.game_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_performance Users can update own performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own performance" ON public.user_performance FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: sessions Users can update own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: games Users can view all games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all games" ON public.games FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: game_progress Users can view own game progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own game progress" ON public.game_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_performance Users can view own performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own performance" ON public.user_performance FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: rewards Users can view own rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own rewards" ON public.rewards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: sessions Users can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: task_results Users can view own task results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own task results" ON public.task_results FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: questions Users can view questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view questions" ON public.questions FOR SELECT TO authenticated USING (true);


--
-- Name: analytics_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: game_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: games; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: task_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.task_results ENABLE ROW LEVEL SECURITY;

--
-- Name: user_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_performance ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;