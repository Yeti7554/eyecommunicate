import { useState, useEffect } from 'react';
import { useWebGazer, getCoordinateFlipping, setCoordinateFlipping } from '@/hooks/useWebGazer';
import { useDwellSelection, getDwellTime, setDwellTime } from '@/hooks/useDwellSelection';
import { SelectionZone } from './SelectionZone';
import { NeutralZone } from './NeutralZone';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';
import { MobileEyeTrackingInterface } from './MobileEyeTrackingInterface';

const NEUTRAL_ZONE_WIDTH_PERCENT = 0.5;

export function EyeTrackingInterface() {
  const [selectionsPaused, setSelectionsPaused] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const { gazeState, isInitialized, isLoading, error, gazePosition, eyePositions } = useWebGazer();
  const { selectionState, selectedOption, dwellProgress, currentZone } = useDwellSelection(gazeState, selectionsPaused);

  // Auto-detect mobile mode based on device and orientation
  useEffect(() => {
    const checkMobileMode = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 1024; // Allow tablets in portrait
      const isMobile = isMobileDevice || (isSmallScreen && window.innerHeight > window.innerWidth); // Portrait mode on small screens

      setIsMobileMode(isMobile);
    };

    checkMobileMode();
    window.addEventListener('resize', checkMobileMode);
    window.addEventListener('orientationchange', checkMobileMode);
    return () => {
      window.removeEventListener('resize', checkMobileMode);
      window.removeEventListener('orientationchange', checkMobileMode);
    };
  }, []);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  const isYesActive = gazeState === 'LOOKING_AT_YES' && selectionState === 'dwelling';
  const isNoActive = gazeState === 'LOOKING_AT_NO' && selectionState === 'dwelling';
  const isYesSelected = selectedOption === 'YES';
  const isNoSelected = selectedOption === 'NO';

  // Render mobile or desktop version based on screen size/device
  if (isMobileMode) {
    return <MobileEyeTrackingInterface />;
  }

  return (
    <div className="fixed inset-0 flex flex-row overflow-hidden select-none cursor-none">

      {/* Mirror Toggle Button - Prominent and Clear */}
      <div className="absolute top-4 right-64 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg z-40 shadow-lg border-2 border-red-400">
        <div className="text-center">
          <button
            onClick={() => {
              const current = getCoordinateFlipping();
              setCoordinateFlipping(!current.x, current.y);
            }}
            className="font-bold text-sm block w-full"
          >
            🔄 MIRROR CAMERA
          </button>
          <div className="text-xs mt-1 opacity-90">
            Status: {getCoordinateFlipping().x ? 'FLIPPED (Default)' : 'NORMAL'}
          </div>
          <div className="text-xs opacity-75">
            Click if eye tracking is reversed
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg z-40 text-sm max-w-xs">
        <div className="font-bold mb-1">Eye Tracking Debug</div>
        <div>Status: {isInitialized ? 'Active' : 'Initializing'}</div>
        <div>Zone: {currentZone}</div>
        <div>State: {gazeState}</div>
        {gazePosition && (
          <div>Gaze: ({Math.round(gazePosition.x)}, {Math.round(gazePosition.y)})</div>
        )}
        <div className="mt-1 text-xs text-gray-300">
          Mode: Desktop | Calibration: X-flip={getCoordinateFlipping().x ? 'ON' : 'OFF'}
          <br />
          Selections: {selectionsPaused ? 'PAUSED' : 'ACTIVE'} | Sensitivity: {getDwellTime()}ms
        </div>
        <button
          onClick={() => setSelectionsPaused(!selectionsPaused)}
          className={`mt-2 mr-1 px-2 py-1 rounded text-xs ${selectionsPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {selectionsPaused ? 'Resume Selections' : 'Pause Selections'}
        </button>
        <button
          onClick={() => {
            const current = getCoordinateFlipping();
            setCoordinateFlipping(!current.x, current.y);
          }}
          className="mt-2 mr-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          Toggle Mirror
        </button>
        <button
          onClick={() => {
            // Test speech synthesis with clear message
            try {
              const utterance = new SpeechSynthesisUtterance('Voice test successful');
              utterance.volume = 1;
              utterance.rate = 1;
              window.speechSynthesis.speak(utterance);
              console.log('🎤 Voice test triggered');
            } catch (error) {
              console.error('❌ Voice test failed:', error);
            }
          }}
          className="mt-2 mr-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
        >
          Test Voice
        </button>
        <button
          onClick={() => setIsMobileMode(!isMobileMode)}
          className={`mt-2 mr-1 px-2 py-1 rounded text-xs ${isMobileMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isMobileMode ? 'Desktop Mode' : 'Mobile Mode'}
        </button>

        {/* Sensitivity Slider */}
        <div className="mt-2">
          <div className="text-xs text-gray-300 mb-1">Sensitivity (Dwell Time)</div>
          <input
            type="range"
            min="200"
            max="5000"
            step="100"
            value={getDwellTime()}
            onChange={(e) => setDwellTime(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Fast (200ms)</span>
            <span>Slow (5000ms)</span>
          </div>
        </div>
      </div>

      {/* Gaze Direction Indicator (MAIN MARKER - where eyes are looking) */}
      {gazePosition && (
        <div
          className="fixed w-12 h-12 bg-red-500 rounded-full border-4 border-white shadow-2xl pointer-events-none z-50 animate-ping"
          style={{
            left: `${gazePosition.x}px`,
            top: `${gazePosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
          title="GAZE MARKER - This follows your eye gaze"
        />
      )}
      {/* Secondary steady marker for precise position */}
      {gazePosition && (
        <div
          className="fixed w-6 h-6 bg-red-600 rounded-full border-2 border-yellow-300 shadow-lg pointer-events-none z-50"
          style={{
            left: `${gazePosition.x}px`,
            top: `${gazePosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}


      {/* NO Zone (Left) - Swapped for correct eye tracking */}
      <SelectionZone
        type="NO"
        isActive={isNoActive}
        dwellProgress={isNoActive ? dwellProgress : 0}
        isSelected={isNoSelected}
      />

      {/* Neutral Zone (Center) */}
      <NeutralZone widthPercent={NEUTRAL_ZONE_WIDTH_PERCENT} />

      {/* YES Zone (Right) - Swapped for correct eye tracking */}
      <SelectionZone
        type="YES"
        isActive={isYesActive}
        dwellProgress={isYesActive ? dwellProgress : 0}
        isSelected={isYesSelected}
      />
    </div>
  );
}
