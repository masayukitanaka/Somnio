import { Platform } from 'react-native';
import progressService from './progressService';

// Lazy load react-native-health only on iOS
let AppleHealthKit: any = null;
if (Platform.OS === 'ios') {
  try {
    const RNHealth = require('react-native-health');
    AppleHealthKit = RNHealth.default || RNHealth;
    console.log('AppleHealthKit loaded:', !!AppleHealthKit);
    console.log('AppleHealthKit type:', typeof AppleHealthKit);
    console.log('AppleHealthKit keys:', AppleHealthKit ? Object.keys(AppleHealthKit).slice(0, 5) : 'null');
  } catch (error) {
    console.warn('react-native-health not available:', error);
  }
}

// Sleep categories in iOS 16+
enum SleepCategory {
  InBed = 'INBED',
  Asleep = 'ASLEEP', 
  Awake = 'AWAKE',
  Core = 'CORE',
  Deep = 'DEEP',
  REM = 'REM'
}

interface HealthInputOptions {
  startDate: string;
  endDate: string;
}

interface HealthValue {
  value: number;
  startDate: string;
  endDate: string;
}

const getPermissions = () => {
  if (!AppleHealthKit) return null;
  
  return {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.MindfulSession
      ],
      write: [
        AppleHealthKit.Constants.Permissions.MindfulSession
      ]
    }
  };
};

class HealthKitService {
  private isAvailable: boolean = false;
  private isAuthorized: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  private checkAvailability() {
    console.log('Checking availability - Platform:', Platform.OS, 'AppleHealthKit:', !!AppleHealthKit);
    this.isAvailable = Platform.OS === 'ios' && AppleHealthKit !== null;
    console.log('HealthKit isAvailable:', this.isAvailable);
  }

  // Initialize HealthKit and request permissions
  async initialize(): Promise<boolean> {
    if (!this.isAvailable || !AppleHealthKit) {
      console.log('HealthKit is not available on this platform');
      return false;
    }

    const permissions = getPermissions();
    if (!permissions) {
      console.log('HealthKit permissions not available');
      return false;
    }

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.error('Cannot grant permissions for HealthKit:', error);
          this.isAuthorized = false;
          resolve(false);
        } else {
          console.log('HealthKit initialized successfully');
          this.isAuthorized = true;
          resolve(true);
        }
      });
    });
  }

  // Get sleep data for a specific date grouped by source
  async getSleepDataBySource(date: Date): Promise<{ 
    sources: Array<{
      sourceId: string;
      sourceName: string;
      totalHours: number;
      startTime?: string;
      endTime?: string;
    }>;
    totalHours: number;
  } | null> {
    if (!AppleHealthKit || !this.isAvailable) {
      console.log('HealthKit not available for sleep data');
      return null;
    }

    if (!this.isAuthorized) {
      const authorized = await this.initialize();
      if (!authorized) return null;
    }

    return new Promise((resolve) => {
      // For sleep data, we want to get data from last night
      // Typically sleep from 6 PM yesterday to noon today
      const endOfDay = new Date(date);
      endOfDay.setHours(12, 0, 0, 0); // Noon today
      
      const startOfDay = new Date(date);
      startOfDay.setDate(startOfDay.getDate() - 1);
      startOfDay.setHours(18, 0, 0, 0); // 6 PM yesterday

      const options: HealthInputOptions = {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString()
      };

      AppleHealthKit.getSleepSamples(options, (error: string, results: any[]) => {
        if (error) {
          console.error('Error getting sleep data:', error);
          resolve(null);
          return;
        }

        if (!results || results.length === 0) {
          resolve(null);
          return;
        }

        // Group sleep data by source
        const sourceMap = new Map<string, {
          sourceName: string;
          totalMinutes: number;
          earliestStart: Date | null;
          latestEnd: Date | null;
        }>();

        console.log(`Found ${results.length} sleep samples for date range`);
        
        results.forEach((sample: any) => {
          const sourceId = sample.sourceId || 'unknown';
          const sourceName = sample.sourceName || 'Unknown Source';
          
          console.log(`Sleep sample from ${sourceName}: ${sample.startDate} to ${sample.endDate}`);
          
          // Since sample.value doesn't exist, calculate duration from time difference
          // All sleep samples are considered as actual sleep time
          const start = new Date(sample.startDate);
          const end = new Date(sample.endDate);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
          
          // Only process samples with positive duration
          if (duration > 0) {
            console.log(`Adding ${duration} minutes of sleep from ${sourceName}`);
            
            // Initialize source if not exists
            if (!sourceMap.has(sourceId)) {
              sourceMap.set(sourceId, {
                sourceName,
                totalMinutes: 0,
                earliestStart: null,
                latestEnd: null
              });
            }
            
            const sourceData = sourceMap.get(sourceId)!;
            sourceData.totalMinutes += duration;
            
            if (!sourceData.earliestStart || start < sourceData.earliestStart) {
              sourceData.earliestStart = start;
            }
            if (!sourceData.latestEnd || end > sourceData.latestEnd) {
              sourceData.latestEnd = end;
            }
          }
        });
        
        // Convert map to array and calculate totals
        const sources = Array.from(sourceMap.entries()).map(([sourceId, data]) => ({
          sourceId,
          sourceName: data.sourceName,
          totalHours: data.totalMinutes / 60,
          startTime: data.earliestStart?.toISOString(),
          endTime: data.latestEnd?.toISOString()
        }));
        
        const totalHours = sources.reduce((sum, source) => sum + source.totalHours, 0);
        
        console.log(`Total sources: ${sources.length}, Total hours: ${totalHours}`);

        resolve({
          sources,
          totalHours
        });
      });
    });
  }

  // Get mindfulness session data for a specific date
  async getMindfulnessData(date: Date): Promise<{ totalMinutes: number; sessions: Array<{ start: string; end: string }> } | null> {
    console.log('getMindfulnessData()');
    if (!AppleHealthKit || !this.isAvailable) {
      console.log('HealthKit not available for mindfulness data');
      return null;
    }

    if (!this.isAuthorized) {
      const authorized = await this.initialize();
      console.log('authorized:', authorized);
      if (!authorized) return null;
    }

    return new Promise((resolve) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const options: HealthInputOptions = {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString()
      };

      AppleHealthKit.getMindfulSession(options, (error: string, results: HealthValue[]) => {
        if (error) {
          console.error('Error getting mindfulness data:', error);
          resolve(null);
          return;
        }

        if (!results || results.length === 0) {
          console.error('No mindfulsession found');
          resolve(null);
          return;
        }

        let totalMinutes = 0;
        const sessions: Array<{ start: string; end: string }> = [];

        results.forEach((sample) => {
          console.log(`Mindfulness session: `, sample);
          // Calculate duration from time difference if value is not present
          const start = new Date(sample.startDate);
          const end = new Date(sample.endDate);
          const duration = sample.value || ((end.getTime() - start.getTime()) / (1000 * 60)); // Duration in minutes
          totalMinutes += duration;
          
          // Note: The actual session times might not be available in the response
          // We'll use the sample date as an approximation
          sessions.push({
            start: sample.startDate,
            end: sample.endDate
          });
        });
        console.log(`Total mindfulness sessions: ${sessions.length}, Total minutes: ${totalMinutes}`);

        resolve({
          totalMinutes,
          sessions
        });
      });
    });
  }

  // Save mindfulness session to HealthKit
  async saveMindfulnessSession(startDate: Date, endDate: Date): Promise<boolean> {
    if (!AppleHealthKit || !this.isAvailable) {
      console.log('HealthKit not available for saving mindfulness session');
      return false;
    }

    if (!this.isAuthorized) {
      const authorized = await this.initialize();
      if (!authorized) return false;
    }

    return new Promise((resolve) => {
      const options = {
        value: (endDate.getTime() - startDate.getTime()) / (1000 * 60), // Duration in minutes
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      AppleHealthKit.saveMindfulSession(options, (error: string) => {
        if (error) {
          console.error('Error saving mindfulness session:', error);
          resolve(false);
        } else {
          console.log('Mindfulness session saved successfully');
          resolve(true);
        }
      });
    });
  }

  // Sync sleep data with progress tracking
  async syncSleepData(date: string): Promise<void> {
    const dateObj = new Date(date);
    const sleepData = await this.getSleepDataBySource(dateObj);
    
    if (sleepData && sleepData.totalHours > 0) {
      // Use the earliest start and latest end from all sources
      const allSources = sleepData.sources;
      const startTime = allSources
        .map(s => s.startTime)
        .filter(Boolean)
        .sort()[0];
      const endTime = allSources
        .map(s => s.endTime)
        .filter(Boolean)
        .sort()
        .reverse()[0];
        
      await progressService.trackSleep(
        date,
        sleepData.totalHours,
        startTime,
        endTime
      );
    }
  }

  // Sync mindfulness data with progress tracking
  async syncMindfulnessData(date: string): Promise<void> {
    const dateObj = new Date(date);
    const mindfulnessData = await this.getMindfulnessData(dateObj);
    
    if (mindfulnessData && mindfulnessData.totalMinutes > 0) {
      const firstSession = mindfulnessData.sessions[0];
      const lastSession = mindfulnessData.sessions[mindfulnessData.sessions.length - 1];
      
      await progressService.trackMindfulness(
        date,
        mindfulnessData.totalMinutes,
        firstSession?.start,
        lastSession?.end
      );
    }
  }

  // Sync all data for a specific date
  async syncAllData(date: string): Promise<void> {
    if (!this.isAvailable || !AppleHealthKit) {
      console.log('HealthKit not available for syncing data');
      return;
    }

    try {
      await Promise.all([
        this.syncSleepData(date),
        this.syncMindfulnessData(date)
      ]);
    } catch (error) {
      console.error('Error syncing HealthKit data:', error);
    }
  }
}

export default new HealthKitService();