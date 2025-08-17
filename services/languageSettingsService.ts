import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_SETTINGS_KEY = 'language_settings';

export interface LanguageSettings {
  uiLanguage: string;
  audioLanguages: string[];
}

export const defaultLanguageSettings: LanguageSettings = {
  uiLanguage: 'en',
  audioLanguages: ['en'],
};

export const availableLanguages = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
};

export async function getLanguageSettings(): Promise<LanguageSettings> {
  try {
    const settingsString = await AsyncStorage.getItem(LANGUAGE_SETTINGS_KEY);
    if (settingsString) {
      return JSON.parse(settingsString);
    }
  } catch (error) {
    console.error('Error loading language settings:', error);
  }
  return defaultLanguageSettings;
}

export async function saveLanguageSettings(settings: LanguageSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving language settings:', error);
  }
}

export async function resetLanguageSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LANGUAGE_SETTINGS_KEY);
  } catch (error) {
    console.error('Error resetting language settings:', error);
  }
}