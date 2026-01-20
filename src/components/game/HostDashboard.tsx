import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Skull, 
  Crown, 
  Pause, 
  Play, 
  Square,
  Target,
  Shield,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Game, Player } from '@/types/game';

interface HostDashboardProps {
  game: Game;
  players: Player[];
  onEliminatePlayer: (playerId: string) => Promise<void>;
  onPauseGame: () => Promise<void>;
  onResumeGame: () => Promise<void>;
  onEndGame: () => Promise<void>;
}

export function HostDashboard({
  game,
  players,
  onEliminatePlayer,
  onPauseGame,
  onResumeGame,
  onEndGame,
}: HostDashboardProps) {
  const [showTargets, setShowTargets] = useState(false);
  const [eliminatingPlayer, setEliminatingPlayer] = useState<string | null>(null);

  const alivePlayers = players.filter((p) => p.is_alive);
  const eliminatedPlayers = players.filter((p) => !p.is_alive);
  const winner = players.find((p) => p.id === game.winner_id);

  const handleEliminate = async (playerId: string) => {
    setEliminatingPlayer(playerId);
    try {
      await onEliminatePlayer(playerId);
    } finally {
      setEliminatingPlayer(null);
    }
  };

  const getTargetName = (player: Player) => {
    const target = players.find((p) => p.id === player.target_id);
    return target?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">
          {game.status === 'ended' ? 'Game Over' : 'Game in Progress'}
        </p>
        <h1 className="text-2xl font-bold text-foreground">{game.name}</h1>
        <p className="text-muted-foreground font-mono">{game.code}</p>
      </motion.div>

      {/* Status Banner */}
      <AnimatePresence mode="wait">
        {game.status === 'paused' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-warning/20 border border-warning rounded-lg p-4 mb-6 flex items-center gap-3"
          >
            <Pause className="w-5 h-5 text-warning" />
            <span className="text-warning font-medium">Game is paused</span>
          </motion.div>
        )}

        {game.status === 'ended' && winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/20 border border-primary rounded-lg p-6 mb-6 text-center"
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">Winner</p>
            <p className="text-3xl font-bold text-foreground">{winner.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Rules Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-lg p-4 border border-border mb-6 space-y-2 text-sm"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary shrink-0" />
          <span className="text-muted-foreground">{game.elimination_method}</span>
        </div>
        {game.safe_zones && (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-success shrink-0" />
            <span className="text-muted-foreground">{game.safe_zones}</span>
          </div>
        )}
        {game.safe_times && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning shrink-0" />
            <span className="text-muted-foreground">{game.safe_times}</span>
          </div>
        )}
      </motion.div>

      {/* Players Section */}
      <div className="flex-1 space-y-6">
        {/* Alive Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-success" />
              <span className="text-muted-foreground text-sm">
                Alive ({alivePlayers.length})
              </span>
            </div>
            {game.status !== 'ended' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTargets(!showTargets)}
                className="text-muted-foreground"
              >
                {showTargets ? (
                  <EyeOff className="w-4 h-4 mr-1" />
                ) : (
                  <Eye className="w-4 h-4 mr-1" />
                )}
                {showTargets ? 'Hide' : 'Show'} Targets
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {alivePlayers.map((player) => (
              <motion.div
                key={player.id}
                layout
                className="flex items-center justify-between bg-card rounded-lg px-4 py-3 border border-border group"
              >
                <div>
                  <span className="text-foreground font-medium">{player.name}</span>
                  {showTargets && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground"
                    >
                      → {getTargetName(player)}
                    </motion.p>
                  )}
                </div>
                
                {game.status === 'active' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Skull className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminate {player.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark them as eliminated and reassign targets. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleEliminate(player.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {eliminatingPlayer === player.id ? 'Eliminating...' : 'Eliminate'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Eliminated Players */}
        {eliminatedPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground text-sm">
                Eliminated ({eliminatedPlayers.length})
              </span>
            </div>

            <div className="space-y-2">
              {eliminatedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3 opacity-60"
                >
                  <span className="text-foreground line-through">{player.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      {game.status !== 'ended' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 pt-6 border-t border-border space-y-3"
        >
          <div className="flex gap-3">
            {game.status === 'active' ? (
              <Button
                onClick={onPauseGame}
                variant="outline"
                className="flex-1 border-warning text-warning hover:bg-warning/10"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause Game
              </Button>
            ) : (
              <Button
                onClick={onResumeGame}
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Game
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Square className="w-4 h-4 mr-2" />
                  End Game
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    End Game Early?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end the game without declaring a winner. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onEndGame}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    End Game
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      )}
    </div>
  );
}
