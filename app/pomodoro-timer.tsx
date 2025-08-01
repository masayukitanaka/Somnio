import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

type TimerMode = 'work' | 'break';

export default function PomodoroTimer() {
  const router = useRouter();
  
  // Timer settings
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  
  // Animation
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Progress animation effect
  useEffect(() => {
    const totalDuration = mode === 'work' ? workDuration * 60 : breakDuration * 60;
    const progress = timeLeft / totalDuration;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, mode, workDuration, breakDuration]);

  // Pulse animation when timer is active
  useEffect(() => {
    if (isActive) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(pulse);
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (mode === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      setMode('break');
      setTimeLeft(breakDuration * 60);
      Alert.alert(
        'Work Session Complete! 🎉',
        'Time for a break. Take a moment to relax.',
        [{ text: 'Start Break', onPress: () => setIsActive(true) }]
      );
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
      Alert.alert(
        'Break Time Over! 💪',
        'Ready to focus on your next work session?',
        [
          { text: 'Not Yet', style: 'cancel' },
          { text: 'Start Work', onPress: () => setIsActive(true) }
        ]
      );
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateWorkDuration = (minutes: number) => {
    setWorkDuration(minutes);
    if (mode === 'work' && !isActive) {
      setTimeLeft(minutes * 60);
    }
  };

  const updateBreakDuration = (minutes: number) => {
    setBreakDuration(minutes);
    if (mode === 'break' && !isActive) {
      setTimeLeft(minutes * 60);
    }
  };

  const workDurationOptions = [15, 20, 25, 30, 35, 40, 45, 50];
  const breakDurationOptions = [3, 5, 10, 15, 20];

  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pomodoro Timer</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <MaterialIcons name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Mode Indicator */}
        <View style={styles.modeSection}>
          <Text style={styles.modeText}>
            {mode === 'work' ? '🍅 Work Time' : '☕ Break Time'}
          </Text>
          <Text style={styles.modeDescription}>
            {mode === 'work' 
              ? 'Focus on your current task' 
              : 'Relax and recharge yourself'
            }
          </Text>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={styles.progressCircle}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  height: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['100%', '0%'],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.timerDisplay,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerLabel}>
                {mode === 'work' ? 'Focus' : 'Break'}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetTimer}
          >
            <MaterialIcons name="refresh" size={32} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.playButton, isActive && styles.activeButton]}
            onPress={toggleTimer}
          >
            <MaterialIcons
              name={isActive ? "pause" : "play-arrow"}
              size={48}
              color="#ffffff"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setMode(mode === 'work' ? 'break' : 'work')}
          >
            <MaterialIcons name="swap-horiz" size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedPomodoros}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{workDuration}m</Text>
            <Text style={styles.statLabel}>Work</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{breakDuration}m</Text>
            <Text style={styles.statLabel}>Break</Text>
          </View>
        </View>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.settingsModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Timer Settings</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Work Duration */}
              <View style={styles.settingSection}>
                <Text style={styles.settingTitle}>Work Duration</Text>
                <View style={styles.optionGrid}>
                  {workDurationOptions.map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.optionButton,
                        workDuration === minutes && styles.selectedOption,
                      ]}
                      onPress={() => updateWorkDuration(minutes)}
                    >
                      <Text style={styles.optionText}>{minutes}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Break Duration */}
              <View style={styles.settingSection}>
                <Text style={styles.settingTitle}>Break Duration</Text>
                <View style={styles.optionGrid}>
                  {breakDurationOptions.map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.optionButton,
                        breakDuration === minutes && styles.selectedOption,
                      ]}
                      onPress={() => updateBreakDuration(minutes)}
                    >
                      <Text style={styles.optionText}>{minutes}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 8,
  },
  modeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  timerDisplay: {
    alignItems: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  activeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModal: {
    backgroundColor: '#144272',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingSection: {
    marginBottom: 30,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});