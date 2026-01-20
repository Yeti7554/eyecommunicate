import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crosshair, Loader2, Plus, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface CreateGameProps {
  onBack: () => void;
  onGameCreated: () => void;
}

type SavedPlayer = Tables<'saved_players'>;

interface GamePlayer {
  id?: string;
  name: string;
  email: string;
  isSaved: boolean;
  saveForFuture: boolean;
}

export function CreateGame({ onBack, onGameCreated }: CreateGameProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayer[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<GamePlayer[]>([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', email: '', saveForFuture: false });

  const [formData, setFormData] = useState({
    name: '',
    eliminationMethod: 'Tag your target and say their kill word',
    safeZones: '',
    safeTimes: '',
    durationHours: '',
  });

  useEffect(() => {
    loadSavedPlayers();
  }, []);

  const loadSavedPlayers = async () => {
    if (!user) return;

    console.log('Loading saved players for user:', user.id);
    try {
      console.log('Making saved_players query...');
      const { data, error } = await supabase
        .from('saved_players')
        .select('*')
        .eq('host_id', user.id)
        .order('name');

      console.log('Saved players response:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('Error loading saved players:', error);
        // If table doesn't exist, just set empty array
        if (error.code === 'PGRST116' || error.message?.includes('saved_players')) {
          console.log('saved_players table does not exist yet');
          setSavedPlayers([]);
          return;
        }
        throw error;
      }
      console.log('Loaded saved players successfully:', data?.length, 'players');
      setSavedPlayers(data || []);
    } catch (error) {
      console.error('Error loading saved players:', error);
      setSavedPlayers([]);
    }
  };

  const addSavedPlayerToGame = (savedPlayer: SavedPlayer) => {
    const gamePlayer: GamePlayer = {
      id: savedPlayer.id,
      name: savedPlayer.name,
      email: savedPlayer.email || '',
      isSaved: true,
      saveForFuture: false,
    };

    // Check if already added
    if (selectedPlayers.some(p => p.id === savedPlayer.id)) {
      toast.error('Player already added to game');
      return;
    }

    setSelectedPlayers([...selectedPlayers, gamePlayer]);
  };

  const addNewPlayer = () => {
    if (!newPlayer.name.trim()) {
      toast.error('Player name is required');
      return;
    }

    const gamePlayer: GamePlayer = {
      name: newPlayer.name.trim(),
      email: newPlayer.email.trim(),
      isSaved: false,
      saveForFuture: newPlayer.saveForFuture,
    };

    setSelectedPlayers([...selectedPlayers, gamePlayer]);
    setNewPlayer({ name: '', email: '', saveForFuture: false });
    setShowAddPlayer(false);
  };

  const removePlayer = (index: number) => {
    setSelectedPlayers(selectedPlayers.filter((_, i) => i !== index));
  };

  const saveNewPlayers = async (players: GamePlayer[]) => {
    if (!user) return;

    const playersToSave = players.filter(p => p.saveForFuture && !p.isSaved);

    for (const player of playersToSave) {
      try {
        const { error } = await supabase
          .from('saved_players')
          .insert({
            host_id: user.id,
            name: player.name,
            email: player.email || null,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving player:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedPlayers.length === 0) {
      toast.error('Please add at least one player to the game');
      return;
    }

    setLoading(true);
    const durationValue = formData.durationHours && formData.durationHours !== "0" ? parseInt(formData.durationHours) : null;
    console.log('Creating game with duration_hours:', durationValue, 'formData.durationHours:', formData.durationHours);

    try {
      // Create the game
      const { data: gameData, error: gameError } = await supabase.from('games').insert({
        host_id: user.id,
        name: formData.name,
        elimination_method: formData.eliminationMethod,
        safe_zones: formData.safeZones || null,
        safe_times: formData.safeTimes || null,
        duration_hours: durationValue,
      }).select().single();

      if (gameError) throw gameError;

      // Add selected players to the game
      const playersToInsert = selectedPlayers.map(player => ({
        game_id: gameData.id,
        name: player.name,
        email: player.email || null,
      }));

      const { error: playersError } = await supabase
        .from('players')
        .insert(playersToInsert);

      if (playersError) throw playersError;

      // Save new players for future use
      await saveNewPlayers(selectedPlayers);

      toast.success('Game created successfully!');
      onGameCreated();
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Crosshair className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Create New Game</h1>
              <p className="text-sm text-muted-foreground">Set up your assassin game rules</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
            <CardDescription>
              Define the rules and boundaries for your assassin game. These settings ensure safety and fairness.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Game Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Game Settings</h3>

                {/* Game Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Game Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Office Assassin 2024"
                    required
                  />
                </div>

                {/* Elimination Method */}
                <div className="space-y-2">
                  <Label htmlFor="eliminationMethod">Elimination Method *</Label>
                  <Textarea
                    id="eliminationMethod"
                    value={formData.eliminationMethod}
                    onChange={(e) => handleInputChange('eliminationMethod', e.target.value)}
                    placeholder="Describe how players eliminate their targets..."
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep it safe and non-violent. Examples: "Tag your target and say their kill word" or "Send a photo of you next to your target"
                  </p>
                </div>

                {/* Safe Zones */}
                <div className="space-y-2">
                  <Label htmlFor="safeZones">Safe Zones</Label>
                  <Textarea
                    id="safeZones"
                    value={formData.safeZones}
                    onChange={(e) => handleInputChange('safeZones', e.target.value)}
                    placeholder="e.g., Workplaces, homes, churches, hospitals"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Places where players cannot be eliminated
                  </p>
                </div>

                {/* Safe Times */}
                <div className="space-y-2">
                  <Label htmlFor="safeTimes">Safe Times</Label>
                  <Textarea
                    id="safeTimes"
                    value={formData.safeTimes}
                    onChange={(e) => handleInputChange('safeTimes', e.target.value)}
                    placeholder="e.g., Weekends 6 PM - 10 AM, Work hours"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Times when players cannot be eliminated
                  </p>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="durationHours">Game Duration</Label>
                  <Select
                    value={formData.durationHours}
                    onValueChange={(value) => handleInputChange('durationHours', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration (optional)" />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No time limit</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours (1 day)</SelectItem>
                    <SelectItem value="48">48 hours (2 days)</SelectItem>
                    <SelectItem value="72">72 hours (3 days)</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                    <SelectItem value="336">2 weeks</SelectItem>
                  </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Optional: Set a time limit for the game
                  </p>
                </div>
              </div>

              {/* Players Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Players ({selectedPlayers.length})</h3>
                </div>

                {/* Saved Players */}
                {savedPlayers.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Your Saved Players</Label>
                    <div className="flex flex-wrap gap-2">
                      {savedPlayers.map((savedPlayer) => (
                        <Button
                          key={savedPlayer.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSavedPlayerToGame(savedPlayer)}
                          className="gap-2"
                        >
                          <Users className="w-3 h-3" />
                          {savedPlayer.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Player */}
                <div className="space-y-3">
                  {showAddPlayer ? (
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Add New Player</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddPlayer(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="playerName">Name *</Label>
                            <Input
                              id="playerName"
                              value={newPlayer.name}
                              onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Player name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="playerEmail">Email</Label>
                            <Input
                              id="playerEmail"
                              type="email"
                              value={newPlayer.email}
                              onChange={(e) => setNewPlayer(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="player@example.com"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="savePlayer"
                            checked={newPlayer.saveForFuture}
                            onCheckedChange={(checked) =>
                              setNewPlayer(prev => ({ ...prev, saveForFuture: !!checked }))
                            }
                          />
                          <Label htmlFor="savePlayer" className="text-sm">
                            Save this player for future games
                          </Label>
                        </div>

                        <Button type="button" onClick={addNewPlayer} className="w-full">
                          Add Player
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddPlayer(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Player
                    </Button>
                  )}
                </div>

                {/* Selected Players */}
                {selectedPlayers.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Selected Players</Label>
                    <div className="space-y-2">
                      {selectedPlayers.map((player, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-muted-foreground">{player.email || 'No email'}</p>
                            </div>
                            {player.saveForFuture && (
                              <Badge variant="secondary" className="text-xs">
                                Will save
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlayer(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name.trim() || selectedPlayers.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Game'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}