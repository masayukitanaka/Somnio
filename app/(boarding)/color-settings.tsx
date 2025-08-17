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
} from "react-native-reanimated";
import { 
  presetThemes, 
  getColorSettings, 
  saveColorSettings,
  ColorSettings 
} from "@/services/colorSettingsService";
import { breathingGradient } from "@/constants/onboardingData";
import Carousel from "@/components/Carousel";
import ColorThemeCarouselItem from "@/components/ColorThemeCarouselItem";
import { getLanguageSettings } from "@/services/languageSettingsService";
import { useTheme } from '@/contexts/ThemeContext';

const translations = {
  en: {
    title: "Choose Your Theme",
    subtitle: "Swipe to explore different color themes",
    continueButton: "Get Started"
  },
  es: {
    title: "Elige Tu Tema",
    subtitle: "Desliza para explorar diferentes temas de color",
    continueButton: "Comenzar"
  },
  zh: {
    title: "选择您的主题",
    subtitle: "滑动探索不同的颜色主题",
    continueButton: "开始"
  },
  ja: {
    title: "テーマを選択",
    subtitle: "スワイプして異なるカラーテーマを探索",
    continueButton: "開始"
  }
};

const { width } = Dimensions.get("window");
const THEME_ITEM_WIDTH = 120;
const THEME_SPACING = 30;

export default function ColorSettingsScreen() {
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundColors, setBackgroundColors] = useState(breathingGradient);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { updateColors } = useTheme();

  const themeKeys = Object.keys(presetThemes);
  const themeData = themeKeys.map(key => ({
    key,
    ...presetThemes[key as keyof typeof presetThemes]
  }));

  const getCurrentTranslation = () => {
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const t = getCurrentTranslation();

  useEffect(() => {
    loadSettings();
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

  useEffect(() => {
    // Update background when theme changes
    const newColors = presetThemes[selectedTheme as keyof typeof presetThemes].colors.backgroundGradient;
    setBackgroundColors(newColors as [string, string, ...string[]]);
  }, [selectedTheme]);

  const loadSettings = async () => {
    try {
      const currentSettings = await getColorSettings();
      const matchingTheme = Object.entries(presetThemes).find(([_, theme]) => 
        JSON.stringify(theme.colors) === JSON.stringify(currentSettings)
      );
      
      if (matchingTheme) {
        setSelectedTheme(matchingTheme[0]);
      }
    } catch (error) {
      console.error('Error loading color settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeSelect = (themeKey: string) => {
    setSelectedTheme(themeKey);
  };

  const handleThemeSnap = (_index: number, theme: any) => {
    if (theme.key !== selectedTheme) {
      setSelectedTheme(theme.key);
    }
  };

  const handleContinue = async () => {
    try {
      const selectedColors = presetThemes[selectedTheme as keyof typeof presetThemes].colors;
      
      // Save using ThemeContext (same as profile.tsx)
      updateColors(selectedColors);
      
      // Also save using the service for compatibility
      await saveColorSettings(selectedColors);
      
      router.push("/(boarding)/premium-purchase");
    } catch (error) {
      console.error('Error saving color settings:', error);
      router.push("/(boarding)/premium-purchase");
    }
  };


  if (isLoading) {
    return (
      <Animated.View style={styles.container}>
        <LinearGradient colors={backgroundColors} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Loading state */}
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }



  return (
    <Animated.View style={styles.container}>
      <LinearGradient colors={backgroundColors} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safeArea}>

        <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>
              {t.subtitle}
            </Text>
          </View>

          <View style={styles.carouselContainer}>
            <Carousel
              data={themeData}
              renderItem={(theme, index, scrollX) => (
                <ColorThemeCarouselItem
                  theme={theme}
                  themeKey={theme.key}
                  index={index}
                  scrollX={scrollX}
                  itemWidth={THEME_ITEM_WIDTH}
                  spacing={THEME_SPACING}
                  isSelected={selectedTheme === theme.key}
                  onSelect={handleThemeSelect}
                />
              )}
              itemWidth={THEME_ITEM_WIDTH}
              spacing={THEME_SPACING}
              onSnapToItem={handleThemeSnap}
              style={styles.carousel}
            />
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>{t.continueButton}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
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
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  carousel: {
    // Additional carousel styling if needed
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A2647",
  },
});