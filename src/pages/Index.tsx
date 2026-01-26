import { useState, useEffect } from 'react';
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

  // If user signs in via magic link (page reload), check and proceed
  useEffect(() => {
    if (showAuth && user) {
      handleAuthSuccess();
    }
  }, [user, showAuth]);

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
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onBack={() => setShowAuth(false)} />;
  }

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  return <EyeTrackingInterface />;
}
