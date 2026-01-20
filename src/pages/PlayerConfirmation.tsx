import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crosshair, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Game = Tables<'games'>;
type Player = Tables<'players'>;

export default function PlayerConfirmation() {
  const [searchParams] = useSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [target, setTarget] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [killWord, setKillWord] = useState('');

  const gameCode = searchParams.get('code');
  const playerId = searchParams.get('player');

  useEffect(() => {
    if (gameCode && playerId) {
      loadGameData();
    } else {
      setLoading(false);
    }
  }, [gameCode, playerId]);

  const loadGameData = async () => {
    try {
      // Get game by code
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('code', gameCode)
        .single();

      if (gameError) throw gameError;

      // Get player by ID
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .eq('game_id', gameData.id)
        .single();

      if (playerError) throw playerError;

      setGame(gameData);
      setPlayer(playerData);

      // Get target info if player is alive and has a target
      if (playerData.is_alive && playerData.target_id) {
        const { data: targetData, error: targetError } = await supabase
          .from('players')
          .select('name, kill_word')
          .eq('id', playerData.target_id)
          .single();

        if (!targetError) {
          setTarget(targetData);
        }
      }
    } catch (error) {
      console.error('Error loading game data:', error);
      toast.error('Invalid game link or player not found');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmElimination = async () => {
    if (!player || !target || !game) return;

    if (killWord.toLowerCase().trim() !== player.kill_word.toLowerCase()) {
      toast.error('Incorrect kill word. Try again.');
      return;
    }

    setConfirming(true);
    try {
      const { error } = await supabase.rpc('eliminate_player', {
        game_uuid: game.id,
        eliminator_uuid: player.id,
        eliminated_uuid: player.target_id,
      });

      if (error) throw error;

      toast.success('Elimination confirmed! You have a new target.');
      // Reload data to show new target
      await loadGameData();
      setKillWord('');
    } catch (error) {
      console.error('Error confirming elimination:', error);
      toast.error('Failed to confirm elimination');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!game || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This game link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (game.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crosshair className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Game {game.status === 'ended' ? 'Over' : game.status}</CardTitle>
            <CardDescription>
              {game.status === 'ended'
                ? 'This game has ended. Check with your host for results.'
                : 'This game is not currently active.'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!player.is_alive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Eliminated</CardTitle>
            <CardDescription>
              You have been eliminated from {game.name}.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Crosshair className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{game.name}</h1>
          <p className="text-muted-foreground">Welcome, {player.name}</p>
        </div>

        {/* Game Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="default">Active Game</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Elimination Method</h3>
              <p className="text-sm">{game.elimination_method}</p>
            </div>

            {game.safe_zones && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Safe Zones</h3>
                <p className="text-sm">{game.safe_zones}</p>
              </div>
            )}

            {game.safe_times && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Safe Times</h3>
                <p className="text-sm">{game.safe_times}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Target */}
        {target && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Target</CardTitle>
              <CardDescription>
                Eliminate <span className="font-medium text-foreground">{target.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    To eliminate your target, you need their kill word. When you get it, confirm below:
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="killWord">Target's Kill Word</Label>
                  <Input
                    id="killWord"
                    value={killWord}
                    onChange={(e) => setKillWord(e.target.value)}
                    placeholder="Enter the kill word..."
                    disabled={confirming}
                  />
                </div>

                <Button
                  onClick={handleConfirmElimination}
                  disabled={!killWord.trim() || confirming}
                  className="w-full"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Elimination
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Target */}
        {!target && (
          <Card>
            <CardHeader className="text-center pb-3">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
              <CardTitle className="text-lg">Waiting for Assignment</CardTitle>
              <CardDescription>
                Your target assignment is being prepared.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}