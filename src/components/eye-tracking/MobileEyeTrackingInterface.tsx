import { useState, useEffect } from 'react';
import { useWebGazer, getCoordinateFlipping, setCoordinateFlipping } from '@/hooks/useWebGazer';
import { useDwellSelection, getDwellTime, setDwellTime } from '@/hooks/useDwellSelection';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';

export function MobileEyeTrackingInterface() {
  // ALL HOOKS MUST BE CALLED FIRST (before any conditional returns)
  const [selectionsPaused, setSelectionsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isLandscapeLeft, setIsLandscapeLeft] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const { gazeState, isInitialized, isLoading, error, gazePosition, eyePositions } = useWebGazer();
  const { selectionState, selectedOption, dwellProgress, currentZone } = useDwellSelection(gazeState, selectionsPaused, voiceEnabled);

  // Debug: Log gazePosition changes for iOS Chrome debugging (throttled)
  useEffect(() => {
    if (!gazePosition) return;
    
    // Throttle logging to avoid console spam
    const timeoutId = setTimeout(() => {
      console.log(`📱 Mobile: Gaze (${gazePosition.x.toFixed(0)}, ${gazePosition.y.toFixed(0)}) | ${gazeState} | ${currentZone}`);
    }, 500); // Log max once per 500ms
    
    return () => clearTimeout(timeoutId);
  }, [gazePosition?.x, gazePosition?.y, gazeState, currentZone]);

  // Detect iOS devices
  useEffect(() => {
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iosDevice);
  }, []);

  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      const orientation = window.screen?.orientation?.type ||
                         (window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary');
      const isLandscape = orientation.includes('landscape');
      const isLeftOriented = orientation === 'landscape-primary'; // Camera on left
      setIsLandscapeLeft(isLandscape && isLeftOriented);
    };

    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // NOW handle error/loading states AFTER all hooks
  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  // Render different layouts based on orientation
  if (isLandscapeLeft) {
    // Landscape mode with camera on left - debug panel at bottom
    return (
      <div className="fixed inset-0 flex flex-col bg-black overflow-hidden select-none cursor-none">
        {/* Main Content Area - Landscape */}
        <div className="flex-1 flex flex-row">
          {/* NO Zone (Left) - Landscape */}
          <div className="flex-1 bg-red-600 hover:bg-red-500 transition-colors duration-200 flex items-center justify-center relative">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">NO</div>

            {/* Selection Indicator */}
            {selectedOption === 'NO' && (
              <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                <div className="text-2xl sm:text-3xl font-bold text-white animate-pulse">✗</div>
              </div>
            )}

            {/* Dwell Progress Ring */}
            {gazeState === 'LOOKING_AT_NO' && selectionState === 'dwelling' && dwellProgress > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-20 h-20 sm:w-24 sm:h-24" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${dwellProgress * 283} 283`}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-100"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Neutral Zone - Thin Middle */}
          <div className="w-1 bg-gray-500"></div>

          {/* YES Zone (Right) - Landscape */}
          <div className="flex-1 bg-green-600 hover:bg-green-500 transition-colors duration-200 flex items-center justify-center relative">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">YES</div>

            {/* Selection Indicator */}
            {selectedOption === 'YES' && (
              <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                <div className="text-2xl sm:text-3xl font-bold text-white animate-pulse">✓</div>
              </div>
            )}

            {/* Dwell Progress Ring */}
            {gazeState === 'LOOKING_AT_YES' && selectionState === 'dwelling' && dwellProgress > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-20 h-20 sm:w-24 sm:h-24" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${dwellProgress * 283} 283`}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-100"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Debug Panel - Bottom (Landscape) */}
        <div className="h-20 bg-gray-900 p-2 text-white text-xs border-t border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-sm font-bold">Mobile Eye Tracking - Landscape</div>
              {isIOS && (
                <div className="text-yellow-400 text-xs">
                  ⚠️ iOS Safari has limited eye tracking support
                </div>
              )}
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              <span>Status: {isInitialized ? 'Active' : 'Init'}</span>
              <span>Zone: {currentZone}</span>
              <span>Mode: {selectionsPaused ? 'PAUSED' : 'ACTIVE'}</span>
              <span>Sens: {getDwellTime()}ms</span>
              {gazePosition && (
                <span>Gaze: ({Math.round(gazePosition.x)}, {Math.round(gazePosition.y)})</span>
              )}
              {!gazePosition && isInitialized && (
                <span className="text-yellow-400">⚠️ No gaze data</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-center mb-2">
            <button
              onClick={() => setSelectionsPaused(!selectionsPaused)}
              className={`px-2 py-1 rounded text-xs ${selectionsPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {selectionsPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`px-2 py-1 rounded text-xs ${voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              Voice: {voiceEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setDwellTime(Math.max(200, getDwellTime() - 500))}
              className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
            >
              -500ms
            </button>
            <button
              onClick={() => setDwellTime(Math.min(5000, getDwellTime() + 500))}
              className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
            >
              +500ms
            </button>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                const current = getCoordinateFlipping();
                setCoordinateFlipping(!current.x, current.y);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Mirror
            </button>
            <button
              onClick={() => {
                try {
                  const utterance = new SpeechSynthesisUtterance('Voice test');
                  utterance.volume = 1;
                  window.speechSynthesis.speak(utterance);
                } catch (error) {
                  console.error('Voice test failed:', error);
                }
              }}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
            >
              Test Voice
            </button>
          </div>
        </div>

        {/* Mobile Gaze Indicator - More Visible */}
        {gazePosition && (
          <>
            {/* Main gaze indicator */}
            <div
              className="fixed w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-2xl pointer-events-none"
              style={{
                left: `${gazePosition.x}px`,
                top: `${gazePosition.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                animation: 'pulse 1s infinite',
              }}
            />
            {/* Secondary indicator for better visibility */}
            <div
              className="fixed w-12 h-12 border-4 border-red-500 rounded-full pointer-events-none opacity-50"
              style={{
                left: `${gazePosition.x}px`,
                top: `${gazePosition.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 9998,
              }}
            />
            {/* Debug text */}
            <div
              className="fixed bg-black text-white text-xs px-2 py-1 rounded pointer-events-none"
              style={{
                left: `${gazePosition.x + 20}px`,
                top: `${gazePosition.y - 20}px`,
                zIndex: 10000,
                fontSize: '10px',
              }}
            >
              {Math.round(gazePosition.x)}, {Math.round(gazePosition.y)}
            </div>
          </>
        )}
      </div>
    );
  }

  // Note: Removed iOS fallback check - allow eye tracking to work on iOS Chrome
  // The loading/error screens will handle initialization issues

  // Portrait mode (default) - debug panel on left
  return (
    <div className="fixed inset-0 flex flex-row bg-black overflow-hidden select-none cursor-none">
      {/* Mobile Debug Panel - Left Side */}
      <div className="w-32 bg-gray-900 flex flex-col justify-center items-center p-2 text-white text-xs border-r border-gray-700 z-30">
        <div className="text-center mb-4 transform -rotate-90 whitespace-nowrap">
          Mobile Eye Tracking
          {isIOS && (
            <div className="text-yellow-400 text-xs mt-2 transform rotate-90">
              ⚠️ iOS Limited
            </div>
          )}
        </div>

        <div className="space-y-2 transform -rotate-90">
          <div>Status: {isInitialized ? 'Active' : 'Init'}</div>
          <div>Zone: {currentZone}</div>
          <div>Mode: {selectionsPaused ? 'PAUSED' : 'ACTIVE'}</div>
          <div className="text-xs">Sens: {getDwellTime()}ms</div>
          {gazePosition ? (
            <div className="text-xs">Gaze: ({Math.round(gazePosition.x)}, {Math.round(gazePosition.y)})</div>
          ) : (
            <div className="text-yellow-400 text-xs">⚠️ No gaze</div>
          )}
          {isIOS && <div className="text-yellow-400 text-xs">iOS Mode</div>}
        </div>

        <div className="space-y-1 mt-4 transform -rotate-90">
          <button
            onClick={() => setSelectionsPaused(!selectionsPaused)}
            className={`px-2 py-1 rounded text-xs w-full ${selectionsPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {selectionsPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => {
              const current = getCoordinateFlipping();
              setCoordinateFlipping(!current.x, current.y);
            }}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs w-full"
          >
            Mirror
          </button>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-2 py-1 rounded text-xs w-full ${voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            Voice: {voiceEnabled ? 'ON' : 'OFF'}
          </button>
          <div className="flex gap-1 w-full">
            <button
              onClick={() => setDwellTime(Math.max(200, getDwellTime() - 200))}
              className="px-1 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs flex-1"
            >
              -200ms
            </button>
            <button
              onClick={() => setDwellTime(Math.min(5000, getDwellTime() + 200))}
              className="px-1 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs flex-1"
            >
              +200ms
            </button>
          </div>
          <button
            onClick={() => {
              try {
                const utterance = new SpeechSynthesisUtterance('Voice test');
                utterance.volume = 1;
                window.speechSynthesis.speak(utterance);
              } catch (error) {
                console.error('Voice test failed:', error);
              }
            }}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs w-full"
          >
            Test Voice
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* NO Zone (Top) - Mobile Vertical with sideways text */}
        <div className="flex-1 bg-red-600 hover:bg-red-500 transition-colors duration-200 flex items-center justify-center relative">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">NO</div>

          {/* Selection Indicator */}
          {selectedOption === 'NO' && (
            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
              <div className="text-3xl sm:text-4xl font-bold text-white animate-pulse">✗</div>
            </div>
          )}

          {/* Dwell Progress Ring */}
          {gazeState === 'LOOKING_AT_NO' && selectionState === 'dwelling' && dwellProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                <circle
                  cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${dwellProgress * 283} 283`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-100"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Neutral Zone - Thin Middle */}
        <div className="h-2 bg-gray-500"></div>

        {/* YES Zone (Bottom) - Mobile Vertical */}
        <div className="flex-1 bg-green-600 hover:bg-green-500 transition-colors duration-200 flex items-center justify-center relative">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">YES</div>

          {/* Selection Indicator */}
          {selectedOption === 'YES' && (
            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
              <div className="text-3xl sm:text-4xl font-bold text-white animate-pulse">✓</div>
            </div>
          )}

          {/* Dwell Progress Ring */}
          {gazeState === 'LOOKING_AT_YES' && selectionState === 'dwelling' && dwellProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                <circle
                  cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${dwellProgress * 283} 283`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-100"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Gaze Indicator */}
      {gazePosition && (
        <div
          className="fixed w-8 h-8 bg-yellow-400 rounded-full border-3 border-white shadow-xl pointer-events-none z-50 animate-ping"
          style={{
            left: `${gazePosition.x}px`,
            top: `${gazePosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
}