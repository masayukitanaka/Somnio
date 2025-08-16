import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

export default function PenAnimation() {
  const translateX = useRef(new Animated.Value(-15)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const moveAnimation = Animated.loop(
      Animated.sequence([
        // Start position to first zigzag point
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -12,
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -3,
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        // Zigzag motion moving right
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -6,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 3,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -3,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 6,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 3,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 12,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -3,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 15,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 3,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        // Quick return to start
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -15,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    moveAnimation.start();

    return () => {
      moveAnimation.stop();
    };
  }, [translateX, translateY]);

  return (
    <Animated.View
      style={[
        styles.pen,
        {
          transform: [
            { translateX },
            { translateY },
          ],
          opacity: 0.9,
        },
      ]}
    >
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