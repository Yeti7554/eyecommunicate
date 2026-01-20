import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Shield, Clock, ArrowRight, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateGameProps {
  onCreateGame: (data: {
    name: string;
    eliminationMethod: string;
    safeZones?: string;
    safeTimes?: string;
  }) => Promise<void>;
}

export function CreateGame({ onCreateGame }: CreateGameProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [eliminationMethod, setEliminationMethod] = useState('Tag your target with a sticker');
  const [safeZones, setSafeZones] = useState('');
  const [safeTimes, setSafeTimes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      await onCreateGame({
        name,
        eliminationMethod,
        safeZones: safeZones || undefined,
        safeTimes: safeTimes || undefined,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary mb-4"
        >
          <Crosshair className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground">Create Game</h1>
        <p className="text-muted-foreground mt-2">Set up the rules for your assassination game</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md space-y-6"
      >
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Game Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Office Assassin 2024"
                className="bg-card border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elimination" className="flex items-center gap-2 text-foreground">
                <Target className="w-4 h-4 text-primary" />
                Elimination Method
              </Label>
              <Textarea
                id="elimination"
                value={eliminationMethod}
                onChange={(e) => setEliminationMethod(e.target.value)}
                placeholder="How do players eliminate their targets?"
                className="bg-card border-border resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Must be non-violent. Examples: sticker, water gun, specific phrase
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!name.trim() || !eliminationMethod.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="safeZones" className="flex items-center gap-2 text-foreground">
                <Shield className="w-4 h-4 text-success" />
                Safe Zones (Optional)
              </Label>
              <Textarea
                id="safeZones"
                value={safeZones}
                onChange={(e) => setSafeZones(e.target.value)}
                placeholder="Where are players safe from elimination?"
                className="bg-card border-border resize-none"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Examples: Bathrooms, meetings, their own desk
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="safeTimes" className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-warning" />
                Safe Times (Optional)
              </Label>
              <Textarea
                id="safeTimes"
                value={safeTimes}
                onChange={(e) => setSafeTimes(e.target.value)}
                placeholder="When are players safe?"
                className="bg-card border-border resize-none"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Examples: Before 9am, during lunch, after 6pm
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 border-border"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isCreating ? 'Creating...' : 'Create Game'}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Progress indicator */}
      <div className="flex gap-2 mt-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
