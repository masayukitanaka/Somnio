import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { additionalScreenTranslations, getCurrentLanguage, getTranslation } from '@/utils/i18n';

const { width, height } = Dimensions.get('window');

const breathingPatterns = [
  { name: '4-4-4', inhale: 4, hold: 4, exhale: 4 },
  { name: '4-4-8', inhale: 4, hold: 4, exhale: 8 },
  { name: '5-5-5', inhale: 5, hold: 5, exhale: 5 },
  { name: '6-2-8', inhale: 6, hold: 2, exhale: 8 },
  { name: '7-4-8', inhale: 7, hold: 4, exhale: 8 },
];

const bpsOptions = [0.5, 1, 1.5, 2, 2.5, 3];

export default function BreathingExercise() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [counter, setCounter] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(breathingPatterns[1]); // Default to 4-4-8
  const [bps, setBps] = useState(1); // Breaths per second
  const [showSettings, setShowSettings] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const language = await getCurrentLanguage();
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error loading current language:', error);
    }
  };

  // Translation helper function
  const t = (key: string) => getTranslation(additionalScreenTranslations, key, currentLanguage);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      const phaseTime = 1000 / bps; // Time per second in milliseconds
      
      interval = setInterval(() => {
        setCounter((prevCounter) => {
          const newCounter = prevCounter + 1;
          
          if (phase === 'inhale' && newCounter >= selectedPattern.inhale) {
            setPhase('hold');
            return 0;
          } else if (phase === 'hold' && newCounter >= selectedPattern.hold) {
            setPhase('exhale');
            return 0;
          } else if (phase === 'exhale' && newCounter >= selectedPattern.exhale) {
            setPhase('inhale');
            setCycles(prev => prev + 1);
            return 0;
          }
          
          return newCounter;
        });
      }, phaseTime);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, selectedPattern, bps]);

  useEffect(() => {
    if (isActive) {
      if (phase === 'inhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: (selectedPattern.inhale * 1000) / bps,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: (selectedPattern.inhale * 1000) / bps,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (phase === 'hold') {
        // Keep current state during hold
      } else if (phase === 'exhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: (selectedPattern.exhale * 1000) / bps,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: (selectedPattern.exhale * 1000) / bps,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [phase, isActive, selectedPattern, bps]);

  const toggleExercise = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('inhale');
      setCounter(0);
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0.3);
    } else {
      setIsActive(true);
      setCycles(0);
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return t('inhale');
      case 'hold':
        return t('hold');
      case 'exhale':
        return t('exhale');
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return t('breathe_in_slowly');
      case 'hold':
        return t('hold_your_breath');
      case 'exhale':
        return t('breathe_out_slowly');
    }
  };

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
          <Text style={styles.headerTitle}>{t('breathing_exercise')}</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <MaterialIcons name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{cycles}</Text>
            <Text style={styles.statLabel}>{t('cycles')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{selectedPattern.name}</Text>
            <Text style={styles.statLabel}>{t('pattern')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bps}x</Text>
            <Text style={styles.statLabel}>{t('speed')}</Text>
          </View>
        </View>

        {/* Breathing Circle */}
        <View style={styles.breathingContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <View style={styles.innerCircle}>
              <Text style={styles.phaseText}>{getPhaseText()}</Text>
              <Text style={styles.counterText}>
                {selectedPattern[phase as keyof typeof selectedPattern] - counter}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>{getPhaseInstruction()}</Text>
          <Text style={styles.timerText}>
            {selectedPattern[phase as keyof typeof selectedPattern] - counter}{t('s_remaining')}
          </Text>
        </View>

        {/* Control Button */}
        <TouchableOpacity
          style={[styles.controlButton, isActive && styles.activeButton]}
          onPress={toggleExercise}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={isActive ? "pause" : "play-arrow"}
            size={36}
            color="#ffffff"
          />
          <Text style={styles.controlButtonText}>
            {isActive ? t('pause') : t('start')}
          </Text>
        </TouchableOpacity>

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
                <Text style={styles.modalTitle}>{t('settings')}</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Breathing Pattern */}
              <View style={styles.settingSection}>
                <Text style={styles.settingTitle}>{t('breathing_pattern')}</Text>
                <View style={styles.optionGrid}>
                  {breathingPatterns.map((pattern) => (
                    <TouchableOpacity
                      key={pattern.name}
                      style={[
                        styles.optionButton,
                        selectedPattern.name === pattern.name && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedPattern(pattern)}
                    >
                      <Text style={styles.optionText}>{pattern.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Speed */}
              <View style={styles.settingSection}>
                <Text style={styles.settingTitle}>{t('speed_bps')}</Text>
                <View style={styles.optionGrid}>
                  {bpsOptions.map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.optionButton,
                        bps === speed && styles.selectedOption,
                      ]}
                      onPress={() => setBps(speed)}
                    >
                      <Text style={styles.optionText}>{speed}x</Text>
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 50,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  innerCircle: {
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  counterText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 50,
  },
  instructionText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginHorizontal: 40,
    marginBottom: 40,
    gap: 8,
  },
  activeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    minWidth: 80,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});