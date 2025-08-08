import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { clearApiCache, clearThumbnailCache } from '@/services/contentService';

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
  { code: 'ja', name: '日本語' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
];

const AVAILABLE_AUDIO_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function ProfileScreen() {
  const [uiLanguage, setUILanguage] = useState('en');
  const [audioLanguages, setAudioLanguages] = useState(['en']);
  const [saveBattery, setSaveBattery] = useState(false);
  const [showUILanguageModal, setShowUILanguageModal] = useState(false);
  const [showAudioLanguageModal, setShowAudioLanguageModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
    } catch (error) {
      console.error('Error saving UI language:', error);
    }
  };

  const saveAudioLanguages = async (languages: string[]) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEYS.AUDIO_LANGUAGES, JSON.stringify(languages));
      setAudioLanguages(languages);
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
      'Delete Cache',
      'This will clear all cached data including API responses and thumbnails. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearApiCache();
              await clearThumbnailCache();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
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
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        <RemoveAdsButton />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
            <ThemedText type="title" style={styles.headerTitle}>Settings</ThemedText>
            <ThemedText type="subtitle" style={styles.headerSubtitle}>
              Customize your experience
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
                  <Text style={styles.settingTitle}>UI Language</Text>
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
                  <Text style={styles.settingTitle}>Audio Language</Text>
                  <Text style={styles.settingSubtitle}>
                    {audioLanguages.map(lang => 
                      AVAILABLE_AUDIO_LANGUAGES.find(l => l.code === lang)?.name
                    ).join(', ')}
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
                  <Text style={styles.settingTitle}>Save Battery</Text>
                  <Text style={styles.settingSubtitle}>
                    Reduce background activity
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
                  <Text style={[styles.settingTitle, { color: '#EF4444' }]}>Delete Cache</Text>
                  <Text style={styles.settingSubtitle}>
                    Clear all cached data
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
                  <Text style={styles.settingTitle}>Terms and Conditions</Text>
                  <Text style={styles.settingSubtitle}>
                    View our terms of service
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
                  <Text style={styles.settingTitle}>Contact & Support</Text>
                  <Text style={styles.settingSubtitle}>
                    Get help and send feedback
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
              <Text style={styles.modalTitle}>Select UI Language</Text>
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
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Audio Language Modal */}
        {showAudioLanguageModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Audio Languages</Text>
              <Text style={styles.modalSubtitle}>Choose one or more languages</Text>
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
                <Text style={styles.modalCloseButtonText}>Done</Text>
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
});