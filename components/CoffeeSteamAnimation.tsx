import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

export default function CoffeeSteamAnimation() {
  // Steam animation shared values
  const steam1Progress = useSharedValue(0);
  const steam2Progress = useSharedValue(0);
  const steam3Progress = useSharedValue(0);

  useEffect(() => {
    // Start animations with different delays
    steam1Progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );

    steam2Progress.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );

    steam3Progress.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, []);

  // Helper function to create steam particles
  const renderSteam = (progress: Animated.SharedValue<number>, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(progress.value, [0, 1], [0, -50]);
      const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0.8, 0]);
      const scale = interpolate(progress.value, [0, 1], [0.5, 1.5]);

      return {
        transform: [
          { translateY },
          { translateX: index === 0 ? -10 : index === 1 ? 0 : 10 },
          { scale },
        ],
        opacity,
      };
    });

    return (
      <Animated.View
        key={index}
        style={[styles.steam, animatedStyle]}
      />
    );
  };

  return (
    <View style={styles.coffeeContainer}>
      <Image 
        source={require('../assets/images/coffeecup.png')} 
        style={styles.coffeeImage}
      />
      <View style={styles.steamContainer}>
        {renderSteam(steam1Progress, 0)}
        {renderSteam(steam2Progress, 1)}
        {renderSteam(steam3Progress, 2)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coffeeContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: -30,
    position: 'relative',
  },
  coffeeImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  steamContainer: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 40,
    alignItems: 'center',
  },
  steam: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});