import { useEffect, useState, useRef, useCallback } from 'react';
import type { GazeState } from './useWebGazer';

export type SelectionState = 'idle' | 'dwelling' | 'selected' | 'cooldown';

interface UseDwellSelectionReturn {
  selectionState: SelectionState;
  selectedOption: 'YES' | 'NO' | null;
  dwellProgress: number; // 0 to 1
  currentZone: 'YES' | 'NO' | 'NEUTRAL';
  resetSelection: () => void;
}

// Configuration constants
const DWELL_TIME_MS = 250; // Ultra-sensitive - quick selections
const COOLDOWN_MS = 300; // Fast recovery

export function useDwellSelection(gazeState: GazeState): UseDwellSelectionReturn {
  const [selectionState, setSelectionState] = useState<SelectionState>('idle');
  const [selectedOption, setSelectedOption] = useState<'YES' | 'NO' | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [currentZone, setCurrentZone] = useState<'YES' | 'NO' | 'NEUTRAL'>('NEUTRAL');

  const dwellStartTimeRef = useRef<number | null>(null);
  const lastGazeStateRef = useRef<GazeState>('LOOKING_AT_NEITHER');
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rearmRequiredRef = useRef(false);
  const lastZoneRef = useRef<'YES' | 'NO' | 'NEUTRAL'>('NEUTRAL');

  const speak = useCallback((text: string, priority: boolean = false) => {
    try {
      // Cancel any ongoing speech for high priority messages
      if (priority) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = priority ? 1.2 : 1.0; // Faster for priority
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 0.8; // Good volume level

      // Add event listeners for debugging
      utterance.onstart = () => console.log(`Speaking: "${text}"`);
      utterance.onerror = (e) => console.error('Speech error:', e);

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
    }
  }, []);

  // Track current zone and provide voice feedback
  const updateCurrentZone = useCallback((gazeState: GazeState) => {
    let newZone: 'YES' | 'NO' | 'NEUTRAL';
    switch (gazeState) {
      case 'LOOKING_AT_YES':
        newZone = 'YES';
        break;
      case 'LOOKING_AT_NO':
        newZone = 'NO';
        break;
      default:
        newZone = 'NEUTRAL';
    }

    // Voice feedback when entering YES/NO zones - ultra responsive
    if (newZone !== lastZoneRef.current && newZone !== 'NEUTRAL') {
      console.log(`🎯 ENTERING ${newZone} ZONE - VOICE FEEDBACK TRIGGERED`);
      // Cancel any ongoing speech for instant feedback
      window.speechSynthesis.cancel();
      try {
        const utterance = new SpeechSynthesisUtterance(newZone.toLowerCase());
        utterance.volume = 1;
        utterance.rate = 2.0; // Ultra fast
        utterance.pitch = 1.3; // Very distinctive
        window.speechSynthesis.speak(utterance);
        console.log(`✅ Instant speech synthesis for: ${newZone.toLowerCase()}`);
      } catch (error) {
        console.error('❌ Speech synthesis failed:', error);
      }
    }

    setCurrentZone(newZone);
    lastZoneRef.current = newZone;
  }, [speak]);

  const resetSelection = useCallback(() => {
    setSelectionState('idle');
    setSelectedOption(null);
    setDwellProgress(0);
    dwellStartTimeRef.current = null;
    rearmRequiredRef.current = false;
    
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = null;
    }
  }, []);

  const handleSelection = useCallback((option: 'YES' | 'NO') => {
    setSelectionState('selected');
    setSelectedOption(option);
    setDwellProgress(1);
    
    // Speak the selection
    speak(option);
    
    // Mark that re-arm is required (user must look away before next selection)
    rearmRequiredRef.current = true;
    
    // Enter cooldown after showing selection
    cooldownTimeoutRef.current = setTimeout(() => {
      setSelectionState('cooldown');
      
      cooldownTimeoutRef.current = setTimeout(() => {
        setSelectionState('idle');
        setSelectedOption(null);
        setDwellProgress(0);
        dwellStartTimeRef.current = null;
      }, COOLDOWN_MS);
    }, 1000); // Show selection for 1 second before cooldown
  }, [speak]);

  useEffect(() => {
    // Update current zone on gaze state changes
    console.log('Gaze state changed:', gazeState);
    updateCurrentZone(gazeState);

    const updateDwellProgress = () => {
      if (selectionState === 'dwelling' && dwellStartTimeRef.current) {
        const elapsed = Date.now() - dwellStartTimeRef.current;
        const progress = Math.min(elapsed / DWELL_TIME_MS, 1);
        setDwellProgress(progress);

        if (progress >= 1) {
          const option = lastGazeStateRef.current === 'LOOKING_AT_YES' ? 'YES' : 'NO';
          handleSelection(option);
        } else {
          animationFrameRef.current = requestAnimationFrame(updateDwellProgress);
        }
      }
    };

    // Clean up previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Handle state transitions based on gaze
    if (selectionState === 'idle' || selectionState === 'dwelling') {
      const isLookingAtOption = gazeState === 'LOOKING_AT_YES' || gazeState === 'LOOKING_AT_NO';
      const gazeChanged = gazeState !== lastGazeStateRef.current;
      
      // Check if user looked away (for re-arming)
      if (gazeState === 'LOOKING_AT_NEITHER') {
        rearmRequiredRef.current = false;
      }
      
      if (isLookingAtOption && !rearmRequiredRef.current) {
        if (gazeChanged || selectionState === 'idle') {
          // Start or restart dwell timer
          dwellStartTimeRef.current = Date.now();
          setSelectionState('dwelling');
          setDwellProgress(0);
        }
        
        // Continue updating progress
        animationFrameRef.current = requestAnimationFrame(updateDwellProgress);
      } else if (!isLookingAtOption && selectionState === 'dwelling') {
        // Gaze left the region, reset dwell
        setSelectionState('idle');
        setDwellProgress(0);
        dwellStartTimeRef.current = null;
      }
    }

    lastGazeStateRef.current = gazeState;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gazeState, selectionState, handleSelection, updateCurrentZone]);

  // Test speech synthesis on mount
  useEffect(() => {
    // Test speech synthesis availability
    if ('speechSynthesis' in window) {
      console.log('Speech synthesis is available');
    } else {
      console.error('Speech synthesis not available');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    selectionState,
    selectedOption,
    dwellProgress,
    currentZone,
    resetSelection,
  };
}
