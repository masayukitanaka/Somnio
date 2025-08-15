import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import MaskedView from "@react-native-masked-view/masked-view";

interface AnimatedCircleProps {
  size?: number;
}

export default function AnimatedCircle({ size = 300 }: AnimatedCircleProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const maxX = size / 2 - 20;
    const maxY = size / 2 - 20;
    
    translateX.value = withRepeat(
      withTiming(maxX, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    translateY.value = withRepeat(
      withTiming(maxY, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [size]);

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const dynamicStyles = {
    maskContainer: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    background: {
      width: size * 2,
      height: size * 2,
      left: -size / 2,
      top: -size / 2,
    },
    treeImage: {
      width: size + 100,
      height: size + 100,
      top: -50,
      left: -50,
    },
  };

  return (
    <View style={[styles.maskContainer, dynamicStyles.maskContainer]}>
      <MaskedView
        style={[styles.maskedBackground, dynamicStyles.maskContainer]}
        maskElement={
          <Image
            source={require("../assets/images/mask2.png")}
            style={[styles.maskImage, dynamicStyles.treeImage]}
            contentFit="cover"
          />
        }
      >
        <Animated.View style={[styles.background, dynamicStyles.background, animatedBackgroundStyle]}>
          <Image
            source={require("../assets/images/background.jpg")}
            style={styles.backgroundImage}
            contentFit="cover"
          />
        </Animated.View>
      </MaskedView>
      <Image
        source={require("../assets/images/tree_unmasked.png")}
        style={[styles.treeImage, dynamicStyles.treeImage]}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  maskContainer: {
    position: "relative",
    overflow: "hidden",
    alignSelf: "center",
  },
  background: {
    position: "absolute",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  maskedBackground: {
    position: "relative",
    overflow: "hidden",
  },
  maskImage: {
    position: "absolute",
    zIndex: 1,
  },
  treeImage: {
    position: "absolute",
    zIndex: 2,
  },
});