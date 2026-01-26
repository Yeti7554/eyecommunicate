import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onBack?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'magic-link';

export function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { toast } = useToast();

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete sign up.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email for the sign-in link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="fixed inset-0 bg-[#1C1C1C] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6 max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-[hsl(142,76%,45%)]/20 flex items-center justify-center"
          >
            <Mail className="w-10 h-10 text-[hsl(142,76%,45%)]" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Check your email
          </h2>
          <p className="text-white/70 font-sans">
            We've sent a magic link to <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-white/50 text-sm font-sans">
            Click the link in the email to sign in instantly.
          </p>
          <button
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            className="mt-4 text-white/50 hover:text-white/80 transition-colors text-sm font-sans underline"
          >
            Use a different email
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1C1C1C] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 sm:gap-8 max-w-md w-full text-center px-4"
      >
        {/* Back button */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={onBack}
            className="absolute top-6 left-6 text-white/50 hover:text-white/80 transition-colors flex items-center gap-2 text-sm font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          style={{
            fontFamily: 'Georgia, serif',
            color: 'hsl(142, 76%, 45%)',
            textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          EyeCommunicate
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/70 font-sans text-sm sm:text-base"
        >
          {mode === 'magic-link'
            ? 'Sign in with a magic link sent to your email'
            : mode === 'signup'
            ? 'Create an account to get started'
            : 'Sign in to continue'}
        </motion.p>

        {/* Auth Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={mode === 'magic-link' ? handleMagicLink : handlePasswordAuth}
          className="w-full space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-white/80 font-sans text-sm">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[hsl(142,76%,45%)]/50 focus:ring-[hsl(142,76%,45%)]/20"
                required
              />
            </div>
          </div>

          {mode !== 'magic-link' && (
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-white/80 font-sans text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[hsl(142,76%,45%)]/50 focus:ring-[hsl(142,76%,45%)]/20"
                  minLength={6}
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-white/90 font-semibold tracking-wide uppercase text-xs py-5 rounded-full border-2 border-black"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : mode === 'magic-link' ? (
              <Sparkles className="w-4 h-4 mr-2" />
            ) : null}
            {mode === 'magic-link'
              ? 'Send Magic Link'
              : mode === 'signup'
              ? 'Sign Up'
              : 'Sign In'}
          </Button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1C1C1C] px-3 text-white/40 font-sans">or</span>
            </div>
          </div>

          {/* Magic Link Toggle */}
          {mode !== 'magic-link' ? (
            <button
              type="button"
              onClick={() => setMode('magic-link')}
              className="w-full py-3 px-4 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm font-sans flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Sign in with Magic Link
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="w-full py-3 px-4 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm font-sans flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Sign in with Password
            </button>
          )}
        </motion.form>

        {/* Toggle Sign In / Sign Up */}
        {mode !== 'magic-link' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-white/50 hover:text-white/80 transition-colors text-sm font-sans"
            >
              {mode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </motion.div>
        )}

        {/* How to Use Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link
            to="/how-to-use"
            className="text-white/40 hover:text-white/70 transition-colors text-xs sm:text-sm font-sans underline decoration-white/20 hover:decoration-white/50"
          >
            How to Use
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
