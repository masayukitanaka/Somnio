import db from './database';

export type ProgressCategory = 'sleep' | 'mindfulness' | 'focus';

export interface ProgressRecord {
  id?: number;
  date: string; // Format: YYYY-MM-DD
  category: ProgressCategory;
  value?: number; // For sleep (hours) and mindfulness (minutes)
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  achieved: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyProgress {
  date: string;
  sleep: ProgressRecord | null;
  mindfulness: ProgressRecord | null;
  focus: ProgressRecord | null;
  stars: number; // 0-3 based on achievements
}

class ProgressService {
  // Create or update progress record
  async upsertProgress(record: ProgressRecord): Promise<void> {
    const { date, category, value, startTime, endTime, achieved, notes } = record;
    
    try {
      await db.runAsync(
        `INSERT INTO progress (date, category, value, startTime, endTime, achieved, notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(date, category) 
         DO UPDATE SET 
           value = excluded.value,
           startTime = excluded.startTime,
           endTime = excluded.endTime,
           achieved = excluded.achieved,
           notes = excluded.notes,
           updated_at = datetime('now')`,
        [
          date,
          category,
          value || null,
          startTime || null,
          endTime || null,
          achieved ? 1 : 0,
          notes || null
        ]
      );
    } catch (error) {
      console.error('Error upserting progress:', error);
      throw error;
    }
  }

  // Get progress for a specific date and category
  async getProgress(date: string, category: ProgressCategory): Promise<ProgressRecord | null> {
    try {
      const result = await db.getFirstAsync<any>(
        'SELECT * FROM progress WHERE date = ? AND category = ?',
        [date, category]
      );
      
      if (!result) return null;
      
      return {
        ...result,
        achieved: result.achieved === 1
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  // Get all progress for a specific date
  async getDailyProgress(date: string): Promise<DailyProgress> {
    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM progress WHERE date = ?',
        [date]
      );
      
      const daily: DailyProgress = {
        date,
        sleep: null,
        mindfulness: null,
        focus: null,
        stars: 0
      };
      
      results.forEach((record: any) => {
        const progressRecord = {
          ...record,
          achieved: record.achieved === 1
        };
        
        if (record.category === 'sleep') {
          daily.sleep = progressRecord;
        } else if (record.category === 'mindfulness') {
          daily.mindfulness = progressRecord;
        } else if (record.category === 'focus') {
          daily.focus = progressRecord;
        }
      });
      
      // Calculate stars based on achievements
      daily.stars = [daily.sleep?.achieved, daily.mindfulness?.achieved, daily.focus?.achieved]
        .filter(Boolean).length;
      
      return daily;
    } catch (error) {
      console.error('Error getting daily progress:', error);
      return {
        date,
        sleep: null,
        mindfulness: null,
        focus: null,
        stars: 0
      };
    }
  }

  // Get progress for a date range
  async getProgressRange(startDate: string, endDate: string): Promise<DailyProgress[]> {
    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM progress WHERE date >= ? AND date <= ? ORDER BY date',
        [startDate, endDate]
      );
      
      const progressByDate: { [date: string]: DailyProgress } = {};
      
      results.forEach((record: any) => {
        if (!progressByDate[record.date]) {
          progressByDate[record.date] = {
            date: record.date,
            sleep: null,
            mindfulness: null,
            focus: null,
            stars: 0
          };
        }
        
        const progressRecord = {
          ...record,
          achieved: record.achieved === 1
        };
        
        if (record.category === 'sleep') {
          progressByDate[record.date].sleep = progressRecord;
        } else if (record.category === 'mindfulness') {
          progressByDate[record.date].mindfulness = progressRecord;
        } else if (record.category === 'focus') {
          progressByDate[record.date].focus = progressRecord;
        }
      });
      
      // Calculate stars for each day
      Object.values(progressByDate).forEach(daily => {
        daily.stars = [daily.sleep?.achieved, daily.mindfulness?.achieved, daily.focus?.achieved]
          .filter(Boolean).length;
      });
      
      return Object.values(progressByDate);
    } catch (error) {
      console.error('Error getting progress range:', error);
      return [];
    }
  }

  // Delete progress record
  async deleteProgress(date: string, category: ProgressCategory): Promise<void> {
    try {
      await db.runAsync(
        'DELETE FROM progress WHERE date = ? AND category = ?',
        [date, category]
      );
    } catch (error) {
      console.error('Error deleting progress:', error);
      throw error;
    }
  }

  // Get sleep goal setting
  async getSleepGoal(): Promise<number> {
    try {
      const result = await db.getFirstAsync<any>(
        'SELECT value FROM settings WHERE key = ?',
        ['sleep_goal_hours']
      );
      return result ? parseFloat(result.value) : 8;
    } catch (error) {
      console.error('Error getting sleep goal:', error);
      return 8; // Default to 8 hours
    }
  }

  // Update sleep goal setting
  async setSleepGoal(hours: number): Promise<void> {
    try {
      await db.runAsync(
        `INSERT INTO settings (key, value, updated_at) 
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) 
         DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
        ['sleep_goal_hours', hours.toString()]
      );
    } catch (error) {
      console.error('Error setting sleep goal:', error);
      throw error;
    }
  }

  // Helper method to track sleep
  async trackSleep(date: string, hours: number, startTime?: string, endTime?: string): Promise<void> {
    const sleepGoal = await this.getSleepGoal();
    const achieved = hours >= sleepGoal;
    
    await this.upsertProgress({
      date,
      category: 'sleep',
      value: hours,
      startTime,
      endTime,
      achieved
    });
  }

  // Helper method to track mindfulness
  async trackMindfulness(date: string, minutes: number, startTime?: string, endTime?: string): Promise<void> {
    const achieved = minutes > 0; // Any meditation counts as achievement
    
    await this.upsertProgress({
      date,
      category: 'mindfulness',
      value: minutes,
      startTime,
      endTime,
      achieved
    });
  }

  // Helper method to track focus
  async trackFocus(date: string, achieved: boolean): Promise<void> {
    await this.upsertProgress({
      date,
      category: 'focus',
      achieved
    });
  }
}

export default new ProgressService();