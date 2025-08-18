import * as SQLite from 'expo-sqlite';

// Open or create database
const db = SQLite.openDatabaseSync('somnio.db');

// Initialize database and create tables
export const initDatabase = async () => {
  try {
    // Create progress tracking table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        value REAL,
        startTime TEXT,
        endTime TEXT,
        achieved INTEGER DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, category)
      );
    `);

    // Create settings table for goals
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Set default sleep goal (8 hours)
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      ['sleep_goal_hours', '8']
    );

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Export database instance for use in services
export default db;