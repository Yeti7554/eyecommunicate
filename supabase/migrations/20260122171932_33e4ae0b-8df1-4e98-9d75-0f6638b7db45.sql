-- Drop all old tables from the Assassin game
DROP TABLE IF EXISTS public.eliminations CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.saved_players CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;

-- Drop the enum
DROP TYPE IF EXISTS public.game_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.generate_game_code() CASCADE;
DROP FUNCTION IF EXISTS public.eliminate_player(uuid, uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.start_game(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_game_remaining_time(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_expired_games() CASCADE;
DROP FUNCTION IF EXISTS public.generate_kill_word() CASCADE;
DROP FUNCTION IF EXISTS public.generate_game_kill_words(uuid) CASCADE;