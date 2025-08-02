import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';

interface AudioContextType {
  currentSound: Audio.Sound | null;
  currentItem: any | null;
  isPlaying: boolean;
  isLoaded: boolean;
  position: number;
  duration: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  sleepTimerMinutes: number | null;
  setCurrentSound: (sound: Audio.Sound | null) => void;
  setCurrentItem: (item: any | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoaded: (loaded: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  togglePlayPause: () => Promise<void>;
  stopAndUnloadAudio: (cancelTimer?: boolean) => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  adjustVolume: (volume: number) => Promise<void>;
  pauseAudio: () => Promise<void>;
  setSleepTimer: (minutes: number | null) => void;
  cancelSleepTimer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [currentItem, setCurrentItem] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  const togglePlayPause = async () => {
    if (!currentSound || !isLoaded) return;

    try {
      if (isPlaying) {
        await currentSound.pauseAsync();
      } else {
        await currentSound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const stopAndUnloadAudio = async (cancelTimer = true) => {
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
      setCurrentSound(null);
      setCurrentItem(null);
      setIsPlaying(false);
      setIsLoaded(false);
      setProgress(0);
      setPosition(0);
      setDuration(0);
    }
    // Don't interfere with sleep timer
  };

  const seekTo = async (positionMillis: number) => {
    if (!currentSound || !isLoaded) return;
    
    try {
      await currentSound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  };

  const toggleMute = async () => {
    if (!currentSound || !isLoaded) return;
    
    try {
      const newMutedState = !isMuted;
      await currentSound.setVolumeAsync(newMutedState ? 0 : volume);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const adjustVolume = async (newVolume: number) => {
    if (!currentSound || !isLoaded) return;
    
    try {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      await currentSound.setVolumeAsync(isMuted ? 0 : clampedVolume);
      setVolume(clampedVolume);
      
      if (clampedVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    } catch (error) {
      console.error('Error adjusting volume:', error);
    }
  };

  const pauseAudio = async () => {
    if (!currentSound || !isLoaded) return;
    
    try {
      await currentSound.pauseAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    // Only update state, no timer logic in audio context
    setSleepTimerMinutes(minutes);
    console.log(`Sleep timer set for ${minutes} minutes`);
  };

  const cancelSleepTimer = () => {
    // Only clear state, no timer logic in audio context
    setSleepTimerMinutes(null);
    console.log('Sleep timer cancelled');
  };

  return (
    <AudioContext.Provider
      value={{
        currentSound,
        currentItem,
        isPlaying,
        isLoaded,
        position,
        duration,
        progress,
        volume,
        isMuted,
        sleepTimerMinutes,
        setCurrentSound,
        setCurrentItem,
        setIsPlaying,
        setIsLoaded,
        setPosition,
        setDuration,
        setProgress,
        setVolume,
        setIsMuted,
        togglePlayPause,
        stopAndUnloadAudio,
        seekTo,
        toggleMute,
        adjustVolume,
        pauseAudio,
        setSleepTimer,
        cancelSleepTimer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};