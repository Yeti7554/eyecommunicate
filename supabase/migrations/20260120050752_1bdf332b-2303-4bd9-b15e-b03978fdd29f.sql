-- Create enum for game status
CREATE TYPE public.game_status AS ENUM ('setup', 'active', 'paused', 'ended');

-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  elimination_method TEXT NOT NULL DEFAULT 'Tag your target',
  safe_zones TEXT,
  safe_times TEXT,
  status game_status NOT NULL DEFAULT 'setup',
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  is_alive BOOLEAN NOT NULL DEFAULT true,
  secret_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 6),
  reveal_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  eliminated_at TIMESTAMP WITH TIME ZONE
);

-- Create eliminations table for history
CREATE TABLE public.eliminations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  eliminator_id UUID REFERENCES public.players(id) ON DELETE SET NULL NOT NULL,
  eliminated_id UUID REFERENCES public.players(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eliminations ENABLE ROW LEVEL SECURITY;

-- Games policies: hosts can manage their games, anyone can read by code
CREATE POLICY "Hosts can manage their games"
ON public.games FOR ALL
USING (auth.uid() = host_id);

CREATE POLICY "Anyone can read games by code"
ON public.games FOR SELECT
USING (true);

-- Players policies: anyone can read players for a game they know
CREATE POLICY "Anyone can read players"
ON public.players FOR SELECT
USING (true);

CREATE POLICY "Hosts can manage players"
ON public.players FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.games 
    WHERE games.id = players.game_id 
    AND games.host_id = auth.uid()
  )
);

-- Eliminations policies
CREATE POLICY "Anyone can read eliminations"
ON public.eliminations FOR SELECT
USING (true);

CREATE POLICY "Hosts can manage eliminations"
ON public.eliminations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.games 
    WHERE games.id = eliminations.game_id 
    AND games.host_id = auth.uid()
  )
);

-- Function to generate unique game code
CREATE OR REPLACE FUNCTION public.generate_game_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.games WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Trigger to auto-generate game code
CREATE OR REPLACE FUNCTION public.set_game_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_game_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_game_code
BEFORE INSERT ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.set_game_code();