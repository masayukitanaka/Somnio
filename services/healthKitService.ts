import { Platform } from 'react-native';
import progressService from './progressService';

// Check if running in Expo environment
const isExpo = () => {
  try {
    return Boolean(require('expo-constants').default);
  } catch {
    return false;
  }
};

// Lazy load react-native-health only on native iOS builds
let AppleHealthKit: any = null;
if (Platform.OS === 'ios' && !isExpo()) {
  try {
    AppleHealthKit = require('react-native-health').default;
  } catch (error) {
    console.warn('react-native-health not available:', error);
  }
}

interface SleepSampleValue {
  startDate: string;
  endDate: string;
  value: number;
  sourceName: string;
  sourceId: string;
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
    this.isAvailable = Platform.OS === 'ios' && !isExpo() && AppleHealthKit !== null;
  }

  // Initialize HealthKit and request permissions
  async initialize(): Promise<boolean> {
    if (!this.isAvailable || !AppleHealthKit) {
      console.log('HealthKit is not available on this platform or in Expo managed workflow');
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

  // Get sleep data for a specific date
  async getSleepData(date: Date): Promise<{ totalHours: number; startTime?: string; endTime?: string } | null> {
    if (!AppleHealthKit || !this.isAvailable) {
      console.log('HealthKit not available for sleep data');
      return null;
    }

    if (!this.isAuthorized) {
      const authorized = await this.initialize();
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

        // Calculate total sleep duration
        let totalMinutes = 0;
        let earliestStart: Date | null = null;
        let latestEnd: Date | null = null;

        results.forEach((sample: any) => {
          const start = new Date(sample.startDate);
          const end = new Date(sample.endDate);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
          totalMinutes += duration;

          if (!earliestStart || start < earliestStart) {
            earliestStart = start;
          }
          if (!latestEnd || end > latestEnd) {
            latestEnd = end;
          }
        });

        const totalHours = totalMinutes / 60;

        resolve({
          totalHours,
          startTime: earliestStart?.toISOString(),
          endTime: latestEnd?.toISOString()
        });
      });
    });
  }

  // Get mindfulness session data for a specific date
  async getMindfulnessData(date: Date): Promise<{ totalMinutes: number; sessions: Array<{ start: string; end: string }> } | null> {
    if (!AppleHealthKit || !this.isAvailable) {
      console.log('HealthKit not available for mindfulness data');
      return null;
    }

    if (!this.isAuthorized) {
      const authorized = await this.initialize();
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
          resolve(null);
          return;
        }

        let totalMinutes = 0;
        const sessions: Array<{ start: string; end: string }> = [];

        results.forEach((sample) => {
          const duration = sample.value; // Duration in minutes
          totalMinutes += duration;
          
          // Note: The actual session times might not be available in the response
          // We'll use the sample date as an approximation
          sessions.push({
            start: sample.startDate,
            end: sample.endDate
          });
        });

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

      AppleHealthKit.saveMindfulSession(options, (error: string, result: HealthValue) => {
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
    const sleepData = await this.getSleepData(dateObj);
    
    if (sleepData) {
      await progressService.trackSleep(
        date,
        sleepData.totalHours,
        sleepData.startTime,
        sleepData.endTime
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