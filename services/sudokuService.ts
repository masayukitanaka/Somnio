import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

type SudokuDifficulty = 'easy' | 'medium' | 'hard';

type SudokuPuzzle = {
  id: string;
  difficulty: SudokuDifficulty;
  board: number[][];
  solution: number[][];
};

type SudokuData = {
  puzzles: SudokuPuzzle[];
  lastUpdated?: string;
};

const CACHE_KEY = 'sudoku_puzzles_cache';
const CACHE_FILE_PATH = `${FileSystem.documentDirectory}sudoku_puzzles.json`;

class SudokuService {
  private static instance: SudokuService;
  private cachedData: SudokuData | null = null;
  private lastFetchTime: number = 0;

  static getInstance(): SudokuService {
    if (!SudokuService.instance) {
      SudokuService.instance = new SudokuService();
    }
    return SudokuService.instance;
  }

  private async getCachedData(): Promise<SudokuData | null> {
    try {
      // First check in-memory cache
      if (this.cachedData && this.isCacheValid()) {
        return this.cachedData;
      }

      // Check file system cache
      const fileInfo = await FileSystem.getInfoAsync(CACHE_FILE_PATH);
      if (fileInfo.exists) {
        const cacheMetadata = await AsyncStorage.getItem(CACHE_KEY);
        if (cacheMetadata) {
          const { lastFetchTime } = JSON.parse(cacheMetadata);
          this.lastFetchTime = lastFetchTime;
          
          if (this.isCacheValid()) {
            const fileContent = await FileSystem.readAsStringAsync(CACHE_FILE_PATH);
            this.cachedData = JSON.parse(fileContent);
            return this.cachedData;
          }
        }
      }
    } catch (error) {
      console.error('Error loading cached Sudoku data:', error);
    }
    return null;
  }

  private isCacheValid(): boolean {
    const expireSeconds = parseInt(process.env.EXPO_PUBLIC_SUDOKU_EXPIRE || '60', 10);
    const expireMs = expireSeconds * 1000;
    return (Date.now() - this.lastFetchTime) < expireMs;
  }

  private async saveCacheData(data: SudokuData): Promise<void> {
    try {
      // Save to file system
      await FileSystem.writeAsStringAsync(CACHE_FILE_PATH, JSON.stringify(data));
      
      // Save metadata to AsyncStorage
      const metadata = {
        lastFetchTime: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(metadata));
      
      // Update in-memory cache
      this.cachedData = data;
      this.lastFetchTime = metadata.lastFetchTime;
    } catch (error) {
      console.error('Error saving Sudoku cache:', error);
    }
  }

  private async fetchFromNetwork(): Promise<SudokuData | null> {
    const baseUrl = process.env.EXPO_PUBLIC_SUDOKU_URL;
    if (!baseUrl) {
      console.log('EXPO_PUBLIC_SUDOKU_URL not configured');
      return null;
    }

    try {
      // Add timestamp as nonce to bypass cache
      const nonce = Date.now();
      const url = `${baseUrl}?nonce=${nonce}`;
      
      console.log('Fetching Sudoku puzzles from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch Sudoku puzzles:', response.status);
        return null;
      }

      const data: SudokuData = await response.json();
      data.lastUpdated = new Date().toISOString();
      
      // Save to cache
      await this.saveCacheData(data);
      
      return data;
    } catch (error) {
      console.error('Error fetching Sudoku puzzles from network:', error);
      return null;
    }
  }

  private async loadLocalFallback(): Promise<SudokuData> {
    // Load from local JSON file as fallback
    const localData = require('@/assets/data/sudokuPuzzles.json');
    return localData as SudokuData;
  }

  async getSudokuData(): Promise<SudokuData> {
    // 1. Check cache first
    const cachedData = await this.getCachedData();
    if (cachedData) {
      console.log('Using cached Sudoku data');
      return cachedData;
    }

    // 2. Try to fetch from network
    const networkData = await this.fetchFromNetwork();
    if (networkData) {
      console.log('Fetched fresh Sudoku data from network');
      return networkData;
    }

    // 3. Fall back to local data
    console.log('Using local Sudoku data as fallback');
    return await this.loadLocalFallback();
  }

  async getRandomPuzzle(difficulty: SudokuDifficulty): Promise<SudokuPuzzle> {
    const data = await this.getSudokuData();
    const puzzlesOfDifficulty = data.puzzles.filter(p => p.difficulty === difficulty);
    const randomIndex = Math.floor(Math.random() * puzzlesOfDifficulty.length);
    return puzzlesOfDifficulty[randomIndex];
  }

  async getPuzzleById(id: string): Promise<SudokuPuzzle | null> {
    const data = await this.getSudokuData();
    return data.puzzles.find(p => p.id === id) || null;
  }

  async getDifficultyStats(): Promise<{ easy: number; medium: number; hard: number; total: number }> {
    const data = await this.getSudokuData();
    const stats = {
      easy: data.puzzles.filter(p => p.difficulty === 'easy').length,
      medium: data.puzzles.filter(p => p.difficulty === 'medium').length,
      hard: data.puzzles.filter(p => p.difficulty === 'hard').length,
      total: 0
    };
    stats.total = stats.easy + stats.medium + stats.hard;
    return stats;
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await FileSystem.deleteAsync(CACHE_FILE_PATH, { idempotent: true });
      this.cachedData = null;
      this.lastFetchTime = 0;
      console.log('Sudoku cache cleared');
    } catch (error) {
      console.error('Error clearing Sudoku cache:', error);
    }
  }

  async refreshData(): Promise<SudokuData> {
    // Force refresh from network
    this.lastFetchTime = 0;
    const networkData = await this.fetchFromNetwork();
    if (networkData) {
      return networkData;
    }
    // Fall back to local data if network fails
    return await this.loadLocalFallback();
  }
}

export default SudokuService.getInstance();