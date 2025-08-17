import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@somnio_onboarding_completed";

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);

  const onboardingPages = [
    {
      title: "Welcome to Somnio",
      description: "Your personal wellness companion for better sleep, focus, and relaxation",
      gradient: ["#667eea", "#764ba2"] as [string, string, ...string[]],
    },
    {
      title: "Better Sleep",
      description: "Drift off to peaceful sleep with calming sounds and guided meditations",
      gradient: ["#f093fb", "#f5576c"] as [string, string, ...string[]],
    },
    {
      title: "Stay Focused",
      description: "Boost your productivity with focus timers and concentration exercises",
      gradient: ["#4facfe", "#00f2fe"] as [string, string, ...string[]],
    },
    {
      title: "Relax & Unwind",
      description: "Take a break with breathing exercises and stretching routines",
      gradient: ["#43e97b", "#38f9d7"] as [string, string, ...string[]],
    },
  ];

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(tabs)");
    }
  };

  const currentPageData = onboardingPages[currentPage];

  return (
    <LinearGradient colors={currentPageData.gradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {currentPage < onboardingPages.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{currentPageData.title}</Text>
          <Text style={styles.description}>{currentPageData.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {onboardingPages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentPage && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {currentPage < onboardingPages.length - 1 ? (
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
  content: {
    flex: 1,
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
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    opacity: 0.3,
    marginHorizontal: 5,
  },
  paginationDotActive: {
    opacity: 1,
    width: 30,
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