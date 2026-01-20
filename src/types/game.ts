export type GameStatus = 'setup' | 'active' | 'paused' | 'ended';

export interface Game {
  id: string;
  host_id: string;
  name: string;
  code: string;
  elimination_method: string;
  safe_zones: string | null;
  safe_times: string | null;
  status: GameStatus;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface Player {
  id: string;
  game_id: string;
  name: string;
  target_id: string | null;
  is_alive: boolean;
  secret_code: string;
  reveal_order: number | null;
  created_at: string;
  eliminated_at: string | null;
}

export interface Elimination {
  id: string;
  game_id: string;
  eliminator_id: string;
  eliminated_id: string;
  created_at: string;
}

export interface GameWithPlayers extends Game {
  players: Player[];
}
