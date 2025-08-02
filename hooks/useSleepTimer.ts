import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/contexts/AudioContext';

// Global timer state to share between components
let globalTimerMinutes: number | null = null;
let globalTimeRemaining: number | null = null;
let globalIntervalRef: NodeJS.Timeout | null = null;
let subscribers: Array<() => void> = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

export const useSleepTimer = () => {
  const [, forceUpdate] = useState({});
  const { pauseAudio, cancelSleepTimer: cancelAudioContextTimer } = useAudio();

  // Subscribe to global timer updates
  useEffect(() => {
    const callback = () => forceUpdate({});
    subscribers.push(callback);
    
    return () => {
      subscribers = subscribers.filter(cb => cb !== callback);
    };
  }, []);

  const startTimer = (minutes: number | null) => {
    console.log('Starting timer for', minutes, 'minutes');
    
    // Clear existing timer
    if (globalIntervalRef) {
      clearInterval(globalIntervalRef);
      globalIntervalRef = null;
    }

    if (minutes === null) {
      globalTimerMinutes = null;
      globalTimeRemaining = null;
      notifySubscribers();
      return;
    }

    globalTimerMinutes = minutes;
    globalTimeRemaining = minutes * 60;
    notifySubscribers();

    // Start countdown
    globalIntervalRef = setInterval(async () => {
      if (globalTimeRemaining === null || globalTimeRemaining <= 1) {
        // Timer finished - pause audio instead of stopping/unloading
        console.log('Timer finished, pausing audio');
        try {
          await pauseAudio();
          // Also clear the audio context timer state for UI
          cancelAudioContextTimer();
        } catch (error) {
          console.error('Error pausing audio:', error);
        }
        
        if (globalIntervalRef) {
          clearInterval(globalIntervalRef);
          globalIntervalRef = null;
        }
        globalTimerMinutes = null;
        globalTimeRemaining = null;
        notifySubscribers();
        return;
      }
      
      globalTimeRemaining = globalTimeRemaining - 1;
      console.log('Timer remaining:', globalTimeRemaining, 'seconds');
      notifySubscribers();
    }, 1000);
  };

  const cancelTimer = () => {
    console.log('Cancelling timer');
    if (globalIntervalRef) {
      clearInterval(globalIntervalRef);
      globalIntervalRef = null;
    }
    globalTimerMinutes = null;
    globalTimeRemaining = null;
    // Also clear the audio context timer state for UI
    cancelAudioContextTimer();
    notifySubscribers();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (globalIntervalRef) {
        clearInterval(globalIntervalRef);
        globalIntervalRef = null;
        globalTimerMinutes = null;
        globalTimeRemaining = null;
      }
    };
  }, []);

  return {
    timerMinutes: globalTimerMinutes,
    timeRemaining: globalTimeRemaining,
    startTimer,
    cancelTimer,
  };
};