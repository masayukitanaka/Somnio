import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudio } from '@/contexts/AudioContext';

const { height: screenHeight } = Dimensions.get('window');

interface VolumeSliderProps {
  visible: boolean;
  onClose: () => void;
}

export function VolumeSlider({ visible, onClose }: VolumeSliderProps) {
  const { volume, isMuted, toggleMute, adjustVolume } = useAudio();
  const [sliderValue, setSliderValue] = useState(volume);

  const handleSliderPress = (event: any) => {
    const { locationY } = event.nativeEvent;
    const sliderHeight = 200;
    const percentage = Math.max(0, Math.min(1, 1 - (locationY / sliderHeight)));
    setSliderValue(percentage);
    adjustVolume(percentage);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return 'volume-off';
    if (volume < 0.3) return 'volume-down';
    if (volume < 0.7) return 'volume-up';
    return 'volume-up';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
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
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            <MaterialIcons
              name={getVolumeIcon()}
              size={32}
              color={isMuted ? '#FF6B6B' : '#ffffff'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sliderContainer}
            onPress={handleSliderPress}
            activeOpacity={1}
          >
            <View style={styles.sliderTrack}>
              <View 
                style={[
                  styles.sliderFill, 
                  { height: `${isMuted ? 0 : (sliderValue * 100)}%` }
                ]} 
              />
              <View 
                style={[
                  styles.sliderThumb, 
                  { bottom: `${isMuted ? 0 : (sliderValue * 100)}%` }
                ]} 
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.volumeText}>
            {isMuted ? '0%' : `${Math.round(sliderValue * 100)}%`}
          </Text>
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
    right: 20,
    bottom: 200,
    width: 60,
    height: 280,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8, // Android shadow only
    // iOS shadows removed to prevent warning
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderContainer: {
    flex: 1,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTrack: {
    width: 6,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    left: -5,
    marginBottom: -8,
    elevation: 4, // Android shadow only
    // iOS shadows removed to prevent warning
  },
  volumeText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
  },
});