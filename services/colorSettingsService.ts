import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR_SETTINGS_KEY = 'color_settings';

export interface ColorSettings {
  backgroundGradient: string[];
  tabBarBackground: string;
  tabBarBorder: string;
  tabActiveTint: string;
  tabInactiveTint: string;
}

export const defaultColorSettings: ColorSettings = {
  backgroundGradient: ['#0A2647', '#144272', '#205295'],
  tabBarBackground: '#0A2647',
  tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  tabActiveTint: '#007AFF',
  tabInactiveTint: '#8E8E93',
};

export const presetThemes = {
  default: {
    name: 'Ocean Blue',
    colors: defaultColorSettings,
  },
  sunset: {
    name: 'Sunset',
    colors: {
      backgroundGradient: ['#FF6B6B', '#FF8E53', '#FFD93D'],
      tabBarBackground: '#FF6B6B',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.5)',
    },
  },
  forest: {
    name: 'Forest',
    colors: {
      backgroundGradient: ['#2C5F2D', '#4E8D4F', '#6FB85F'],
      tabBarBackground: '#2C5F2D',
      tabBarBorder: 'rgba(255, 255, 255, 0.15)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.6)',
    },
  },
  purple: {
    name: 'Purple Dream',
    colors: {
      backgroundGradient: ['#4A148C', '#7B1FA2', '#9C27B0'],
      tabBarBackground: '#4A148C',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.5)',
    },
  },
  dark: {
    name: 'Midnight',
    colors: {
      backgroundGradient: ['#000000', '#1a1a1a', '#2d2d2d'],
      tabBarBackground: '#000000',
      tabBarBorder: 'rgba(255, 255, 255, 0.1)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.4)',
    },
  },
};

export async function getColorSettings(): Promise<ColorSettings> {
  try {
    const settingsString = await AsyncStorage.getItem(COLOR_SETTINGS_KEY);
    if (settingsString) {
      return JSON.parse(settingsString);
    }
  } catch (error) {
    console.error('Error loading color settings:', error);
  }
  return defaultColorSettings;
}

export async function saveColorSettings(settings: ColorSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(COLOR_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving color settings:', error);
  }
}

export async function resetColorSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(COLOR_SETTINGS_KEY);
  } catch (error) {
    console.error('Error resetting color settings:', error);
  }
}