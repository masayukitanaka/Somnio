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
import * as Haptics from 'expo-haptics';
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
    id: string;
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
  const [seekIndicatorPosition, setSeekIndicatorPosition] = React.useState<number | null>(null);
  const [isSeeking, setIsSeeking] = React.useState(false);
  const progressBarRef = useRef<View>(null);

  // Convert underscore to hyphen in icon names for MaterialIcons compatibility
  const iconName = item?.icon?.replace(/_/g, '-') || 'music-note';
  const {
    currentSound,
    currentItem,
    isPlaying,
    isLoaded,
    position,
    duration,
    progress,
    isRepeatEnabled,
    setCurrentSound,
    setCurrentItem,
    setIsPlaying,
    setIsLoaded,
    setPosition,
    setDuration,
    setProgress,
    setIsRepeatEnabled,
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

  // Handle playback status updates including repeat functionality
  useEffect(() => {
    if (!currentSound) return;

    const statusUpdateCallback = async (status: any) => {
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setPosition(status.positionMillis || 0);
        setProgress((status.positionMillis / (status.durationMillis || 1)) * 100);
        setIsPlaying(status.isPlaying);
        setIsLoaded(true);
        
        // Handle audio finish for repeat or infinite duration
        if (status.didJustFinish) {
          // Auto-loop for infinite duration items or when repeat is enabled
          if (item?.duration === '∞' || isRepeatEnabled) {
            try {
              await currentSound.replayAsync();
            } catch (error) {
              console.error('Error looping audio:', error);
            }
          }
        }
      } else {
        setIsLoaded(false);
      }
    };

    currentSound.setOnPlaybackStatusUpdate(statusUpdateCallback);

    return () => {
      // Clean up the listener when component unmounts or currentSound changes
      currentSound.setOnPlaybackStatusUpdate(null);
    };
  }, [currentSound, isRepeatEnabled, item?.duration]);

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

      // Always stop and unload current audio when loading different track
      if (currentSound) {
        try {
          console.log('Stopping and unloading previous audio');
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
          setCurrentSound(null);
          setCurrentItem(null);
          setIsPlaying(false);
          setIsLoaded(false);
          setProgress(0);
          setPosition(0);
          setDuration(0);
        } catch (error) {
          console.error('Error stopping previous audio:', error);
        }
      }

      // Reset loading state
      setIsLoaded(false);

      // Get audio path with automatic background download
      // This will use local file if available, or stream while downloading in background
      const audioPath = await getAudioPathWithAutoDownload((item as any).id, item.audioUrl);
      console.log('Loading audio from:', audioPath);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: false }
      );
      
      setCurrentSound(newSound);
      setCurrentItem(item);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoaded(false);
    }
  };

  const togglePlayPause = async () => {
    if (!currentSound || !isLoaded) {
      console.log('Cannot toggle playback in PlayerModal: sound not loaded');
      // Try to reload audio if needed
      if (item && item.id !== currentItem?.id) {
        await loadAudio();
      }
      return;
    }
    
    await globalTogglePlayPause();
  };


  const seekBackward = async () => {
    if (!currentSound || !isLoaded || item?.duration === '∞') return;
    try {
      const newPosition = Math.max(0, position - 10000);
      await seekTo(newPosition);
    } catch (error) {
      console.error('Error seeking backward:', error);
    }
  };

  const seekForward = async () => {
    if (!currentSound || !isLoaded || item?.duration === '∞') return;
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

  const progressBarWidth = useRef(0);

  const handleProgressBarLayout = (event: any) => {
    progressBarWidth.current = event.nativeEvent.layout.width;
  };

  const handleProgressBarPress = (event: any) => {
    if (item?.duration === '∞' || isSeeking) return;
    
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth.current));
    const newPosition = duration * percentage;
    seekTo(newPosition);
  };

  const handleProgressBarTouchStart = (event: any) => {
    if (item?.duration === '∞') return;
    
    // Provide haptic feedback when starting to seek
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth.current));
    setSeekIndicatorPosition(percentage * 100);
    setIsSeeking(true);
  };

  const handleProgressBarTouchMove = (event: any) => {
    if (item?.duration === '∞' || !isSeeking) return;
    
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth.current));
    const prevPosition = seekIndicatorPosition || 0;
    const newPosition = percentage * 100;
    
    // Provide light haptic feedback when crossing 10% boundaries
    if (Math.floor(prevPosition / 10) !== Math.floor(newPosition / 10)) {
      Haptics.selectionAsync();
    }
    
    setSeekIndicatorPosition(newPosition);
  };

  const handleProgressBarTouchEnd = () => {
    if (!isSeeking || seekIndicatorPosition === null) {
      setSeekIndicatorPosition(null);
      setIsSeeking(false);
      return;
    }
    
    // Provide haptic feedback when applying the seek
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Apply the seek position when touch ends
    const newPosition = duration * (seekIndicatorPosition / 100);
    seekTo(newPosition);
    setSeekIndicatorPosition(null);
    setIsSeeking(false);
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
                      name={iconName as any}
                      size={60}
                      color="rgba(255, 255, 255, 0.9)"
                      style={styles.thumbnailIcon}
                    />
                  </ImageBackground>
                ) : (
                  <View style={[styles.thumbnailImage, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <MaterialIcons
                      name={iconName as any}
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

            {item.duration !== '∞' && (
              <View style={styles.progressContainer}>
                <View 
                  style={styles.progressTouchArea}
                  onLayout={handleProgressBarLayout}
                  ref={progressBarRef}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={handleProgressBarTouchStart}
                  onResponderMove={handleProgressBarTouchMove}
                  onResponderRelease={(event) => {
                    if (isSeeking) {
                      handleProgressBarTouchEnd();
                    } else {
                      handleProgressBarPress(event);
                    }
                  }}
                  onResponderTerminate={handleProgressBarTouchEnd}
                >
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${seekIndicatorPosition ?? progress}%` }]} 
                    />
                    {seekIndicatorPosition !== null && (
                      <View 
                        style={[
                          styles.seekIndicator,
                          { left: `${seekIndicatorPosition}%` }
                        ]} 
                      />
                    )}
                  </View>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {isSeeking && seekIndicatorPosition !== null 
                      ? formatTime(duration * (seekIndicatorPosition / 100))
                      : formatTime(position)
                    }
                  </Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            )}

            <View style={styles.controls}>
              {item.duration !== '∞' && (
                <TouchableOpacity style={styles.controlButton} onPress={seekBackward}>
                  <MaterialIcons name="replay-10" size={32} color="#ffffff" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.playButton, item.duration === '∞' && styles.infinitePlayButton]}
                onPress={togglePlayPause}
              >
                <MaterialIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={48}
                  color="#ffffff"
                />
              </TouchableOpacity>
              
              {item.duration !== '∞' && (
                <TouchableOpacity style={styles.controlButton} onPress={seekForward}>
                  <MaterialIcons name="forward-10" size={32} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity 
                style={styles.bottomButton}
                onPress={() => setIsRepeatEnabled(!isRepeatEnabled)}
              >
                <MaterialIcons 
                  name="repeat" 
                  size={24} 
                  color={isRepeatEnabled ? '#FFD700' : '#ffffff'} 
                />
                <Text style={[
                  styles.bottomButtonText,
                  isRepeatEnabled ? { color: '#FFD700' } : null
                ]}>
                  Repeat
                </Text>
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
              
              <TouchableOpacity style={styles.bottomButton}>
                <MaterialIcons name="favorite-border" size={24} color="#ffffff" />
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
  progressTouchArea: {
    paddingVertical: 15,
    marginHorizontal: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  seekIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    top: -6,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
  infinitePlayButton: {
    marginHorizontal: 0,
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