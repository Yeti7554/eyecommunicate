-- Add email and kill word fields to players table
ALTER TABLE public.players ADD COLUMN email TEXT;

-- Create saved_players table for hosts to save frequently used players
CREATE TABLE public.saved_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.players ADD COLUMN kill_word TEXT;

-- Add game duration to games table
ALTER TABLE public.games ADD COLUMN duration_hours INTEGER;

-- Create function to generate random kill words
CREATE OR REPLACE FUNCTION public.generate_kill_word()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  words TEXT[] := ARRAY[
    'shadow', 'whisper', 'phantom', 'ghost', 'night', 'hunter', 'strike', 'blade',
    'silence', 'dark', 'storm', 'eagle', 'wolf', 'tiger', 'dragon', 'falcon',
    'raven', 'hawk', 'cobra', 'viper', 'lynx', 'jaguar', 'panther', 'lion',
    'bear', 'shark', 'eagle', 'condor', 'owl', 'crow', 'spider', 'scorpion'
  ];
  random_word TEXT;
BEGIN
  random_word := words[1 + floor(random() * array_length(words, 1))];
  RETURN random_word;
END;
$$;

-- Function to generate kill words for all players in a game
CREATE OR REPLACE FUNCTION public.generate_game_kill_words(game_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  player_record RECORD;
  words TEXT[] := ARRAY[
    'shadow', 'whisper', 'phantom', 'ghost', 'night', 'hunter', 'strike', 'blade',
    'silence', 'dark', 'storm', 'eagle', 'wolf', 'tiger', 'dragon', 'falcon',
    'raven', 'hawk', 'cobra', 'viper', 'lynx', 'jaguar', 'panther', 'lion',
    'bear', 'shark', 'eagle', 'condor', 'owl', 'crow', 'spider', 'scorpion'
  ];
  used_words TEXT[] := ARRAY[]::TEXT[];
  random_word TEXT;
BEGIN
  -- Generate unique kill words for each player
  FOR player_record IN SELECT id FROM public.players WHERE game_id = game_uuid AND is_alive = true LOOP
    LOOP
      random_word := words[1 + floor(random() * array_length(words, 1))];
      EXIT WHEN NOT (random_word = ANY(used_words));
    END LOOP;

    used_words := array_append(used_words, random_word);

    UPDATE public.players
    SET kill_word = random_word
    WHERE id = player_record.id;
  END LOOP;
END;
$$;

-- Function to start game and assign targets
CREATE OR REPLACE FUNCTION public.start_game(game_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  player_record RECORD;
  player_ids UUID[];
  target_index INTEGER;
  game_record RECORD;
  assassin_player_id UUID;
BEGIN
  -- Get game details
  SELECT * INTO game_record FROM public.games WHERE id = game_uuid;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get all players for this game
  SELECT array_agg(id ORDER BY created_at)
  INTO player_ids
  FROM public.players
  WHERE game_id = game_uuid AND is_alive = true;

  -- Need at least 2 players
  IF array_length(player_ids, 1) < 2 THEN
    RETURN false;
  END IF;

  -- Generate kill words for all players
  PERFORM public.generate_game_kill_words(game_uuid);

  -- Randomly select one player to be the assassin (gets first target)
  assassin_player_id := player_ids[1 + floor(random() * array_length(player_ids, 1))];

  -- Assign targets in a circle, starting with the assassin
  FOR i IN 1..array_length(player_ids, 1) LOOP
    target_index := i % array_length(player_ids, 1) + 1;
    UPDATE public.players
    SET target_id = player_ids[target_index]
    WHERE id = player_ids[i] AND game_id = game_uuid;
  END LOOP;

  -- Update game status and set end time if duration is specified
  UPDATE public.games
  SET
    status = 'active',
    started_at = now(),
    ended_at = CASE
      WHEN duration_hours IS NOT NULL AND duration_hours > 0 THEN now() + interval '1 hour' * duration_hours
      ELSE NULL
    END
  WHERE id = game_uuid;

  RETURN true;
END;
$$;

-- Function to check and end expired games
CREATE OR REPLACE FUNCTION public.check_expired_games()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  expired_game RECORD;
  games_ended INTEGER := 0;
BEGIN
  FOR expired_game IN
    SELECT id, name
    FROM public.games
    WHERE status = 'active'
    AND ended_at IS NOT NULL
    AND ended_at < now()
  LOOP
    -- End the game
    UPDATE public.games
    SET status = 'ended', ended_at = now()
    WHERE id = expired_game.id;

    games_ended := games_ended + 1;
  END LOOP;

  RETURN games_ended;
END;
$$;

-- Function to get remaining time for a game
CREATE OR REPLACE FUNCTION public.get_game_remaining_time(game_uuid UUID)
RETURNS INTERVAL
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  game_record RECORD;
BEGIN
  SELECT * INTO game_record FROM public.games WHERE id = game_uuid;

  IF game_record.status != 'active' OR game_record.ended_at IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN game_record.ended_at - now();
END;
$$;

-- Enable RLS for saved_players
ALTER TABLE public.saved_players ENABLE ROW LEVEL SECURITY;

-- Saved players policies: hosts can manage their own saved players
CREATE POLICY "Hosts can manage their saved players"
ON public.saved_players FOR ALL
USING (auth.uid() = host_id);

-- Function to eliminate a player
CREATE OR REPLACE FUNCTION public.eliminate_player(game_uuid UUID, eliminator_uuid UUID, eliminated_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  eliminated_target UUID;
BEGIN
  -- Verify the elimination is valid
  SELECT target_id INTO eliminated_target
  FROM public.players
  WHERE id = eliminator_uuid AND game_id = game_uuid AND is_alive = true;

  IF eliminated_target != eliminated_uuid THEN
    RETURN false;
  END IF;

  -- Mark player as eliminated
  UPDATE public.players
  SET is_alive = false, eliminated_at = now()
  WHERE id = eliminated_uuid AND game_id = game_uuid;

  -- Record the elimination
  INSERT INTO public.eliminations (game_id, eliminator_id, eliminated_id)
  VALUES (game_uuid, eliminator_uuid, eliminated_uuid);

  -- Assign new target to eliminator
  UPDATE public.players
  SET target_id = eliminated_target
  WHERE id = eliminator_uuid AND game_id = game_uuid;

  -- Check if game is over (only one player left)
  IF (SELECT count(*) FROM public.players WHERE game_id = game_uuid AND is_alive = true) = 1 THEN
    -- End the game
    UPDATE public.games
    SET status = 'ended', ended_at = now(), winner_id = eliminator_uuid
    WHERE id = game_uuid;
  END IF;

  RETURN true;
END;
$$;