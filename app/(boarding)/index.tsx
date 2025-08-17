import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { onboardingConfig } from "@/constants/onboardingData";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "@somnio_onboarding_completed";

const onboardingPages = onboardingConfig.pages;

export default function OnboardingScreen() {
  const params = useLocalSearchParams<{ page?: string }>();
  const initialPage = params.page ? parseInt(params.page) : 0;
  const translateX = useSharedValue(-width * initialPage);
  const [currentIndex, setCurrentIndex] = React.useState(initialPage);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(tabs)");
    }
  };

  const goToPage = (index: number) => {
    if (index >= 0 && index < onboardingPages.length) {
      translateX.value = withSpring(-width * index, {
        damping: 20,
        stiffness: 100,
      });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex === onboardingConfig.breathingExerciseAfterPageIndex) {
      // Show breathing exercise after specified page
      router.push("/(boarding)/breathing-intro");
    } else if (currentIndex < onboardingPages.length - 1) {
      goToPage(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleGetStarted = () => {
    completeOnboarding();
  };

  // Removed pan gesture to prevent crashes

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.gradientContainer}>
        {onboardingPages.map((page, index) => {
          const animatedGradientStyle = useAnimatedStyle(() => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const opacity = interpolate(
              -translateX.value,
              inputRange,
              [0, 1, 0],
              "clamp"
            );

            return {
              opacity,
              position: "absolute" as const,
              width: "100%",
              height: "100%",
            };
          });

          return (
            <Animated.View key={index} style={animatedGradientStyle}>
              <LinearGradient colors={page.gradient} style={StyleSheet.absoluteFillObject} />
            </Animated.View>
          );
        })}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {currentIndex < onboardingPages.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.View style={[styles.pagesContainer, containerStyle]}>
            {onboardingPages.map((page, index) => {
              const pageAnimatedStyle = useAnimatedStyle(() => {
                const inputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ];

                const scale = interpolate(
                  -translateX.value,
                  inputRange,
                  [0.8, 1, 0.8],
                  "clamp"
                );

                const opacity = interpolate(
                  -translateX.value,
                  inputRange,
                  [0.3, 1, 0.3],
                  "clamp"
                );

                return {
                  transform: [{ scale }],
                  opacity,
                };
              });

              return (
                <Animated.View
                  key={index}
                  style={[styles.page, pageAnimatedStyle]}
                >
                  <Text style={styles.title}>{page.title}</Text>
                  <Text style={styles.description}>{page.description}</Text>
                </Animated.View>
              );
            })}
          </Animated.View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {onboardingPages.map((_, index) => {
              const dotAnimatedStyle = useAnimatedStyle(() => {
                const inputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ];

                const dotWidth = interpolate(
                  -translateX.value,
                  inputRange,
                  [10, 30, 10],
                  "clamp"
                );

                const opacity = interpolate(
                  -translateX.value,
                  inputRange,
                  [0.3, 1, 0.3],
                  "clamp"
                );

                return {
                  width: dotWidth,
                  opacity,
                };
              });

              return (
                <Animated.View
                  key={index}
                  style={[styles.paginationDot, dotAnimatedStyle]}
                />
              );
            })}
          </View>

          {currentIndex < onboardingPages.length - 1 ? (
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleGetStarted} style={styles.getStartedButton}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    alignItems: "flex-end",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
  },
  pagesContainer: {
    flex: 1,
    flexDirection: "row",
    width: width * onboardingPages.length,
  },
  page: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    alignItems: "center",
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  getStartedButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#764ba2",
  },
});