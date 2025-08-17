import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface Language {
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageCarouselItemProps {
  language: Language;
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  spacing: number;
}

export default function LanguageCarouselItem({
  language,
  index,
  scrollX,
  itemWidth,
  spacing,
}: LanguageCarouselItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (itemWidth + spacing),
      index * (itemWidth + spacing),
      (index + 1) * (itemWidth + spacing),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      'clamp'
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      'clamp'
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [15, 0, -15],
      'clamp'
    );

    return {
      transform: [
        { scale },
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.languageCard, { width: itemWidth }, animatedStyle]}>
      <Text style={styles.languageFlag}>{language.flag}</Text>
      <Text style={styles.nativeName}>{language.nativeName}</Text>
      <Text style={styles.languageName}>{language.name}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  languageCard: {
    height: 140,
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  languageFlag: {
    fontSize: 36,
    marginBottom: 8,
  },
  nativeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});