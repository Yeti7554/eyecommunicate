import { useState } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useAuth } from '@/hooks/useAuth';
import { StartScreen } from '@/components/eye-tracking/StartScreen';
import { EyeTrackingInterface } from '@/components/eye-tracking/EyeTrackingInterface';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const [hasStarted, setHasStarted] = useState(false);
  const { enterFullscreen } = useFullscreen();
  const { user, loading } = useAuth();

  const handleStart = async () => {
    await enterFullscreen();
    setHasStarted(true);
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  return <EyeTrackingInterface />;
}
