import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Crosshair, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AuthScreenProps {
  onSignIn: (email: string) => Promise<{ error: Error | null }>;
}

export function AuthScreen({ onSignIn }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const { error } = await onSignIn(email);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary mb-4 pulse-danger"
          >
            <Crosshair className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">Assassin</h1>
          <p className="text-muted-foreground mt-2">The hunt begins</p>
        </motion.div>

        {!emailSent ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-card border-border"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Sending...' : 'Sign in with Email'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We'll send you a magic link to sign in
            </p>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center border-2 border-success">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Check your email</h2>
              <p className="text-muted-foreground mt-2">
                We sent a magic link to <span className="text-foreground">{email}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="border-border"
            >
              Try a different email
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
