import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { breathingGradient } from "@/constants/onboardingData";
import { getColorSettings } from "@/services/colorSettingsService";

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width - 80;
const SLIDER_HEIGHT = 60;
const BUTTON_SIZE = 52;

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  originalPrice?: string;
  isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    title: "Monthly Plan",
    price: "$1.99",
    period: "per month",
  },
  {
    id: "yearly",
    title: "Yearly Plan",
    price: "$19.99",
    period: "per year",
    originalPrice: "$23.88",
    isPopular: true,
  },
];

export default function PremiumPurchaseScreen() {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundColors, setBackgroundColors] = useState(breathingGradient);

  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);

  useEffect(() => {
    loadColorSettings();
  }, []);

  const loadColorSettings = async () => {
    try {
      const colorSettings = await getColorSettings();
      if (colorSettings.backgroundGradient) {
        setBackgroundColors(colorSettings.backgroundGradient);
      }
    } catch (error) {
      console.error('Error loading color settings:', error);
      // Keep default colors
    }
  };

  const handleClose = () => {
    router.push("/(boarding)/ready");
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const processPurchase = () => {
    setIsProcessing(true);
    
    // Simulate purchase processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        "Purchase Successful!",
        "Thank you for upgrading to Premium. Enjoy ad-free experience!",
        [
          {
            text: "Continue",
            onPress: () => router.push("/(boarding)/ready"),
          },
        ]
      );
    }, 2000);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      // Reset if already completed
      if (isCompleted.value) {
        translateX.value = 0;
        isCompleted.value = false;
      }
    },
    onActive: (event) => {
      if (!isCompleted.value) {
        translateX.value = Math.max(0, Math.min(event.translationX, SLIDER_WIDTH - BUTTON_SIZE));
      }
    },
    onEnd: () => {
      if (translateX.value > SLIDER_WIDTH - BUTTON_SIZE - 20) {
        translateX.value = withSpring(SLIDER_WIDTH - BUTTON_SIZE);
        isCompleted.value = true;
        runOnJS(processPurchase)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(
      translateX.value,
      [0, SLIDER_WIDTH - BUTTON_SIZE],
      [0, 1]
    );
    
    return {
      backgroundColor: backgroundColor > 0.5 ? "#4CAF50" : "rgba(255, 255, 255, 0.2)",
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SLIDER_WIDTH - BUTTON_SIZE],
      [1, 0]
    );
    
    return {
      opacity,
    };
  });

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
          <View style={styles.titleContainer}>
            <Ionicons name="star" size={48} color="#FFD700" style={styles.starIcon} />
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Enjoy the same complete functionality with an ad-free experience
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>All meditation content included</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Complete feature access</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="remove-circle" size={24} color="#FF5722" />
              <Text style={styles.featureText}>No advertisements</Text>
            </View>
          </View>

          <View style={styles.pricingContainer}>
            {pricingPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.pricingCard,
                  selectedPlan === plan.id && styles.selectedCard,
                  plan.isPopular && styles.popularCard,
                ]}
                onPress={() => handlePlanSelect(plan.id)}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}
                <Text style={styles.planTitle}>{plan.title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  {plan.originalPrice && (
                    <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                  )}
                </View>
                <Text style={styles.period}>{plan.period}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sliderContainer}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.slider, backgroundAnimatedStyle]}>
                <Animated.Text style={[styles.sliderText, textAnimatedStyle]}>
                  {isProcessing ? "Processing..." : "Slide to Purchase"}
                </Animated.Text>
                <Animated.View style={[styles.sliderButton, buttonAnimatedStyle]}>
                  {isProcessing ? (
                    <Animated.View style={styles.loadingIndicator}>
                      <Text style={styles.loadingText}>⟳</Text>
                    </Animated.View>
                  ) : (
                    <Ionicons name="arrow-forward" size={24} color="#ffffff" />
                  )}
                </Animated.View>
              </Animated.View>
            </PanGestureHandler>
          </View>

          <Text style={styles.disclaimer}>
            Cancel anytime. Free version includes all features with ads.
          </Text>
        </Animated.View>
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
    alignItems: "flex-start",
  },
  closeButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  starIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 40,
    alignSelf: "stretch",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 12,
    flex: 1,
  },
  pricingContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  selectedCard: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
  },
  popularCard: {
    borderColor: "#4CAF50",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  originalPrice: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    textDecorationLine: "line-through",
  },
  period: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  sliderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  sliderButton: {
    position: "absolute",
    left: 4,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingIndicator: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    color: "#4CAF50",
  },
  disclaimer: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 16,
  },
});