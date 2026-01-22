import { useEffect, useState, useRef, useCallback } from 'react';

export type GazeState = 'LOOKING_AT_YES' | 'LOOKING_AT_NO' | 'LOOKING_AT_NEITHER';

interface GazeData {
  x: number;
  y: number;
}

interface UseWebGazerReturn {
  gazeState: GazeState;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  gazePosition: GazeData | null;
}

// Configuration constants
const SMOOTHING_WINDOW = 10;
const NEUTRAL_ZONE_WIDTH = 0.15; // 15% of screen width

export function useWebGazer(): UseWebGazerReturn {
  const [gazeState, setGazeState] = useState<GazeState>('LOOKING_AT_NEITHER');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gazePosition, setGazePosition] = useState<GazeData | null>(null);
  
  const gazeHistoryRef = useRef<GazeData[]>([]);
  const webgazerRef = useRef<any>(null);

  const calculateSmoothedGaze = useCallback((newGaze: GazeData): GazeData => {
    gazeHistoryRef.current.push(newGaze);
    
    if (gazeHistoryRef.current.length > SMOOTHING_WINDOW) {
      gazeHistoryRef.current.shift();
    }
    
    const sumX = gazeHistoryRef.current.reduce((acc, g) => acc + g.x, 0);
    const sumY = gazeHistoryRef.current.reduce((acc, g) => acc + g.y, 0);
    
    return {
      x: sumX / gazeHistoryRef.current.length,
      y: sumY / gazeHistoryRef.current.length,
    };
  }, []);

  const determineGazeState = useCallback((x: number): GazeState => {
    const screenWidth = window.innerWidth;
    const neutralStart = screenWidth * (0.5 - NEUTRAL_ZONE_WIDTH / 2);
    const neutralEnd = screenWidth * (0.5 + NEUTRAL_ZONE_WIDTH / 2);
    
    if (x < neutralStart) {
      return 'LOOKING_AT_YES';
    } else if (x > neutralEnd) {
      return 'LOOKING_AT_NO';
    } else {
      return 'LOOKING_AT_NEITHER';
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initWebGazer = async () => {
      try {
        setIsLoading(true);
        
        // Dynamically import webgazer
        const webgazer = await import('webgazer');
        webgazerRef.current = webgazer.default;
        
        // Configure webgazer
        webgazerRef.current
          .setRegression('ridge')
          .showVideoPreview(false)
          .showPredictionPoints(false)
          .showFaceOverlay(false)
          .showFaceFeedbackBox(false);
        
        // Set gaze listener
        webgazerRef.current.setGazeListener((data: GazeData | null) => {
          if (!mounted || !data) return;
          
          const smoothedGaze = calculateSmoothedGaze(data);
          setGazePosition(smoothedGaze);
          
          const newGazeState = determineGazeState(smoothedGaze.x);
          setGazeState(newGazeState);
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
  };
}
