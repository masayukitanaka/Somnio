import { useState, useEffect, useCallback } from 'react';
import progressService, { DailyProgress, ProgressCategory } from '@/services/progressService';
import healthKitService from '@/services/healthKitService';
import { Platform } from 'react-native';

export const useProgressTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Track sleep (manual or from HealthKit)
  const trackSleep = useCallback(async (
    hours: number, 
    startTime?: string, 
    endTime?: string,
    date: string = getTodayDate()
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await progressService.trackSleep(date, hours, startTime, endTime);
    } catch (err) {
      setError('Failed to track sleep');
      console.error('Error tracking sleep:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Track mindfulness session
  const trackMindfulness = useCallback(async (
    minutes: number,
    startTime?: string,
    endTime?: string,
    date: string = getTodayDate()
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await progressService.trackMindfulness(date, minutes, startTime, endTime);
      
      // Also save to HealthKit if available (iOS only)
      if (Platform.OS === 'ios' && startTime && endTime) {
        await healthKitService.saveMindfulnessSession(
          new Date(startTime),
          new Date(endTime)
        );
      }
    } catch (err) {
      setError('Failed to track mindfulness');
      console.error('Error tracking mindfulness:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Track focus achievement
  const trackFocus = useCallback(async (
    achieved: boolean,
    date: string = getTodayDate()
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await progressService.trackFocus(date, achieved);
    } catch (err) {
      setError('Failed to track focus');
      console.error('Error tracking focus:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get progress for a specific date
  const getDailyProgress = useCallback(async (date: string): Promise<DailyProgress | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const progress = await progressService.getDailyProgress(date);
      return progress;
    } catch (err) {
      setError('Failed to get daily progress');
      console.error('Error getting daily progress:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get progress for a date range
  const getProgressRange = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<DailyProgress[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const progress = await progressService.getProgressRange(startDate, endDate);
      return progress;
    } catch (err) {
      setError('Failed to get progress range');
      console.error('Error getting progress range:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync data from HealthKit
  const syncHealthKitData = useCallback(async (date: string = getTodayDate()) => {
    if (Platform.OS !== 'ios') return;
    
    setIsLoading(true);
    setError(null);
    try {
      await healthKitService.syncAllData(date);
    } catch (err) {
      setError('Failed to sync HealthKit data');
      console.error('Error syncing HealthKit data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize HealthKit on mount (iOS only)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      healthKitService.initialize().then(success => {
        if (success) {
          // Sync today's data on initialization
          syncHealthKitData();
        } else {
          console.log('HealthKit initialization failed or not available');
        }
      }).catch(error => {
        console.log('HealthKit initialization error:', error);
      });
    }
  }, [syncHealthKitData]);

  return {
    trackSleep,
    trackMindfulness,
    trackFocus,
    getDailyProgress,
    getProgressRange,
    syncHealthKitData,
    isLoading,
    error
  };
};

// Hook for meditation timer integration
export const useMeditationTracking = () => {
  const { trackMindfulness } = useProgressTracking();
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  const startMeditationSession = useCallback(() => {
    setSessionStart(new Date());
  }, []);

  const endMeditationSession = useCallback(async () => {
    if (!sessionStart) return;
    
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - sessionStart.getTime()) / (1000 * 60));
    
    await trackMindfulness(
      durationMinutes,
      sessionStart.toISOString(),
      endTime.toISOString()
    );
    
    setSessionStart(null);
  }, [sessionStart, trackMindfulness]);

  return {
    startMeditationSession,
    endMeditationSession,
    isSessionActive: !!sessionStart
  };
};

// Hook for sleep tracking with manual input
export const useSleepTracking = () => {
  const { trackSleep, syncHealthKitData } = useProgressTracking();
  const [sleepGoal, setSleepGoal] = useState<number>(8);

  useEffect(() => {
    // Load sleep goal from database
    progressService.getSleepGoal().then(setSleepGoal);
  }, []);

  const updateSleepGoal = useCallback(async (hours: number) => {
    try {
      await progressService.setSleepGoal(hours);
      setSleepGoal(hours);
    } catch (error) {
      console.error('Error updating sleep goal:', error);
    }
  }, []);

  const trackSleepManual = useCallback(async (hours: number, date?: string) => {
    await trackSleep(hours, undefined, undefined, date);
  }, [trackSleep]);

  return {
    trackSleepManual,
    syncHealthKitData,
    sleepGoal,
    updateSleepGoal
  };
};