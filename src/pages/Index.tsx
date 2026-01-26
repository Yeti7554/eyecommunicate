import { useState } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useAuth } from '@/hooks/useAuth';
import { StartScreen } from '@/components/eye-tracking/StartScreen';
import { EyeTrackingInterface } from '@/components/eye-tracking/EyeTrackingInterface';
import { AuthScreen } from '@/components/auth/AuthScreen';

export default function Index() {
  const [hasStarted, setHasStarted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { enterFullscreen } = useFullscreen();
  const { user } = useAuth();

  const handleStart = async () => {
    // If not signed in, show auth screen first
    if (!user) {
      setShowAuth(true);
      return;
    }
    await enterFullscreen();
    setHasStarted(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    await enterFullscreen();
    setHasStarted(true);
  };

  // Show auth screen if user clicked start but isn't logged in
  if (showAuth && !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  return <EyeTrackingInterface />;
}
