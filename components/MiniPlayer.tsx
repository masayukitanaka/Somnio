import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudio } from '@/contexts/AudioContext';
import { useSleepTimer } from '@/hooks/useSleepTimer';

const { width } = Dimensions.get('window');

interface MiniPlayerProps {
  onPress: () => void;
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const {
    currentItem,
    isPlaying,
    progress,
    duration,
    togglePlayPause,
    stopAndUnloadAudio,
    seekTo,
  } = useAudio();

  const { timeRemaining } = useSleepTimer();

  if (!currentItem) return null;

  const handleProgressBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const barWidth = width - 32; // container width minus padding
    const percentage = locationX / barWidth;
    const newPosition = duration * percentage;
    
    seekTo(newPosition);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[currentItem.color, '#0A2647']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <View style={styles.thumbnail}>
            {currentItem.thumbnail ? (
              <Image 
                source={{ uri: currentItem.thumbnail }}
                style={styles.thumbnailImage}
              />
            ) : (
              <View style={[styles.thumbnailImage, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <MaterialIcons
                  name={currentItem.icon}
                  size={20}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </View>
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentItem.title}
            </Text>
            <Text style={styles.duration} numberOfLines={1}>
              {timeRemaining ? (
                <Text style={styles.timerText}>⏰ {formatTime(timeRemaining)}</Text>
              ) : (
                currentItem.duration
              )}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.playButton} 
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            <MaterialIcons
              name={isPlaying ? "pause" : "play-arrow"}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={(e) => {
              e.stopPropagation();
              stopAndUnloadAudio();
            }}
          >
            <MaterialIcons
              name="close"
              size={20}
              color="rgba(255, 255, 255, 0.8)"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.progressBar}
          onPress={handleProgressBarPress}
          activeOpacity={1}
        >
          <View 
            style={[styles.progressFill, { width: `${progress}%` }]} 
          />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8, // Android shadow only
    // iOS shadows removed to prevent warning
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    flex: 1,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timerText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
});