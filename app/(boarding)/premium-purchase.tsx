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
import { getLanguageSettings } from "@/services/languageSettingsService";

const translations = {
  en: {
    title: "Upgrade to Premium",
    subtitle: "Enjoy the same complete functionality with an ad-free experience",
    features: {
      content: "All meditation content included",
      access: "Complete feature access", 
      ads: "No advertisements"
    },
    monthlyPlan: "Monthly Plan",
    yearlyPlan: "Yearly Plan",
    perMonth: "per month",
    perYear: "per year",
    sliderText: "Slide to Purchase",
    processing: "Processing...",
    disclaimer: "Cancel anytime. Free version includes all features with ads.",
    successTitle: "Purchase Successful!",
    successMessage: "Thank you for upgrading to Premium. Enjoy ad-free experience!",
    continueButton: "Continue"
  },
  es: {
    title: "Actualizar a Premium",
    subtitle: "Disfruta de la misma funcionalidad completa con una experiencia sin anuncios",
    features: {
      content: "Todo el contenido de meditación incluido",
      access: "Acceso completo a funciones",
      ads: "Sin anuncios"
    },
    monthlyPlan: "Plan Mensual",
    yearlyPlan: "Plan Anual", 
    perMonth: "por mes",
    perYear: "por año",
    sliderText: "Desliza para Comprar",
    processing: "Procesando...",
    disclaimer: "Cancela en cualquier momento. La versión gratuita incluye todas las funciones con anuncios.",
    successTitle: "¡Compra Exitosa!",
    successMessage: "Gracias por actualizar a Premium. ¡Disfruta de la experiencia sin anuncios!",
    continueButton: "Continuar"
  },
  zh: {
    title: "升级到高级版",
    subtitle: "享受相同的完整功能和无广告体验",
    features: {
      content: "包含所有冥想内容",
      access: "完整功能访问",
      ads: "无广告"
    },
    monthlyPlan: "月度计划",
    yearlyPlan: "年度计划",
    perMonth: "每月",
    perYear: "每年", 
    sliderText: "滑动购买",
    processing: "处理中...",
    disclaimer: "随时取消。免费版包含所有功能和广告。",
    successTitle: "购买成功！",
    successMessage: "感谢您升级到高级版。享受无广告体验！",
    continueButton: "继续"
  },
  ja: {
    title: "プレミアムにアップグレード",
    subtitle: "同じ完全な機能を広告なしでお楽しみください",
    features: {
      content: "すべての瞑想コンテンツが含まれます",
      access: "完全な機能アクセス",
      ads: "広告表示なし"
    },
    monthlyPlan: "月額プラン",
    yearlyPlan: "年額プラン",
    perMonth: "月額",
    perYear: "年額",
    sliderText: "スライドして購入",
    processing: "処理中...",
    disclaimer: "いつでもキャンセル可能。無料版は広告付きですべての機能を含みます。",
    successTitle: "購入成功！",
    successMessage: "プレミアムへのアップグレードありがとうございます。広告なしの体験をお楽しみください！",
    continueButton: "続行"
  }
};

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

const getPricingPlans = (t: any): PricingPlan[] => [
  {
    id: "monthly",
    title: t.monthlyPlan,
    price: "$1.99",
    period: t.perMonth,
  },
  {
    id: "yearly",
    title: t.yearlyPlan,
    price: "$19.99",
    period: t.perYear,
    originalPrice: "$23.88",
    isPopular: true,
  },
];

export default function PremiumPurchaseScreen() {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundColors, setBackgroundColors] = useState(breathingGradient);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);

  const getCurrentTranslation = () => {
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const t = getCurrentTranslation();
  const pricingPlans = getPricingPlans(t);

  useEffect(() => {
    loadColorSettings();
    loadLanguageSettings();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      const languageSettings = await getLanguageSettings();
      setCurrentLanguage(languageSettings.uiLanguage);
    } catch (error) {
      console.error('Error loading language settings:', error);
      // Keep default language (English)
    }
  };

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
        t.successTitle,
        t.successMessage,
        [
          {
            text: t.continueButton,
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
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>
              {t.subtitle}
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>{t.features.content}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>{t.features.access}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="remove-circle" size={24} color="#FF5722" />
              <Text style={styles.featureText}>{t.features.ads}</Text>
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
                  {isProcessing ? t.processing : t.sliderText}
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
            {t.disclaimer}
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