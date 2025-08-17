import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeIn,
  FadeInUp,
  BounceIn,
} from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { breathingGradient } from "@/constants/onboardingData";
import { getColorSettings } from "@/services/colorSettingsService";
import { getLanguageSettings, availableLanguages } from "@/services/languageSettingsService";

const { width } = Dimensions.get("window");
const ONBOARDING_KEY = '@somnio_onboarding_completed';

const translations = {
  en: {
    title: "Ready!",
    subtitle: "Start your personalized meditation journey",
    description: "Somnio supports relaxation, focus, and quality sleep. Find peace of mind anytime, anywhere.",
    features: {
      sleep: "Support deep sleep",
      stress: "Reduce stress",
      focus: "Improve concentration"
    },
    button: "Start Experience"
  },
  es: {
    title: "¡Listo!",
    subtitle: "Comienza tu viaje de meditación personalizado",
    description: "Somnio apoya la relajación, el enfoque y el sueño de calidad. Encuentra paz mental en cualquier momento y lugar.",
    features: {
      sleep: "Apoyar el sueño profundo",
      stress: "Reducir el estrés",
      focus: "Mejorar la concentración"
    },
    button: "Comenzar Experiencia"
  },
  zh: {
    title: "准备就绪！",
    subtitle: "开始您的个性化冥想之旅",
    description: "Somnio支持放松、专注和优质睡眠。随时随地找到内心的平静。",
    features: {
      sleep: "支持深度睡眠",
      stress: "减轻压力",
      focus: "提高专注力"
    },
    button: "开始体验"
  },
  ja: {
    title: "準備完了！",
    subtitle: "あなただけの瞑想体験を始めましょう",
    description: "Somnioはリラックス、集中、そして質の高い睡眠をサポートします。いつでもどこでも、心の平穏を見つけてください。",
    features: {
      sleep: "深い睡眠をサポート",
      stress: "ストレス軽減",
      focus: "集中力向上"
    },
    button: "体験を始める"
  }
};

export default function ReadyScreen() {
  const [backgroundColors, setBackgroundColors] = useState(breathingGradient);
  const [currentLanguage, setCurrentLanguage] = useState('en');

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

  const handleGetStarted = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Navigate anyway
      router.replace("/(tabs)");
    }
  };

  const getCurrentTranslation = () => {
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const t = getCurrentTranslation();

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
          <View style={styles.iconContainer}>
            <Animated.View 
              entering={BounceIn.delay(300).duration(1000)}
              style={styles.checkIconWrapper}
            >
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </Animated.View>
          </View>

          <Animated.View 
            entering={FadeInUp.delay(500).duration(800)}
            style={styles.textContainer}
          >
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>
              {t.subtitle}
            </Text>
            <Text style={styles.description}>
              {t.description}
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(800).duration(800)}
            style={styles.featuresContainer}
          >
            <View style={styles.featureItem}>
              <Ionicons name="moon" size={24} color="#FFD700" />
              <Text style={styles.featureText}>{t.features.sleep}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="fitness" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>{t.features.stress}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={24} color="#FF9800" />
              <Text style={styles.featureText}>{t.features.focus}</Text>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(1000).duration(800)}
          style={styles.footer}
        >
          <TouchableOpacity onPress={handleGetStarted} style={styles.startButton}>
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.buttonGradient}
            >
              <Text style={styles.startButtonText}>{t.button}</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 40,
  },
  checkIconWrapper: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 50,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  featuresContainer: {
    alignSelf: "stretch",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  featureText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 16,
    flex: 1,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  startButton: {
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});