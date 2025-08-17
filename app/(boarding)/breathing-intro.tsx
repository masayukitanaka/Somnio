import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { breathingExerciseConfig, breathingGradient } from "@/constants/onboardingData";

const { width } = Dimensions.get("window");

export default function BreathingIntroScreen() {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  
  const circleScale = useSharedValue(0.4);
  const circleOpacity = useSharedValue(0.3);

  // Typewriter effect for text groups
  useEffect(() => {
    const textGroups = breathingExerciseConfig.textGroups;
    
    if (currentGroupIndex >= textGroups.length) {
      // All text groups shown, start breathing exercise
      setTimeout(() => {
        setShowBreathingExercise(true);
        startBreathingAnimation();
      }, 1000);
      return;
    }

    const currentGroup = textGroups[currentGroupIndex];
    const fullText = currentGroup.join(" ");
    let charIndex = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        // Wait before showing next group
        setTimeout(() => {
          setCurrentGroupIndex(currentGroupIndex + 1);
        }, 2000);
      }
    }, 40); // Slightly faster for smoother experience

    return () => clearInterval(interval);
  }, [currentGroupIndex]);

  const startBreathingAnimation = () => {
    const { inhaleTime, holdTime, exhaleTime } = breathingExerciseConfig.breathingCycle;
    
    const breathingCycle = () => {
      // Inhale
      setBreathPhase("inhale");
      // Gentle vibration when starting to inhale
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      circleScale.value = withTiming(1, { duration: inhaleTime });
      circleOpacity.value = withTiming(0.8, { duration: inhaleTime });

      setTimeout(() => {
        // Hold
        setBreathPhase("hold");
        circleScale.value = withTiming(1, { duration: 100 });
        
        setTimeout(() => {
          // Exhale
          setBreathPhase("exhale");
          circleScale.value = withTiming(0.4, { duration: exhaleTime });
          circleOpacity.value = withTiming(0.3, { duration: exhaleTime });
          
          setTimeout(() => {
            breathingCycle(); // Repeat
          }, exhaleTime);
        }, holdTime);
      }, inhaleTime);
    };

    breathingCycle();
  };

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }],
      opacity: circleOpacity.value,
    };
  });

  const handleSkip = () => {
    // Navigate to language settings
    router.push("/(boarding)/language-settings");
  };

  const getBreathingInstruction = () => {
    const { instructions } = breathingExerciseConfig;
    switch (breathPhase) {
      case "inhale":
        return instructions.inhale;
      case "hold":
        return instructions.hold;
      case "exhale":
        return instructions.exhale;
      default:
        return "";
    }
  };

  return (
    <LinearGradient colors={breathingGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {!showBreathingExercise ? (
            <Animated.View 
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
              style={styles.textContainer}
            >
              <Text style={styles.introText}>{displayedText}</Text>
              <View style={styles.cursor} />
            </Animated.View>
          ) : (
            <Animated.View 
              entering={FadeIn.duration(1000)}
              style={styles.breathingContainer}
            >
              <View style={styles.circleContainer}>
                <Animated.View style={[styles.breathingCircle, animatedCircleStyle]} />
                <View style={styles.innerCircle} />
              </View>
              
              <Animated.Text 
                entering={FadeIn.duration(500)}
                style={styles.breathingInstruction}
              >
                {getBreathingInstruction()}
              </Animated.Text>

              <Text style={styles.continueHint}>
                {breathingExerciseConfig.continueHint}
              </Text>
            </Animated.View>
          )}
        </View>

        {showBreathingExercise && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/(boarding)/language-settings")} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  closeButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  introText: {
    fontSize: 28,
    fontWeight: "300",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: "#ffffff",
    marginLeft: 2,
    opacity: 0.8,
  },
  breathingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleContainer: {
    width: width * 0.6,
    height: width * 0.6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 60,
  },
  breathingCircle: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "#ffffff",
  },
  innerCircle: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: "rgba(26, 31, 58, 0.5)",
  },
  breathingInstruction: {
    fontSize: 24,
    fontWeight: "300",
    color: "#ffffff",
    marginBottom: 20,
    letterSpacing: 1,
  },
  continueHint: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 40,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});