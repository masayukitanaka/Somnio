import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { clearApiCache, clearThumbnailCache, clearApiCacheForLanguageChange } from '@/services/contentService';
import { AudioAssetManager } from '@/services/AudioAssetManager';
import { profileTranslations, getCurrentLanguage, getTranslation } from '@/utils/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import { presetThemes, ColorSettings } from '@/services/colorSettingsService';

const termsUrl = 'https://example.com/terms'; // Replace with actual URL
const supportUrl = 'https://example.com/support'; // Replace with actual URL

// Settings keys for AsyncStorage
const SETTINGS_KEYS = {
  UI_LANGUAGE: 'ui_language',
  AUDIO_LANGUAGES: 'audio_languages',
  SAVE_BATTERY: 'save_battery',
};

const AVAILABLE_UI_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
];

const AVAILABLE_AUDIO_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function ProfileScreen() {
  const [uiLanguage, setUILanguage] = useState('en');
  const [audioLanguages, setAudioLanguages] = useState(['en']);
  const [saveBattery, setSaveBattery] = useState(false);
  const [showUILanguageModal, setShowUILanguageModal] = useState(false);
  const [showAudioLanguageModal, setShowAudioLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { colors, updateColors } = useTheme();

  useEffect(() => {
    loadSettings();
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const language = await getCurrentLanguage();
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error loading current language:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const storedUILang = await AsyncStorage.getItem(SETTINGS_KEYS.UI_LANGUAGE);
      const storedAudioLangs = await AsyncStorage.getItem(SETTINGS_KEYS.AUDIO_LANGUAGES);
      const storedSaveBattery = await AsyncStorage.getItem(SETTINGS_KEYS.SAVE_BATTERY);

      if (storedUILang) setUILanguage(storedUILang);
      if (storedAudioLangs) setAudioLanguages(JSON.parse(storedAudioLangs));
      if (storedSaveBattery) setSaveBattery(JSON.parse(storedSaveBattery));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveUILanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEYS.UI_LANGUAGE, language);
      setUILanguage(language);
      setCurrentLanguage(language); // Update current language for translations
    } catch (error) {
      console.error('Error saving UI language:', error);
    }
  };

  const saveAudioLanguages = async (languages: string[]) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEYS.AUDIO_LANGUAGES, JSON.stringify(languages));
      setAudioLanguages(languages);
      
      // Clear API cache to force refresh with new language filter
      await clearApiCacheForLanguageChange();
    } catch (error) {
      console.error('Error saving audio languages:', error);
    }
  };

  const saveBatterySettings = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEYS.SAVE_BATTERY, JSON.stringify(enabled));
      setSaveBattery(enabled);
    } catch (error) {
      console.error('Error saving battery settings:', error);
    }
  };

  const handleDeleteCache = () => {
    Alert.alert(
      t('delete_cache_title'),
      t('delete_cache_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Get instance of AudioAssetManager
              const audioAssetManager = AudioAssetManager.getInstance();
              
              // Clear all cached data
              await clearApiCache();
              await clearThumbnailCache();
              await audioAssetManager.clearAllAudioAssets();
              
              // Set a flag to indicate cache was cleared
              await AsyncStorage.setItem('cache_cleared', 'true');
              
              Alert.alert(t('success'), t('cache_cleared_success'));
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert(t('error'), t('failed_to_clear_cache'));
            }
          },
        },
      ]
    );
  };

  const handleTermsAndConditions = () => {
    Linking.openURL(termsUrl); // Replace with actual URL
  };

  const handleContactSupport = () => {
    Linking.openURL(supportUrl); // Replace with actual URL
  };

  // Translation helper function
  const t = (key: string) => getTranslation(profileTranslations, key, currentLanguage);

  const toggleAudioLanguage = (languageCode: string) => {
    const newLanguages = audioLanguages.includes(languageCode)
      ? audioLanguages.filter(lang => lang !== languageCode)
      : [...audioLanguages, languageCode];
    
    if (newLanguages.length > 0) {
      saveAudioLanguages(newLanguages);
    }
  };

  return (
    <LinearGradient
      colors={colors.backgroundGradient as readonly [string, string, ...string[]]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundGradient[0]} />
        <RemoveAdsButton />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
            <ThemedText type="title" style={styles.headerTitle}>{t('settings')}</ThemedText>
            <ThemedText type="subtitle" style={styles.headerSubtitle}>
              {t('customize_experience')}
            </ThemedText>
          </ThemedView>

          <View style={styles.content}>
            {/* UI Language Setting */}
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => setShowUILanguageModal(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="language" size={24} color="#ffffff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('ui_language')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {AVAILABLE_UI_LANGUAGES.find(lang => lang.code === uiLanguage)?.name}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            {/* Audio Language Setting */}
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => setShowAudioLanguageModal(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="record-voice-over" size={24} color="#ffffff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('audio_language')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {audioLanguages.map(lang => 
                      AVAILABLE_AUDIO_LANGUAGES.find(l => l.code === lang)?.name
                    ).join(', ')}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            {/* Theme Setting */}
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => setShowThemeModal(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="palette" size={24} color="#ffffff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('theme')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {Object.entries(presetThemes).find(
                      ([_, theme]) => JSON.stringify(theme.colors.backgroundGradient) === JSON.stringify(colors.backgroundGradient)
                    )?.[1].name || t('custom')}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            {/* Save Battery Setting */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="battery-saver" size={24} color="#ffffff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('save_battery')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {t('reduce_background_activity')}
                  </Text>
                </View>
              </View>
              <Switch
                value={saveBattery}
                onValueChange={saveBatterySettings}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#6366F1' }}
                thumbColor={saveBattery ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'}
              />
            </View>

            {/* Delete Cache Button */}
            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteCache}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="delete-sweep" size={24} color="#EF4444" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: '#EF4444' }]}>{t('delete_cache')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {t('clear_all_cached_data')}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <TouchableOpacity style={styles.settingItem} onPress={handleTermsAndConditions}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="description" size={24} color="#ffffff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('terms_and_conditions')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {t('view_terms_of_service')}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="open-in-new" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            {/* Contact & Support */}
            <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="support" size={24} color="#ffffff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('contact_support')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {t('get_help_and_feedback')}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="open-in-new" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>

        {/* UI Language Modal */}
        {showUILanguageModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('select_ui_language')}</Text>
              {AVAILABLE_UI_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.modalOption,
                    uiLanguage === language.code && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    saveUILanguage(language.code);
                    setShowUILanguageModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    uiLanguage === language.code && styles.modalOptionTextSelected
                  ]}>
                    {language.name}
                  </Text>
                  {uiLanguage === language.code && (
                    <MaterialIcons name="check" size={20} color="#6366F1" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowUILanguageModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Audio Language Modal */}
        {showAudioLanguageModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('select_audio_languages')}</Text>
              <Text style={styles.modalSubtitle}>{t('choose_one_or_more')}</Text>
              {AVAILABLE_AUDIO_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.modalOption,
                    audioLanguages.includes(language.code) && styles.modalOptionSelected
                  ]}
                  onPress={() => toggleAudioLanguage(language.code)}
                >
                  <View style={styles.modalOptionLeft}>
                    <Text style={styles.modalOptionFlag}>{language.flag}</Text>
                    <Text style={[
                      styles.modalOptionText,
                      audioLanguages.includes(language.code) && styles.modalOptionTextSelected
                    ]}>
                      {language.name}
                    </Text>
                  </View>
                  {audioLanguages.includes(language.code) && (
                    <MaterialIcons name="check" size={20} color="#6366F1" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAudioLanguageModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>{t('done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Theme Modal */}
        {showThemeModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('select_theme')}</Text>
              <ScrollView style={{ maxHeight: 400 }}>
                {Object.entries(presetThemes).map(([key, theme]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.themeOption}
                    onPress={() => {
                      updateColors(theme.colors);
                      setShowThemeModal(false);
                    }}
                  >
                    <View style={styles.themePreview}>
                      <LinearGradient
                        colors={theme.colors.backgroundGradient as readonly [string, string, ...string[]]}
                        style={styles.themeGradient}
                      />
                      <View 
                        style={[
                          styles.themeTabBar, 
                          { backgroundColor: theme.colors.tabBarBackground }
                        ]} 
                      />
                    </View>
                    <Text style={styles.themeName}>{theme.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowThemeModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  settingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalOptionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalOptionTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  themeOption: {
    marginBottom: 16,
    alignItems: 'center',
  },
  themePreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  themeGradient: {
    flex: 1,
  },
  themeTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeName: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
});