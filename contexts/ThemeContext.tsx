import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ColorSettings, getColorSettings, saveColorSettings, defaultColorSettings } from '@/services/colorSettingsService';

interface ThemeContextType {
  colors: ColorSettings;
  updateColors: (colors: ColorSettings) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColorSettings,
  updateColors: async () => {},
  isLoading: true,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colors, setColors] = useState<ColorSettings>(defaultColorSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      const savedColors = await getColorSettings();
      setColors(savedColors);
    } catch (error) {
      console.error('Error loading theme colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateColors = async (newColors: ColorSettings) => {
    try {
      await saveColorSettings(newColors);
      setColors(newColors);
    } catch (error) {
      console.error('Error updating theme colors:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, updateColors, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}