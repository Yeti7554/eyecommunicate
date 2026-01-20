import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Crosshair, Users, Trophy, Settings } from 'lucide-react';
import { CreateGame } from './CreateGame';
import { GameSetup } from './GameSetup';
import type { Tables } from '@/integrations/supabase/types';

type Game = Tables<'games'> & {
  players?: Tables<'players'>[];
};

export function HostDashboard() {
  const { user, signOut } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  console.log('HostDashboard render:', { user: user?.email, loading, gamesCount: games.length });

  useEffect(() => {
    loadGames();
    // Temporarily disabled check_expired_games to debug
    // const checkExpiredGames = async () => {
    //   try {
    //     const { data, error } = await supabase.rpc('check_expired_games');
    //     if (error) throw error;
    //
    //     if (data && data > 0) {
    //       console.log(`Ended ${data} expired games`);
    //       loadGames(); // Refresh the games list
    //     }
    //   } catch (error) {
    //     console.error('Error checking expired games:', error);
    //   }
    // };

    // Check immediately and then every minute
    // checkExpiredGames();
    // const interval = setInterval(checkExpiredGames, 60000);

    // return () => clearInterval(interval);
  }, []);

  const loadGames = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Loading games for user:', user.id);
    try {
      console.log('Making supabase query for user:', user.id);
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          players (*)
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('Error loading games:', error);
        // If table doesn't exist, just set empty array
        if (error.code === 'PGRST116' || error.message?.includes('games')) {
          console.log('games table does not exist yet');
          setGames([]);
          return;
        }
        throw error;
      }
      console.log('Loaded games successfully:', data?.length || 0, 'games');
      console.log('Game details:', data?.map(g => ({ id: g.id, name: g.name, status: g.status, duration_hours: g.duration_hours, ended_at: g.ended_at })));
      setGames(data || []);
    } catch (error) {
      console.error('Error loading games:', error);
      setGames([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleGameCreated = () => {
    setShowCreateGame(false);
    loadGames();
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

  if (showCreateGame) {
    return <CreateGame onBack={() => setShowCreateGame(false)} onGameCreated={handleGameCreated} />;
  }

  if (selectedGame) {
    return (
      <GameSetup
        game={selectedGame}
        onBack={() => setSelectedGame(null)}
        onGameUpdated={loadGames}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Crosshair className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Assassin</h1>
                <p className="text-sm text-muted-foreground">Host Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Host'}
          </h2>
          <p className="text-muted-foreground">
            Manage your assassin games and track the hunt.
          </p>
        </div>

        {/* Create Game Button */}
        <div className="mb-8">
          <Button onClick={() => setShowCreateGame(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Game
          </Button>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Crosshair className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No games yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first assassin game to get started.
              </p>
              <Button onClick={() => setShowCreateGame(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Game
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Card key={game.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{game.name}</CardTitle>
                    {getStatusBadge(game.status)}
                  </div>
                  <CardDescription>
                    Created {new Date(game.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {game.players?.length || 0} players
                    </div>

                    {game.status === 'ended' && game.winner_id && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Trophy className="w-4 h-4" />
                        Game completed
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedGame(game)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}