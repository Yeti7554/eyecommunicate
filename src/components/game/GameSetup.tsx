import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Play, Pause, Square, Trash2, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { notificationService } from '@/lib/notificationService';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Game = Tables<'games'> & {
  players?: Tables<'players'>[];
};

// Countdown Timer Component
function GameCountdownTimer({ gameId, durationHours }: { gameId: string; durationHours: number }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = async () => {
      try {
        const { data, error } = await supabase.rpc('get_game_remaining_time', { game_uuid: gameId });

        if (error) throw error;

        if (data) {
          const interval = data as any; // Supabase returns interval as string
          const hours = Math.floor(interval.hours || 0);
          const minutes = Math.floor(interval.minutes || 0);
          const seconds = Math.floor(interval.seconds || 0);

          if (hours > 0 || minutes > 0 || seconds > 0) {
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          } else {
            setTimeLeft('EXPIRED');
            // Refresh the page to show game ended
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Error getting remaining time:', error);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [gameId]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Time Remaining</h3>
      </div>
      <div className="text-3xl font-mono font-bold text-primary">
        {timeLeft || 'Loading...'}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Game ends in {durationHours} hour{durationHours !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

interface GameSetupProps {
  game: Game;
  onBack: () => void;
  onGameUpdated: () => void;
}

export function GameSetup({ game, onBack, onGameUpdated }: GameSetupProps) {
  const [players, setPlayers] = useState<Tables<'players'>[]>(game.players || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlayers();

    // Check for game status changes periodically
    const checkGameStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('status')
          .eq('id', game.id)
          .single();

        if (error) throw error;

        if (data.status !== game.status) {
          // Game status changed, refresh the parent component
          onGameUpdated();
        }
      } catch (error) {
        console.error('Error checking game status:', error);
      }
    };

    const interval = setInterval(checkGameStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [game.id, game.status, onGameUpdated]);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', game.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };


  const handleStartGame = async () => {
    console.log('Starting game with players:', players);
    if (players.length < 2) {
      toast.error('Need at least 2 players to start the game');
      return;
    }

    // Check if all players have emails
    const playersWithoutEmails = players.filter(p => !p.email);
    console.log('Players without emails:', playersWithoutEmails);
    if (playersWithoutEmails.length > 0) {
      toast.error(`All players must have email addresses. ${playersWithoutEmails.length} players are missing emails.`);
      return;
    }

    setLoading(true);
    try {
      console.log('Calling start_game RPC with game_uuid:', game.id);
      const { error } = await supabase.rpc('start_game', { game_uuid: game.id });
      console.log('start_game RPC result:', { error });

      if (error) throw error;

      // Reload players to get updated target assignments and kill words
      await loadPlayers();

      // Send SMS messages to all players
      await sendGameStartMessages();

      console.log('Game started successfully, reloading data...');
      toast.success('Game started! Players have received their assignments via email.');
      // Reload players to show kill words
      await loadPlayers();
      console.log('Calling onGameUpdated...');
      onGameUpdated();
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const sendGameStartMessages = async () => {
    try {
      // Get fresh player data with targets
      const { data: updatedPlayers, error } = await supabase
        .from('players')
        .select(`
          *,
          target:target_id (
            name,
            kill_word
          )
        `)
        .eq('game_id', game.id)
        .eq('is_alive', true);

      if (error) throw error;

      const emailPromises = updatedPlayers?.map(async (player) => {
        if (!player.email || !player.target) return;

        const target = Array.isArray(player.target) ? player.target[0] : player.target;

        // Send assassin assignment to each player with their target and kill word
        await notificationService.sendAssassinAssignment({
          playerName: player.name,
          targetName: target.name,
          killWord: player.kill_word,
          gameName: game.name,
          eliminationMethod: game.elimination_method,
          safeZones: game.safe_zones || undefined,
          safeTimes: game.safe_times || undefined,
          gameCode: game.code,
          playerId: player.id,
          email: player.email,
        });
      });

      await Promise.all(emailPromises || []);
    } catch (error) {
      console.error('Error sending SMS messages:', error);
      // Don't throw here - the game started successfully, SMS is a bonus
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq('game_id', game.id);

      if (error) throw error;

      loadPlayers();
      toast.success('Player removed');
    } catch (error) {
      console.error('Error removing player:', error);
      toast.error('Failed to remove player');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'setup':
        return <Badge variant="secondary">Setup</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      case 'ended':
        return <Badge variant="destructive">Ended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{game.name}</h1>
              <p className="text-sm text-muted-foreground">Game Code: {game.code}</p>
            </div>
            {getStatusBadge(game.status)}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Game Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Game Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Elimination Method</h4>
              <p className="text-sm">{game.elimination_method}</p>
            </div>

            {game.safe_zones && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Safe Zones</h4>
                <p className="text-sm">{game.safe_zones}</p>
              </div>
            )}

            {game.safe_times && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Safe Times</h4>
                <p className="text-sm">{game.safe_times}</p>
              </div>
            )}

            {game.duration_hours && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Duration</h4>
                <p className="text-sm">{game.duration_hours} hours</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Countdown Timer */}
        {game.status === 'active' && game.duration_hours && (
          <Card>
            <CardContent className="pt-6">
              <GameCountdownTimer gameId={game.id} durationHours={game.duration_hours} />
            </CardContent>
          </Card>
        )}

        {/* Players */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Players ({players.length})</CardTitle>
                <CardDescription>
                  Players added to this game
                </CardDescription>
              </div>

            </div>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No players added yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    {game.status === 'active' && <TableHead>Kill Word</TableHead>}
                    <TableHead>Status</TableHead>
                    {game.status === 'setup' && <TableHead className="w-20">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>
                        {player.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {player.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No email</span>
                        )}
                      </TableCell>
                      {game.status === 'active' && (
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {player.kill_word || 'Generating...'}
                          </code>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={player.is_alive ? "default" : "secondary"}>
                          {player.is_alive ? 'Alive' : 'Eliminated'}
                        </Badge>
                      </TableCell>
                      {game.status === 'setup' && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePlayer(player.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Game Controls */}
        {game.status === 'setup' && players.length >= 2 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
                <p className="text-muted-foreground mb-4">
                  This will randomly assign targets and send SMS messages to players with their assignments.
                </p>
                <Button onClick={handleStartGame} disabled={loading} size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? 'Starting Game...' : 'Start Game'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {game.status === 'active' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Game in Progress</h3>
                <p className="text-muted-foreground mb-4">
                  {players.filter(p => p.is_alive).length} players remaining
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Game
                  </Button>
                  <Button variant="destructive">
                    <Square className="w-4 h-4 mr-2" />
                    End Game
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}