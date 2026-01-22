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
const SMOOTHING_WINDOW = 1; // Maximum responsiveness - no smoothing
const NEUTRAL_ZONE_WIDTH = 0.02; // 2% neutral zone - minimal black bars
const MIN_CONFIDENCE = 0.05; // Maximum sensitivity

// Runtime coordinate system calibration
let flipXCoordinates = true; // Flip X axis (left/right inversion fix) - ON by default
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
        
        // Dynamically import webgazer
        const webgazer = await import('webgazer');
        webgazerRef.current = webgazer.default;
        
        // Configure webgazer for accurate pupil-based eye tracking
        webgazerRef.current
          .setRegression('ridge')  // Ridge regression for better accuracy
          .showVideoPreview(true)  // Show camera feed
          .showPredictionPoints(true)  // Show gaze prediction points
          .showFaceOverlay(false)  // Hide face overlay for cleaner UI
          .showFaceFeedbackBox(false)  // Hide feedback box
          .setTracker('TFFacemesh')  // Use TensorFlow face mesh for pupil tracking
          .setGazeListener(null); // Clear any existing listener first
        
        // Set gaze listener
        webgazerRef.current.setGazeListener((data: any, clock: any) => {
          if (!mounted || !data) return;

          // Debug logging to see what WebGazer returns
          console.log('Raw WebGazer data:', data);
          console.log('Window size:', window.innerWidth, 'x', window.innerHeight);

          // Handle different WebGazer data formats
          let gazeX, gazeY, confidence;

          if (typeof data === 'object' && data.x !== undefined && data.y !== undefined) {
            gazeX = data.x;
            gazeY = data.y;
            confidence = data.confidence;
          } else if (Array.isArray(data) && data.length >= 2) {
            [gazeX, gazeY] = data;
          } else {
            return; // Invalid data format
          }

          // WebGazer returns normalized coordinates (0-1) representing gaze position on screen
          // Convert to screen pixel coordinates
          let screenX = gazeX * window.innerWidth;
          let screenY = gazeY * window.innerHeight;

          // Apply coordinate calibration (flip axes if needed for camera mirroring)
          if (flipXCoordinates) screenX = window.innerWidth - screenX;
          if (flipYCoordinates) screenY = window.innerHeight - screenY;

          console.log(`Gaze: (${gazeX.toFixed(3)}, ${gazeY.toFixed(3)}) → Screen: (${screenX.toFixed(1)}, ${screenY.toFixed(1)})`);

          const gazeData: GazeData = {
            x: screenX,
            y: screenY,
            confidence: confidence
          };

          // Filter out low-confidence predictions
          if (gazeData.confidence !== undefined && gazeData.confidence < MIN_CONFIDENCE) {
            return;
          }

          const smoothedGaze = calculateSmoothedGaze(gazeData);
          setGazePosition(smoothedGaze);

          const newGazeState = determineGazeState(smoothedGaze.x);
          setGazeState(newGazeState);

          // Temporarily disable eye position tracking to focus on gaze
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
