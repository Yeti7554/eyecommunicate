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
const DWELL_TIME_MS = 2000; // 2-second dwell time for deliberate selections
const COOLDOWN_MS = 200; // Very short cooldown - allow quick repeated selections

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
    console.log(`🎤 Attempting to speak: "${text}" (priority: ${priority})`);

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis not supported');
      return;
    }

    try {
      // For selections, always cancel previous speech and speak clearly
      if (!priority) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0; // Full volume
      utterance.rate = priority ? 1.5 : 0.8; // Fast for zone entry, slow/clear for selections
      utterance.pitch = priority ? 1.3 : 0.9; // Higher pitch for zones, normal for selections

      // Add comprehensive event listeners
      utterance.onstart = () => console.log(`✅ Started speaking: "${text}"`);
      utterance.onend = () => console.log(`🏁 Finished speaking: "${text}"`);
      utterance.onerror = (e) => console.error('❌ Speech error for "${text}":', e);
      utterance.onpause = () => console.log(`⏸️ Paused speaking: "${text}"`);
      utterance.onresume = () => console.log(`▶️ Resumed speaking: "${text}"`);

      console.log(`📢 Speaking "${text}" with rate=${utterance.rate}, pitch=${utterance.pitch}`);
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('❌ Speech synthesis failed:', error);
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

    // No voice feedback when entering zones - only on selection

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
    console.log(`🎯 SELECTION TRIGGERED: ${option} after ${DWELL_TIME_MS}ms dwell`);

    setSelectionState('selected');
    setSelectedOption(option);
    setDwellProgress(1);

    // Speak the selection with clear, distinctive audio
    console.log(`🔊 Speaking selection: ${option}`);
    speak(option, false); // false = selection speech (not priority)

    // Allow immediate reselection - no re-arm requirement
    rearmRequiredRef.current = false;

    // Enter cooldown after showing selection
    cooldownTimeoutRef.current = setTimeout(() => {
      console.log('⏳ Entering cooldown phase');
      setSelectionState('cooldown');

      cooldownTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Reset to idle state - ready for next selection');
        setSelectionState('idle');
        setSelectedOption(null);
        setDwellProgress(0);
        dwellStartTimeRef.current = null;
        // Allow immediate reselection
        rearmRequiredRef.current = false;
      }, COOLDOWN_MS);
    }, 500); // Show selection for 0.5 seconds before cooldown
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

        console.log(`⏱️ Dwell progress: ${(progress * 100).toFixed(1)}% (${elapsed}ms / ${DWELL_TIME_MS}ms)`);

        if (progress >= 1) {
          console.log('🎯 Dwell complete! Triggering selection.');
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
      
      // Reset rearm requirement when looking at neutral
      if (gazeState === 'LOOKING_AT_NEITHER') {
        rearmRequiredRef.current = false;
      }
      
      if (isLookingAtOption && !rearmRequiredRef.current) {
        if (gazeChanged || selectionState === 'idle') {
          // Start or restart dwell timer
          console.log(`👀 Starting dwell timer for ${lastGazeStateRef.current}`);
          dwellStartTimeRef.current = Date.now();
          setSelectionState('dwelling');
          setDwellProgress(0);
        }

        // Continue updating progress
        animationFrameRef.current = requestAnimationFrame(updateDwellProgress);
      } else if (!isLookingAtOption && selectionState === 'dwelling') {
        // Gaze left the region, reset dwell
        console.log('👋 Gaze left zone, resetting dwell');
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
