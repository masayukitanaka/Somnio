import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AudioAsset {
  id: string;
  title: string;
  audioUrl: string;
  isBuiltIn: boolean;
  isDownloaded: boolean;
  localPath?: string;
  downloadProgress?: number;
  fileSize?: number;
}

export class AudioAssetManager {
  private static instance: AudioAssetManager;
  private audioDirectory: string;
  private STORAGE_KEY = 'downloaded_audio_assets';

  private constructor() {
    this.audioDirectory = `${FileSystem.documentDirectory}audio/`;
  }

  static getInstance(): AudioAssetManager {
    if (!AudioAssetManager.instance) {
      AudioAssetManager.instance = new AudioAssetManager();
    }
    return AudioAssetManager.instance;
  }

  async initialize(): Promise<void> {
    // Create audio directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(this.audioDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.audioDirectory, { intermediates: true });
    }
  }

  async getLocalPath(audioId: string): Promise<string> {
    return `${this.audioDirectory}${audioId}.mp3`;
  }

  async isDownloaded(audioId: string): Promise<boolean> {
    const localPath = await this.getLocalPath(audioId);
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    return fileInfo.exists;
  }

  async downloadAudio(
    audioId: string, 
    audioUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const localPath = await this.getLocalPath(audioId);
    
    // Check if already downloaded
    if (await this.isDownloaded(audioId)) {
      console.log(`Audio ${audioId} already downloaded, skipping`);
      return localPath;
    }

    try {
      console.log(`DOWNLOAD STARTED: ${audioId} from ${audioUrl} -> ${localPath}`);
      
      const downloadResumable = FileSystem.createDownloadResumable(
        audioUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress?.(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error('Download failed');
      }

      // Save to AsyncStorage for tracking
      await this.saveDownloadedAsset(audioId, localPath);
      
      console.log(`DOWNLOAD COMPLETED: ${localPath}`);
      return localPath;
    } catch (error) {
      console.error('Download error:', error);
      // Clean up partial download
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localPath);
      }
      throw error;
    }
  }

  async deleteDownload(audioId: string): Promise<void> {
    const localPath = await this.getLocalPath(audioId);
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localPath);
    }
    
    await this.removeDownloadedAsset(audioId);
  }

  async getAudioPath(audioId: string, originalUrl: string, allowStreaming: boolean = true): Promise<string> {
    // Check if downloaded locally
    const isDownloaded = await this.isDownloaded(audioId);
    console.log(`getAudioPath for ${audioId}: isDownloaded=${isDownloaded}, allowStreaming=${allowStreaming}`);
    
    if (isDownloaded) {
      const localPath = await this.getLocalPath(audioId);
      console.log(`Using local path: ${localPath}`);
      return localPath;
    }
    
    // Only return original URL if streaming is allowed
    if (allowStreaming) {
      console.log(`Using streaming URL: ${originalUrl}`);
      return originalUrl;
    }
    
    // If not downloaded and streaming not allowed, throw error
    throw new Error('Audio not downloaded and streaming not allowed');
  }

  async getAudioPathWithAutoDownload(audioId: string, originalUrl: string): Promise<string> {
    // Check if downloaded locally first
    const isDownloaded = await this.isDownloaded(audioId);
    console.log(`getAudioPathWithAutoDownload for ${audioId}: isDownloaded=${isDownloaded}`);
    
    if (isDownloaded) {
      const localPath = await this.getLocalPath(audioId);
      console.log(`Using existing local path: ${localPath}`);
      return localPath;
    }
    
    // If not downloaded, start background download and return streaming URL for immediate playback
    console.log(`Starting background download for ${audioId} while streaming from ${originalUrl}`);
    
    // Start download in background (don't await)
    this.downloadAudioInBackground(audioId, originalUrl);
    
    // Return original URL for immediate streaming
    return originalUrl;
  }

  private async downloadAudioInBackground(audioId: string, audioUrl: string): Promise<void> {
    try {
      console.log(`Background download started for ${audioId}`);
      await this.downloadAudio(audioId, audioUrl);
      console.log(`Background download completed for ${audioId}`);
    } catch (error) {
      console.error(`Background download failed for ${audioId}:`, error);
      // Don't throw error as this is background operation
    }
  }

  async getDownloadedAssets(): Promise<Record<string, string>> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading downloaded assets:', error);
      return {};
    }
  }

  private async saveDownloadedAsset(audioId: string, localPath: string): Promise<void> {
    try {
      const downloaded = await this.getDownloadedAssets();
      downloaded[audioId] = localPath;
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(downloaded));
    } catch (error) {
      console.error('Error saving downloaded asset:', error);
    }
  }

  private async removeDownloadedAsset(audioId: string): Promise<void> {
    try {
      const downloaded = await this.getDownloadedAssets();
      delete downloaded[audioId];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(downloaded));
    } catch (error) {
      console.error('Error removing downloaded asset:', error);
    }
  }

  async getStorageInfo(): Promise<{
    totalSize: number;
    freeSize: number;
    downloadedSize: number;
  }> {
    const totalSize = await FileSystem.getTotalDiskCapacityAsync();
    const freeSize = await FileSystem.getFreeDiskStorageAsync();
    
    // Calculate downloaded audio size
    let downloadedSize = 0;
    const downloaded = await this.getDownloadedAssets();
    
    for (const localPath of Object.values(downloaded)) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists && 'size' in fileInfo) {
          downloadedSize += fileInfo.size || 0;
        }
      } catch (error) {
        console.error('Error getting file size:', error);
      }
    }

    return {
      totalSize,
      freeSize,
      downloadedSize,
    };
  }

  async cleanupOrphanedFiles(): Promise<void> {
    try {
      const downloaded = await this.getDownloadedAssets();
      const dirInfo = await FileSystem.getInfoAsync(this.audioDirectory);
      
      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(this.audioDirectory);
        
        for (const file of files) {
          const filePath = `${this.audioDirectory}${file}`;
          const audioId = file.replace('.mp3', '');
          
          // If file is not in our downloaded assets record, remove it
          if (!downloaded[audioId]) {
            await FileSystem.deleteAsync(filePath);
            console.log(`Cleaned up orphaned file: ${filePath}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
    }
  }
}

export const audioAssetManager = AudioAssetManager.getInstance();