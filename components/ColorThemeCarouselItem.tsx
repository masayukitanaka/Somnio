import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface ColorTheme {
  name: string;
  colors: {
    backgroundGradient: string[];
  };
}

interface ColorThemeCarouselItemProps {
  theme: ColorTheme;
  themeKey: string;
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  spacing: number;
  isSelected: boolean;
  onSelect: (themeKey: string) => void;
}

export default function ColorThemeCarouselItem({
  theme,
  themeKey,
  index,
  scrollX,
  itemWidth,
  spacing,
  isSelected,
  onSelect,
}: ColorThemeCarouselItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (itemWidth + spacing),
      index * (itemWidth + spacing),
      (index + 1) * (itemWidth + spacing),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      'clamp'
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      'clamp'
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [25, 0, -25],
      'clamp'
    );

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, 20],
      'clamp'
    );

    return {
      transform: [
        { scale },
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { translateY },
      ],
      opacity,
    };
  });

  const handlePress = () => {
    onSelect(themeKey);
  };

  return (
    <Animated.View style={[styles.themeCard, { width: itemWidth }, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.themeButton,
          isSelected && styles.selectedThemeButton,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.colors.backgroundGradient}
          style={styles.themePreview}
        />
        
        <Text style={styles.themeName}>{theme.name}</Text>
        
        <Animated.View style={styles.colorDots}>
          {theme.colors.backgroundGradient.slice(0, 3).map((color, dotIndex) => (
            <Animated.View
              key={dotIndex}
              style={[
                styles.colorDot, 
                { backgroundColor: color },
                isSelected && styles.selectedColorDot
              ]}
            />
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  themeCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  themeButton: {
    alignItems: 'center',
    width: '100%',
  },
  selectedThemeButton: {
    transform: [{ scale: 1.05 }],
  },
  themePreview: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  colorDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedColorDot: {
    borderColor: '#ffffff',
    borderWidth: 2,
    transform: [{ scale: 1.2 }],
  },
});