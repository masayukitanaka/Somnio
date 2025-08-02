import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import { useAudio } from '@/contexts/AudioContext';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { VolumeSlider } from './VolumeSlider';
import { SleepTimer } from './SleepTimer';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface PlayerModalProps {
  visible: boolean;
  onClose: () => void;
  item: {
    title: string;
    duration: string;
    color: string;
    icon: string;
    thumbnail?: string;
    description?: string;
    audioUrl?: string;
  } | null;
}

export function PlayerModal({ visible, onClose, item }: PlayerModalProps) {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const [volumeSliderVisible, setVolumeSliderVisible] = React.useState(false);
  const [sleepTimerVisible, setSleepTimerVisible] = React.useState(false);
  const {
    currentSound,
    currentItem,
    isPlaying,
    isLoaded,
    position,
    duration,
    progress,
    setCurrentSound,
    setCurrentItem,
    setIsPlaying,
    setIsLoaded,
    setPosition,
    setDuration,
    setProgress,
    togglePlayPause: globalTogglePlayPause,
    stopAndUnloadAudio: globalStopAndUnloadAudio,
    seekTo,
    volume,
    isMuted,
    toggleMute,
    sleepTimerMinutes,
    getAudioPathWithAutoDownload,
  } = useAudio();

  const { timeRemaining: sleepTimerRemaining } = useSleepTimer();

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      if (!currentItem || currentItem.id !== item?.id) {
        loadAudio();
      }
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Don't stop audio when closing modal
    }
  }, [visible]);

  // Removed cleanup effect as it's handled in context

  const loadAudio = async () => {
    if (!item?.audioUrl) return;

    // If same track is already loaded, don't reload
    if (currentItem && (currentItem as any).id === (item as any).id && currentSound && isLoaded) {
      return;
    }

    try {
      // Enable background audio playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Stop current audio if playing different track
      if (currentSound && (currentItem as any)?.id !== (item as any).id) {
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch (error) {
          console.error('Error stopping previous audio:', error);
        }
      }

      // Reset loading state only when loading new track
      setIsLoaded(false);

      // Get audio path with automatic background download
      // This will use local file if available, or stream while downloading in background
      const audioPath = await getAudioPathWithAutoDownload((item as any).id, item.audioUrl);
      console.log('Loading audio from:', audioPath);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: false }
      );
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis || 0);
          setProgress((status.positionMillis / (status.durationMillis || 1)) * 100);
          setIsPlaying(status.isPlaying);
          setIsLoaded(true);
        } else {
          setIsLoaded(false);
        }
      });

      setCurrentSound(newSound);
      setCurrentItem(item);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoaded(false);
    }
  };

  const togglePlayPause = async () => {
    await globalTogglePlayPause();
  };


  const seekBackward = async () => {
    if (!currentSound || !isLoaded) return;
    try {
      const newPosition = Math.max(0, position - 10000);
      await seekTo(newPosition);
    } catch (error) {
      console.error('Error seeking backward:', error);
    }
  };

  const seekForward = async () => {
    if (!currentSound || !isLoaded) return;
    try {
      const newPosition = Math.min(duration, position + 10000);
      await seekTo(newPosition);
    } catch (error) {
      console.error('Error seeking forward:', error);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const barWidth = event.currentTarget.offsetWidth || 300; // fallback width
    const percentage = locationX / barWidth;
    const newPosition = duration * percentage;
    
    seekTo(newPosition);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return 'volume-off';
    if (volume < 0.3) return 'volume-down';
    if (volume < 0.7) return 'volume-up';
    return 'volume-up';
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[item.color, '#0A2647']}
          style={styles.gradient}
        >
          <View style={styles.handle} />
          
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.thumbnailContainer}>
                {item.thumbnail ? (
                  <ImageBackground 
                    source={{ uri: item.thumbnail }}
                    style={styles.thumbnailImage}
                    imageStyle={styles.thumbnailImageStyle}
                  >
                    <View style={styles.thumbnailOverlay} />
                    <MaterialIcons
                      name={item.icon as any}
                      size={60}
                      color="rgba(255, 255, 255, 0.9)"
                      style={styles.thumbnailIcon}
                    />
                  </ImageBackground>
                ) : (
                  <View style={[styles.thumbnailImage, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={60}
                      color="rgba(255, 255, 255, 0.8)"
                    />
                  </View>
                )}
              </View>
              
              <Text style={styles.title}>{item.title}</Text>
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
              <Text style={styles.duration}>{item.duration}</Text>
            </View>

            <View style={styles.progressContainer}>
              <TouchableOpacity 
                style={styles.progressBar}
                onPress={handleProgressBarPress}
                activeOpacity={1}
              >
                <View 
                  style={[styles.progressFill, { width: `${progress}%` }]} 
                />
              </TouchableOpacity>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={seekBackward}>
                <MaterialIcons name="replay-10" size={32} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.playButton}
                onPress={togglePlayPause}
              >
                <MaterialIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={48}
                  color="#ffffff"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={seekForward}>
                <MaterialIcons name="forward-10" size={32} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.bottomButton}>
                <MaterialIcons name="favorite-border" size={24} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.bottomButton}
                onPress={() => setSleepTimerVisible(true)}
              >
                <MaterialIcons 
                  name="access-time" 
                  size={24} 
                  color={sleepTimerMinutes ? '#FFD700' : '#ffffff'} 
                />
                <Text style={[
                  styles.bottomButtonText,
                  sleepTimerMinutes ? { color: '#FFD700' } : null
                ]}>
                  {sleepTimerRemaining ? (
                    `⏰ ${Math.floor(sleepTimerRemaining / 60)}:${(sleepTimerRemaining % 60).toString().padStart(2, '0')}`
                  ) : (
                    'Sleep Timer'
                  )}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.bottomButton}
                onPress={() => setVolumeSliderVisible(true)}
              >
                <MaterialIcons 
                  name={getVolumeIcon()} 
                  size={24} 
                  color={isMuted ? '#FF6B6B' : '#ffffff'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <VolumeSlider
        visible={volumeSliderVisible}
        onClose={() => setVolumeSliderVisible(false)}
      />

      <SleepTimer
        visible={sleepTimerVisible}
        onClose={() => setSleepTimerVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  thumbnailContainer: {
    width: 200,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImageStyle: {
    borderRadius: 20,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  thumbnailIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  duration: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 40,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  bottomButton: {
    alignItems: 'center',
    gap: 4,
  },
  bottomButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});