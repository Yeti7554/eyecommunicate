import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, Target, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Player, Game } from '@/types/game';

interface TargetRevealProps {
  player: Player;
  target: Player | null;
  game: Game;
  onNext: () => void;
  isLast: boolean;
}

export function TargetReveal({ player, target, game, onNext, isLast }: TargetRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleAccept = () => {
    setAccepted(true);
    setTimeout(onNext, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">
                Pass the phone to
              </p>
              <h1 className="text-4xl font-bold text-foreground">{player.name}</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-8"
            >
              <Button
                onClick={handleReveal}
                size="lg"
                className="relative overflow-hidden group bg-card hover:bg-card/80 border border-border text-foreground px-8 py-6 text-lg"
              >
                <EyeOff className="mr-3 h-5 w-5" />
                <span>Tap to reveal your target</span>
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  animate={{ 
                    x: ['-100%', '100%'],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-muted-foreground"
            >
              Make sure no one else can see the screen
            </motion.p>
          </motion.div>
        ) : !accepted ? (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary pulse-danger"
            >
              <Target className="w-10 h-10 text-primary" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">
                Your Target
              </p>
              <h1 className="text-5xl font-bold text-foreground mb-2">
                {target?.name || 'Unknown'}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 text-left bg-card rounded-lg p-4 border border-border"
            >
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Elimination Method</p>
                  <p className="text-foreground">{game.elimination_method}</p>
                </div>
              </div>

              {game.safe_zones && (
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-success mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Safe Zones</p>
                    <p className="text-foreground">{game.safe_zones}</p>
                  </div>
                </div>
              )}

              {game.safe_times && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-warning mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Safe Times</p>
                    <p className="text-foreground">{game.safe_times}</p>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={handleAccept}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                <Eye className="mr-2 h-5 w-5" />
                I understand the rules
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9 }}
              className="text-xs text-muted-foreground"
            >
              {isLast ? 'You are the last player' : 'Pass to the next player after confirming'}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="accepted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center border-2 border-success"
            >
              <Eye className="w-8 h-8 text-success" />
            </motion.div>
            <p className="mt-4 text-muted-foreground">
              {isLast ? 'Starting game...' : 'Passing to next player...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
