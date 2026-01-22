import { useState, useEffect } from 'react';
import { useWebGazer, getCoordinateFlipping, setCoordinateFlipping } from '@/hooks/useWebGazer';
import { useDwellSelection } from '@/hooks/useDwellSelection';

export function MobileEyeTrackingInterface() {
  const [selectionsPaused, setSelectionsPaused] = useState(false);
  const [isLandscapeLeft, setIsLandscapeLeft] = useState(false);
  const { gazeState, isInitialized, isLoading, error, gazePosition, eyePositions } = useWebGazer();
  const { selectionState, selectedOption, dwellProgress, currentZone } = useDwellSelection(gazeState, selectionsPaused);

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
            <div className="text-sm font-bold">Mobile Eye Tracking - Landscape</div>
            <div className="flex gap-2 text-xs">
              <span>Status: {isInitialized ? 'Active' : 'Init'}</span>
              <span>Zone: {currentZone}</span>
              <span>Mode: {selectionsPaused ? 'PAUSED' : 'ACTIVE'}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setSelectionsPaused(!selectionsPaused)}
              className={`px-3 py-1 rounded text-xs ${selectionsPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {selectionsPaused ? 'Resume' : 'Pause'}
            </button>
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
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            >
              Test Voice
            </button>
          </div>
        </div>

        {/* Mobile Gaze Indicator */}
        {gazePosition && (
          <div
            className="fixed w-6 h-6 bg-yellow-400 rounded-full border-3 border-white shadow-xl pointer-events-none z-50 animate-pulse"
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

  // Portrait mode (default) - debug panel on left
  return (
    <div className="fixed inset-0 flex flex-row bg-black overflow-hidden select-none cursor-none">
      {/* Mobile Debug Panel - Left Side */}
      <div className="w-32 bg-gray-900 flex flex-col justify-center items-center p-2 text-white text-xs border-r border-gray-700 z-30">
        <div className="text-center mb-4 transform -rotate-90 whitespace-nowrap">
          Mobile Eye Tracking
        </div>

        <div className="space-y-2 transform -rotate-90">
          <div>Status: {isInitialized ? 'Active' : 'Init'}</div>
          <div>Zone: {currentZone}</div>
          <div>Mode: {selectionsPaused ? 'PAUSED' : 'ACTIVE'}</div>
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
            onClick={() => {
              try {
                const utterance = new SpeechSynthesisUtterance('Voice test');
                utterance.volume = 1;
                window.speechSynthesis.speak(utterance);
              } catch (error) {
                console.error('Voice test failed:', error);
              }
            }}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs w-full"
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