import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudio } from '@/contexts/AudioContext';
import { useSleepTimer } from '@/hooks/useSleepTimer';

const { height: screenHeight } = Dimensions.get('window');

interface SleepTimerProps {
  visible: boolean;
  onClose: () => void;
}

const TIMER_OPTIONS = [1, 5, 10, 15, 30, 45, 60, 120];

export function SleepTimer({ visible, onClose }: SleepTimerProps) {
  const { 
    setSleepTimer: setAudioContextTimer, 
    cancelSleepTimer: cancelAudioContextTimer 
  } = useAudio();
  
  const {
    timerMinutes,
    timeRemaining,
    startTimer,
    cancelTimer,
  } = useSleepTimer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTimerSelect = (minutes: number) => {
    startTimer(minutes);
    setAudioContextTimer(minutes); // Sync with audio context for UI
    onClose();
  };

  const handleCancel = () => {
    cancelTimer();
    cancelAudioContextTimer(); // Sync with audio context for UI
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <LinearGradient
          colors={['#0A2647', '#144272']}
          style={styles.content}
        >
          <View style={styles.header}>
            <MaterialIcons name="access-time" size={32} color="#ffffff" />
            <Text style={styles.title}>Sleep Timer</Text>
            {timeRemaining && (
              <Text style={styles.remainingTime}>
                {formatTime(timeRemaining)} remaining
              </Text>
            )}
          </View>

          {timerMinutes ? (
            <View style={styles.activeTimerContainer}>
              <Text style={styles.activeTimerText}>
                Timer set for {timerMinutes} minutes
              </Text>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel Timer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitle}>Set timer to stop music after:</Text>
              
              <View style={styles.optionsGrid}>
                {TIMER_OPTIONS.map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={styles.optionButton}
                    onPress={() => handleTimerSelect(minutes)}
                  >
                    <Text style={styles.optionText}>
                      {minutes} {minutes === 1 ? 'minute' : 'minutes'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.customButton}
                onPress={() => {
                  // Could add custom time picker here
                  handleTimerSelect(10); // Default for now
                }}
              >
                <MaterialIcons name="edit" size={20} color="#ffffff" />
                <Text style={styles.customButtonText}>Custom Time</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  remainingTime: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 8,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  customButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  activeTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTimerText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});