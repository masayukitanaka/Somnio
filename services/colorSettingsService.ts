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

  // Added
  lavender: {
    name: 'Lavender',
    colors: {
      backgroundGradient: ['#7E5A9B', '#9C7BB5', '#B89FCF'], // 柔らかいラベンダー調
      tabBarBackground: '#7E5A9B',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.6)',
    },
  },

  sand: {
    name: 'Sand',
    colors: {
      backgroundGradient: ['#A68A64', '#BFA28D', '#D4C2A5'], // 落ち着いたベージュ
      tabBarBackground: '#A68A64',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.6)',
    },
  },

  zen: {
    name: 'Zen',
    colors: {
      backgroundGradient: ['#4F6D7A', '#6B8A96', '#8FA9B7'], // 静かなグレイッシュブルー
      tabBarBackground: '#4F6D7A',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.6)',
    },
  },

  meadow: {
    name: 'Meadow',
    colors: {
      backgroundGradient: ['#4A7C3A', '#6A9B55', '#8FB879'], // 草原をイメージした深緑
      tabBarBackground: '#4A7C3A',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.6)',
    },
  },

    autumnGlow: {
    name: 'Autumn Glow',
    colors: {
      backgroundGradient: ['#8A2D3B', '#641B2E', '#4A101B'], // 暗めに寄せて深い秋色
      tabBarBackground: '#641B2E',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.65)',
    },
  },

  vintageDusk: {
    name: 'Vintage Dusk',
    colors: {
      backgroundGradient: ['#604652', '#735557', '#8A6A70'], // ヴィンテージ感を保ちつつ暗め
      tabBarBackground: '#604652',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.65)',
    },
  },

  springMist: {
    name: 'Spring Mist',
    colors: {
      backgroundGradient: ['#5F7F5F', '#6F9270', '#7FA585'], // 淡い緑ではなく深めの落ち着いたグリーン
      tabBarBackground: '#5F7F5F',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.65)',
    },
  },

  blushSerenity: {
    name: 'Blush Serenity',
    colors: {
      backgroundGradient: ['#9C6C7C', '#B7838F', '#D9A5A9'], // パステルを避けてシックなピンク系に
      tabBarBackground: '#9C6C7C',
      tabBarBorder: 'rgba(255, 255, 255, 0.2)',
      tabActiveTint: '#FFFFFF',
      tabInactiveTint: 'rgba(255, 255, 255, 0.65)',
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