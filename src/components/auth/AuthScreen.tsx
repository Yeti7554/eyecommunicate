import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Crosshair, Loader2, Phone, Chrome, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AuthScreenProps {
  onSignInEmail: (email: string) => Promise<{ error: Error | null }>;
  onSignInPhone: (phone: string) => Promise<{ error: Error | null }>;
  onSignInGoogle: () => Promise<{ error: Error | null }>;
  onSignInApple: () => Promise<{ error: Error | null }>;
}

export function AuthScreen({
  onSignInEmail,
  onSignInPhone,
  onSignInGoogle,
  onSignInApple
}: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const { error } = await onSignInEmail(email);
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsLoading(true);
    const { error } = await onSignInPhone(phone);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPhoneSent(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await onSignInGoogle();
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    const { error } = await onSignInApple();
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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

        {!emailSent && !phoneSent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                </form>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="bg-card border-border"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!phone.trim() || isLoading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Phone className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Sending...' : 'Sign in with Phone'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    We'll send you a verification code via SMS
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="border-border"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAppleSignIn}
                  disabled={isLoading}
                  className="border-border"
                >
                  <Apple className="w-4 h-4 mr-2" />
                  Apple
                </Button>
              </div>
            </div>
          </motion.div>
        ) : emailSent ? (
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
        ) : phoneSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center border-2 border-success">
              <Phone className="w-8 h-8 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Check your phone</h2>
              <p className="text-muted-foreground mt-2">
                We sent a verification code to <span className="text-foreground">{phone}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setPhoneSent(false)}
              className="border-border"
            >
              Try a different number
            </Button>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
