import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Play, Users, Target, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Game, Player } from '@/types/game';

interface GameSetupProps {
  game: Game;
  players: Player[];
  onAddPlayer: (name: string) => Promise<void>;
  onRemovePlayer: (playerId: string) => Promise<void>;
  onStartGame: () => Promise<void>;
}

export function GameSetup({ game, players, onAddPlayer, onRemovePlayer, onStartGame }: GameSetupProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    setIsAdding(true);
    try {
      await onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStartGame();
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">
          Game Code
        </p>
        <h1 className="text-4xl font-mono font-bold text-primary tracking-wider">
          {game.code}
        </h1>
        <p className="text-muted-foreground mt-2">{game.name}</p>
      </motion.div>

      {/* Game Rules Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-lg p-4 border border-border mb-6 space-y-3"
      >
        <div className="flex items-start gap-3">
          <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Elimination</p>
            <p className="text-sm text-foreground">{game.elimination_method}</p>
          </div>
        </div>
        
        {game.safe_zones && (
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Safe Zones</p>
              <p className="text-sm text-foreground">{game.safe_zones}</p>
            </div>
          </div>
        )}

        {game.safe_times && (
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Safe Times</p>
              <p className="text-sm text-foreground">{game.safe_times}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Players */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <Label className="text-muted-foreground">Players ({players.length})</Label>
        </div>

        <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
          <Input
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="bg-secondary border-border"
          />
          <Button
            type="submit"
            disabled={!newPlayerName.trim() || isAdding}
            className="bg-primary hover:bg-primary/90 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </form>

        {/* Player List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3 group"
            >
              <span className="text-foreground">{player.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemovePlayer(player.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}

          {players.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Add players to start the game
            </p>
          )}
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-auto pt-6"
      >
        <Button
          onClick={handleStart}
          disabled={players.length < 2 || isStarting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg relative overflow-hidden group"
        >
          <Play className="mr-2 h-5 w-5" />
          {isStarting ? 'Starting...' : 'Start Game & Assign Targets'}
          
          {players.length >= 2 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </Button>
        
        {players.length < 2 && (
          <p className="text-center text-muted-foreground text-sm mt-2">
            Need at least 2 players to start
          </p>
        )}
      </motion.div>
    </div>
  );
}
