import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Vibration,
  Dimensions,
  Text,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const PICKER_HEIGHT = 200;
const ITEM_HEIGHT = 50;

// Time Picker Component
const TimePicker = ({ 
  value, 
  onChange, 
  maxValue, 
  label 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  maxValue: number;
  label: string;
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const isScrollingRef = useRef(false);
  const velocityCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize scroll position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: value * ITEM_HEIGHT,
        animated: false,
      });
      setDisplayValue(value);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (velocityCheckTimeoutRef.current) {
        clearTimeout(velocityCheckTimeoutRef.current);
      }
    };
  }, []);

  const handleScrollBegin = () => {
    isScrollingRef.current = true;
    
    // Clear any pending snapping when user starts scrolling
    if (velocityCheckTimeoutRef.current) {
      clearTimeout(velocityCheckTimeoutRef.current);
      velocityCheckTimeoutRef.current = null;
    }
  };

  const handleScrollEnd = (event: any) => {
    // Prevent duplicate calls
    if (velocityCheckTimeoutRef.current) {
      return;
    }
    
    const y = event.nativeEvent.contentOffset.y;
    const newIndex = Math.max(0, Math.min(maxValue, Math.round(y / ITEM_HEIGHT)));
    
    setDisplayValue(newIndex);
    onChange(newIndex);
    
    // Reset scrolling state with a small delay to prevent immediate re-triggering
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 50);
    
    // Use a longer delay before snapping to allow momentum to settle
    velocityCheckTimeoutRef.current = setTimeout(() => {
      // Double check that user isn't scrolling again
      if (!isScrollingRef.current) {
        const targetIndex = Math.max(0, Math.min(maxValue, Math.round(y / ITEM_HEIGHT)));
        const targetY = targetIndex * ITEM_HEIGHT;
        
        if (Math.abs(y - targetY) > 1) {
          scrollRef.current?.scrollTo({
            y: targetY,
            animated: true,
          });
        }
      }
      // Clear the timeout reference when done
      velocityCheckTimeoutRef.current = null;
    }, 200); // Longer delay to let momentum settle
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const newIndex = Math.max(0, Math.min(maxValue, Math.round(y / ITEM_HEIGHT)));
    setDisplayValue(newIndex);
  };

  // Generate array of numbers for picker
  const numbers = Array.from({ length: maxValue + 1 }, (_, i) => i);

  return (
    <View style={styles.pickerContainer}>
      <View style={styles.pickerHighlight} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        decelerationRate={0.98}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        nestedScrollEnabled={true}
        maximumZoomScale={1}
        minimumZoomScale={1}
        contentContainerStyle={{
          paddingVertical: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
        }}
        style={styles.pickerScroll}
      >
        {numbers.map((num) => {
          const distance = Math.abs(num - displayValue);
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;
          const scale = distance === 0 ? 1 : distance === 1 ? 0.8 : 0.6;
          
          const isSelected = distance === 0;
          
          return (
            <View key={num} style={styles.pickerItem}>
              <View style={styles.pickerItemContent}>
                <Text style={[
                  styles.pickerItemText,
                  { 
                    opacity,
                    fontSize: 32, // Always use large font
                    fontWeight: isSelected ? 'bold' : 'normal',
                  }
                ]}>
                  {num.toString().padStart(2, '0')}
                </Text>
                <Text style={[
                  styles.pickerUnitText,
                  { 
                    opacity: isSelected ? 1 : 0.5,
                    fontSize: 18, // Always use large font
                  }
                ]}>
                  {label}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};


export default function MeditationTimerScreen() {
  const router = useRouter();
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [bellHours, setBellHours] = useState(0);
  const [bellMinutes, setBellMinutes] = useState(0);
  const [bellSeconds, setBellSeconds] = useState(0);
  const [bellEnabled, setBellEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastBellTime, setLastBellTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Check for bell interval
          if (bellEnabled) {
            const bellInterval = bellHours * 3600 + bellMinutes * 60 + bellSeconds;
            if (bellInterval > 0 && newTime > 0) {
              const elapsedTime = startTimeRef.current - newTime;
              if (elapsedTime - lastBellTime >= bellInterval) {
                playBellSound(1);
                setLastBellTime(elapsedTime);
              }
            }
          }
          
          if (newTime <= 0) {
            handleComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining, bellHours, bellMinutes, bellSeconds, bellEnabled, lastBellTime]);


  const playBellSound = async (repeat: number = 1) => {
    try {
      Vibration.vibrate(100);
      
      const playOnce = async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/audio/bell.mp3'),
          { shouldPlay: false }
        );
        
        return new Promise<void>((resolve) => {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync();
              resolve();
            }
          });
          
          sound.playAsync();
        });
      };
      
      // Play sounds sequentially
      for (let i = 0; i < repeat; i++) {
        console.log(`Playing bell sound ${i + 1}/${repeat}`);
        await playOnce();
        
        // Wait between plays (except for the last one)
        if (i < repeat - 1) {
          console.log('Waiting before next bell...');
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      console.log('Bell sound sequence completed');
    } catch (error) {
      console.error('Error playing bell sound:', error);
      // Fallback to vibration only
      Vibration.vibrate([100, 200, 100]);
    }
  };

  const handleStart = () => {
    const time = durationHours * 3600 + durationMinutes * 60 + durationSeconds;
    if (time === 0) return; // Don't start if no time set
    setTimeRemaining(time);
    startTimeRef.current = time;
    setIsRunning(true);
    setIsPaused(false);
    setLastBellTime(0);
    setShowSettings(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    pulseAnim.setValue(1);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    setIsPaused(false);
    Vibration.vibrate([0, 500, 200, 500]);
    
    // Play completion sound (2 times)
    await playBellSound(2);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  if (isRunning) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />
        <View style={[styles.gradient, { backgroundColor: '#1a1a1a' }]}>
          <SafeAreaView style={styles.container}>
            <View style={styles.runningContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleStop}
              >
                <MaterialIcons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>

              <View style={styles.timerDisplay}>
                <Animated.View
                  style={[
                    styles.timerCircle,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <Text style={styles.timerText}>
                    {formatTime(timeRemaining)}
                  </Text>
                </Animated.View>
              </View>

              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handlePause}
                >
                  <MaterialIcons 
                    name={isPaused ? "play-arrow" : "pause"} 
                    size={40} 
                    color="#ffffff" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleStop}
                >
                  <MaterialIcons name="stop" size={40} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Meditation Timer',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={[styles.gradient, { backgroundColor: '#1a1a1a' }]}>
        <SafeAreaView style={styles.container}>
          <View style={styles.scrollContent}>

            {/* Duration Selection */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Duration</ThemedText>
              <View style={styles.timeSelectionContainer}>
                <TimePicker
                  value={durationHours}
                  onChange={setDurationHours}
                  maxValue={23}
                  label="H"
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TimePicker
                  value={durationMinutes}
                  onChange={setDurationMinutes}
                  maxValue={59}
                  label="m"
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TimePicker
                  value={durationSeconds}
                  onChange={setDurationSeconds}
                  maxValue={59}
                  label="s"
                />
              </View>
            </View>

            {/* Interval Bell Settings */}
            <View style={styles.section}>
              <View style={styles.bellHeaderContainer}>
                <ThemedText style={styles.sectionTitle}>Interval Bells</ThemedText>
                <Switch
                  value={bellEnabled}
                  onValueChange={setBellEnabled}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: 'rgba(76, 175, 80, 0.8)' }}
                  thumbColor={bellEnabled ? '#4CAF50' : 'rgba(255, 255, 255, 0.8)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                />
              </View>
              {bellEnabled && (
                <>
                  <View style={styles.timeSelectionContainer}>
                    <TimePicker
                      value={bellHours}
                      onChange={setBellHours}
                      maxValue={23}
                      label="H"
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <TimePicker
                      value={bellMinutes}
                      onChange={setBellMinutes}
                      maxValue={59}
                      label="m"
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <TimePicker
                      value={bellSeconds}
                      onChange={setBellSeconds}
                      maxValue={59}
                      label="s"
                    />
                  </View>
                  <ThemedText style={styles.bellHelpText}>
                    {bellHours === 0 && bellMinutes === 0 && bellSeconds === 0 
                      ? 'Set interval time above' 
                      : `Bell every ${formatTime(bellHours * 3600 + bellMinutes * 60 + bellSeconds)}`}
                  </ThemedText>
                </>
              )}
            </View>

            {/* Start Button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.startButtonGradient}
              >
                <MaterialIcons name="play-arrow" size={32} color="#ffffff" />
                <ThemedText style={styles.startButtonText}>Start Meditation</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  runningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  timeSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    height: PICKER_HEIGHT + 30,
  },
  pickerContainer: {
    width: 90,
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  pickerScroll: {
    height: PICKER_HEIGHT,
  },
  pickerHighlight: {
    position: 'absolute',
    top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    zIndex: -1,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  pickerItemText: {
    color: '#ffffff',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 40,
  },
  pickerUnitText: {
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: 'normal',
    includeFontPadding: false,
    lineHeight: 24,
  },
  timeSeparator: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
    marginTop: PICKER_HEIGHT / 2 - 20,
  },
  bellHelpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 10,
  },
  bellHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  startButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  timerDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 56,
    letterSpacing: 2,
    fontFamily: 'System',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 50,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});