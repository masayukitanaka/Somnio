import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';

export default function CoffeeSteamAnimation() {
  // Steam animation refs
  const steam1Anim = useRef(new Animated.Value(0)).current;
  const steam2Anim = useRef(new Animated.Value(0)).current;
  const steam3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create steam animation loop
    const createSteamAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations with different delays
    Animated.parallel([
      createSteamAnimation(steam1Anim, 0),
      createSteamAnimation(steam2Anim, 1000),
      createSteamAnimation(steam3Anim, 2000),
    ]).start();
  }, [steam1Anim, steam2Anim, steam3Anim]);

  // Helper function to create steam particles
  const renderSteam = (animValue: Animated.Value, index: number) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -50],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1.5],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.steam,
          {
            transform: [
              { translateY },
              { translateX: index === 0 ? -10 : index === 1 ? 0 : 10 },
              { scale },
            ],
            opacity,
          },
        ]}
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
        {renderSteam(steam1Anim, 0)}
        {renderSteam(steam2Anim, 1)}
        {renderSteam(steam3Anim, 2)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coffeeContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 0,
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