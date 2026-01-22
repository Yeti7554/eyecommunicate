import { useState } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { StartScreen } from '@/components/eye-tracking/StartScreen';
import { EyeTrackingInterface } from '@/components/eye-tracking/EyeTrackingInterface';

export default function Index() {
  const [hasStarted, setHasStarted] = useState(false);
  const { enterFullscreen } = useFullscreen();

  const handleStart = async () => {
    await enterFullscreen();
    setHasStarted(true);
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  return <EyeTrackingInterface />;
}