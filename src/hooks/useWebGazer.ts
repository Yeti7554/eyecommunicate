import { useEffect, useState, useRef, useCallback } from 'react';

export type GazeState = 'LOOKING_AT_YES' | 'LOOKING_AT_NO' | 'LOOKING_AT_NEITHER';

interface GazeData {
  x: number;
  y: number;
  confidence?: number;
}

interface EyeData {
  x: number;
  y: number;
}

interface UseWebGazerReturn {
  gazeState: GazeState;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  gazePosition: GazeData | null;
  eyePositions: { left: EyeData | null; right: EyeData | null };
}

// Configuration constants
const SMOOTHING_WINDOW = 1; // No smoothing for maximum sensitivity
const NEUTRAL_ZONE_WIDTH = 0.005; // 0.5% neutral zone - ultra-sensitive
const MIN_CONFIDENCE = 0.01; // Maximum sensitivity - almost no filtering

// Runtime coordinate system calibration
let flipXCoordinates = false; // Flip X axis (left/right inversion fix) - DISABLED for centering test
let flipYCoordinates = false; // Flip Y axis if needed (up/down inversion)

// Exported functions for runtime control
export const getCoordinateFlipping = () => ({ x: flipXCoordinates, y: flipYCoordinates });
export const setCoordinateFlipping = (x: boolean, y: boolean) => {
  flipXCoordinates = x;
  flipYCoordinates = y;
  console.log(`Coordinate flipping updated: X=${x}, Y=${y}`);
};

export function useWebGazer(): UseWebGazerReturn {
  const [gazeState, setGazeState] = useState<GazeState>('LOOKING_AT_NEITHER');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gazePosition, setGazePosition] = useState<GazeData | null>(null);
  const [eyePositions, setEyePositions] = useState<{ left: EyeData | null; right: EyeData | null }>({
    left: null,
    right: null
  });

  const gazeHistoryRef = useRef<GazeData[]>([]);
  const webgazerRef = useRef<any>(null);

  const calculateSmoothedGaze = useCallback((newGaze: GazeData): GazeData => {
    gazeHistoryRef.current.push(newGaze);

    if (gazeHistoryRef.current.length > SMOOTHING_WINDOW) {
      gazeHistoryRef.current.shift();
    }

    const sumX = gazeHistoryRef.current.reduce((acc, g) => acc + g.x, 0);
    const sumY = gazeHistoryRef.current.reduce((acc, g) => acc + g.y, 0);

    const smoothedX = sumX / gazeHistoryRef.current.length;
    const smoothedY = sumY / gazeHistoryRef.current.length;

    return {
      x: smoothedX,
      y: smoothedY,
    };
  }, []);

  const determineGazeState = useCallback((x: number): GazeState => {
    const screenWidth = window.innerWidth;
    const neutralStart = screenWidth * (0.5 - NEUTRAL_ZONE_WIDTH / 2);
    const neutralEnd = screenWidth * (0.5 + NEUTRAL_ZONE_WIDTH / 2);

    if (x < neutralStart) {
      return 'LOOKING_AT_NO';  // Swapped: left side is now NO
    } else if (x > neutralEnd) {
      return 'LOOKING_AT_YES'; // Swapped: right side is now YES
    } else {
      return 'LOOKING_AT_NEITHER';
    }
  }, []);

  // Add keyboard shortcuts for testing
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'm' || event.key === 'M') {
        // Toggle X coordinate flipping (Mirror)
        const current = { x: flipXCoordinates, y: flipYCoordinates };
        setCoordinateFlipping(!current.x, current.y);
        console.log(`Mirror toggle: ${!current.x ? 'ON' : 'OFF'}`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initWebGazer = async () => {
      try {
        setIsLoading(true);

        // Check for iOS Safari compatibility issues
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIOSSafari = isIOS && isSafari;

        if (isIOSSafari) {
          console.warn('iOS Safari detected - WebGazer may have limited functionality');
          // WebGazer has known issues on iOS Safari, but we'll still try
        }

        // Dynamically import webgazer
        const webgazer = await import('webgazer');
        webgazerRef.current = webgazer.default;
        
        // Configure webgazer for accurate pupil-based eye tracking
        webgazerRef.current
          .setRegression('ridge')  // Ridge regression for better accuracy
          .showVideoPreview(false)  // Hide camera feed for clean interface
          .showPredictionPoints(false)  // Hide prediction points for clean interface
          .showFaceOverlay(false)  // Hide face overlay for cleaner UI
          .showFaceFeedbackBox(false)  // Hide feedback box
          .setTracker('TFFacemesh');  // Use TensorFlow face mesh for pupil tracking

        // iOS Safari specific optimizations
        if (isIOSSafari) {
          console.log('Applying iOS Safari optimizations...');
          // WebGazer may need different settings for iOS
          webgazerRef.current
            .setRegression('weightedRidge')  // Alternative regression for iOS
            .setTracker('clmtrackr');  // Alternative tracker that may work better on iOS
        }

        webgazerRef.current.setGazeListener(null); // Clear any existing listener first
        
        // Set gaze listener
        webgazerRef.current.setGazeListener((data: any, clock: any) => {
          if (!mounted || !data) return;

          // Reliable gaze tracking with proper coordinate handling
          console.log('Raw WebGazer data:', data);

          // Handle WebGazer data formats reliably
          let gazeX, gazeY, confidence;

          if (typeof data === 'object' && data.x !== undefined && data.y !== undefined) {
            // Standard WebGazer format
            gazeX = data.x;
            gazeY = data.y;
            confidence = data.confidence;
            console.log(`Raw WebGazer coords: x=${gazeX.toFixed(3)}, y=${gazeY.toFixed(3)}`);
          } else if (Array.isArray(data) && data.length >= 2) {
            // Array format [x, y]
            [gazeX, gazeY] = data;
            console.log('Using array format');
          } else {
            console.log('Invalid data format');
            return;
          }

          // Handle coordinate conversion - WebGazer might return different formats
          let screenX, screenY;

          // Get viewport dimensions once
          const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
          const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

          // Handle coordinate conversion based on format
          if (gazeX > 10 || gazeY > 10) {
            // Already pixel coordinates - use directly but ensure within viewport bounds
            screenX = Math.max(0, Math.min(viewportWidth, gazeX));
            screenY = Math.max(0, Math.min(viewportHeight, gazeY));
            console.log('Detected pixel coordinates - using directly');
          } else {
            // Normalized coordinates (0-1) - convert to screen pixels
            const clampedX = Math.max(0, Math.min(1, gazeX));
            const clampedY = Math.max(0, Math.min(1, gazeY));

            screenX = clampedX * viewportWidth;
            screenY = clampedY * viewportHeight;
            console.log(`Detected normalized coordinates - converting to pixels (${viewportWidth}x${viewportHeight})`);
          }

          // Apply coordinate calibration (flip axes if needed for camera mirroring)
          if (flipXCoordinates) screenX = viewportWidth - screenX;
          if (flipYCoordinates) screenY = viewportHeight - screenY;

          // Show final results
          console.log(`Final: Screen coords (${screenX.toFixed(1)}, ${screenY.toFixed(1)}) | Viewport: ${viewportWidth}x${viewportHeight}`);

          const gazeData: GazeData = {
            x: screenX,
            y: screenY,
            confidence: confidence
          };

          // Filter out low-confidence predictions
          if (gazeData.confidence !== undefined && gazeData.confidence < MIN_CONFIDENCE) {
            console.log('Low confidence, skipping');
            return;
          }

          const smoothedGaze = calculateSmoothedGaze(gazeData);
          setGazePosition(smoothedGaze);

          const newGazeState = determineGazeState(smoothedGaze.x);
          setGazeState(newGazeState);

          // Keep eye positions null for now to focus on basic tracking
          setEyePositions({ left: null, right: null });
        });
        
        // Start webgazer
        await webgazerRef.current.begin();
        
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize eye tracking';
          
          if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowed')) {
            setError('Camera access required. Please allow camera access and refresh the page.');
          } else {
            setError(errorMessage);
          }
          
          setIsLoading(false);
        }
      }
    };

    initWebGazer();

    return () => {
      mounted = false;
      if (webgazerRef.current) {
        try {
          webgazerRef.current.end();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [calculateSmoothedGaze, determineGazeState]);

  return {
    gazeState,
    isInitialized,
    isLoading,
    error,
    gazePosition,
    eyePositions,
  };
}
