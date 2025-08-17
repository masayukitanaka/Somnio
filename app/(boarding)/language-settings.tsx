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
  availableLanguages, 
  getLanguageSettings, 
  saveLanguageSettings,
  LanguageSettings 
} from "@/services/languageSettingsService";
import { breathingGradient } from "@/constants/onboardingData";
import Carousel from "@/components/Carousel";
import LanguageCarouselItem from "@/components/LanguageCarouselItem";

const { width } = Dimensions.get("window");
const LANGUAGE_ITEM_WIDTH = width * 0.25;
const LANGUAGE_SPACING = 1;

export default function LanguageSettingsScreen() {
  const [uiLanguage, setUiLanguage] = useState('en');
  const [audioLanguages, setAudioLanguages] = useState<string[]>(['en']);
  const [isLoading, setIsLoading] = useState(true);

  const languageKeys = Object.keys(availableLanguages);
  const languageData = languageKeys.map(key => ({
    code: key,
    ...availableLanguages[key as keyof typeof availableLanguages]
  }));

  useEffect(() => {
    loadSettings();
  }, []);

  // Ensure English is always selected by default for audio languages
  useEffect(() => {
    if (!isLoading) {
      // Always ensure English is included in audio languages
      if (!audioLanguages || audioLanguages.length === 0 || !audioLanguages.includes('en')) {
        setAudioLanguages(['en']);
      }
    }
  }, [isLoading, audioLanguages]);

  const loadSettings = async () => {
    try {
      const settings = await getLanguageSettings();
      setUiLanguage(settings.uiLanguage);
      // Handle legacy single audioLanguage or new audioLanguages array
      if (settings.audioLanguages) {
        setAudioLanguages(settings.audioLanguages);
      } else if ((settings as any).audioLanguage) {
        setAudioLanguages([(settings as any).audioLanguage]);
      } else {
        // Always default to English for audio languages
        setAudioLanguages(['en']);
      }
    } catch (error) {
      console.error('Error loading language settings:', error);
      // Set English as default on error
      setAudioLanguages(['en']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      const settings: LanguageSettings = {
        uiLanguage,
        audioLanguages,
      };
      await saveLanguageSettings(settings);
      router.push("/(boarding)/color-settings");
    } catch (error) {
      console.error('Error saving language settings:', error);
      router.push("/(boarding)/color-settings");
    }
  };


  const handleAudioLanguageToggle = (languageCode: string) => {
    setAudioLanguages(prev => {
      if (!prev) return [languageCode];
      
      if (prev.includes(languageCode)) {
        // Don't allow removing the last language
        if (prev.length === 1) return prev;
        return prev.filter(code => code !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const handleLanguageSnap = (_index: number, language: any) => {
    if (language.code !== uiLanguage) {
      setUiLanguage(language.code);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={breathingGradient} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Loading state */}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={breathingGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Choose Your Languages</Text>
            <Text style={styles.subtitle}>
              Swipe left or right to browse languages
            </Text>
          </View>

          {/* UI Language Carousel */}
          <View style={styles.languageCarouselContainer}>
            <Text style={styles.sectionTitle}>UI Language</Text>
            
            <Carousel
              data={languageData}
              renderItem={(language, index, scrollX) => (
                <LanguageCarouselItem
                  language={language}
                  index={index}
                  scrollX={scrollX}
                  itemWidth={LANGUAGE_ITEM_WIDTH}
                  spacing={LANGUAGE_SPACING}
                />
              )}
              itemWidth={LANGUAGE_ITEM_WIDTH}
              spacing={LANGUAGE_SPACING}
              onSnapToItem={handleLanguageSnap}
              style={styles.carousel}
            />
          </View>

          {/* Audio Language Section */}
          <View style={styles.audioLanguageSection}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="musical-notes" size={24} color="#ffffff" style={styles.musicIcon} />
              <Text style={styles.sectionTitle}>Audio Languages</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Select languages for guided meditations (multiple selection allowed)
            </Text>
            
            <View style={styles.audioLanguagesContainer}>
              {Object.entries(availableLanguages).map(([code, language]) => {
                const isSelected = audioLanguages?.includes(code) || false;
                
                return (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.audioLanguageOption,
                      isSelected && styles.selectedAudioOption,
                    ]}
                    onPress={() => handleAudioLanguageToggle(code)}
                  >
                    <Text style={styles.audioFlag}>{language.flag}</Text>
                    <Text style={styles.audioLanguageName}>
                      {language.nativeName}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {audioLanguages && audioLanguages.length > 0 && (
              <View style={styles.selectedSummary}>
                <Text style={styles.summaryText}>
                  Selected: {audioLanguages.map(code => 
                    availableLanguages[code as keyof typeof availableLanguages]?.nativeName || code
                  ).join(' • ')}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
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
  languageCarouselContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  carousel: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  musicIcon: {
    marginRight: 8,
  },
  audioLanguageSection: {
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
    textAlign: "center",
  },
  audioLanguagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  audioLanguageOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: "45%",
  },
  selectedAudioOption: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  audioFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  audioLanguageName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    flex: 1,
  },
  selectedSummary: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
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
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A2647",
  },
});