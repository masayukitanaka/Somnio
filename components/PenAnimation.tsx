import { View, StyleSheet, Image } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function PenAnimation() {
  const translateX = useSharedValue(-15);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Create zigzag writing animation
    translateX.value = withRepeat(
      withSequence(
        // Start position to first zigzag point
        withTiming(-12, { duration: 250, easing: Easing.linear }),
        // Zigzag motion moving right
        withTiming(-6, { duration: 200, easing: Easing.linear }),
        withTiming(0, { duration: 200, easing: Easing.linear }),
        withTiming(6, { duration: 200, easing: Easing.linear }),
        withTiming(12, { duration: 200, easing: Easing.linear }),
        withTiming(15, { duration: 200, easing: Easing.linear }),
        // Quick return to start
        withTiming(-15, { duration: 400, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );

    translateY.value = withRepeat(
      withSequence(
        // Start position to first zigzag point
        withTiming(-3, { duration: 250, easing: Easing.linear }),
        // Zigzag motion (up and down pattern)
        withTiming(3, { duration: 200, easing: Easing.linear }),
        withTiming(-3, { duration: 200, easing: Easing.linear }),
        withTiming(3, { duration: 200, easing: Easing.linear }),
        withTiming(-3, { duration: 200, easing: Easing.linear }),
        withTiming(3, { duration: 200, easing: Easing.linear }),
        // Quick return to start
        withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: 0.9,
    };
  });

  return (
    <Animated.View style={[styles.pen, animatedStyle]}>
      <Image
        source={require('../assets/images/pen.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pen: {
    marginTop: 20,
    marginBottom: -30,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  image: {
    width: 72,
    height: 72,
  },
});