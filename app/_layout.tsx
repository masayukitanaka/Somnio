import { Stack } from "expo-router";
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const ONBOARDING_KEY = '@somnio_onboarding_completed';

const shouldAlwaysShowOnboarding = () => {
  const value = process.env.EXPO_PUBLIC_ALWAYS_ONBOARD;
  return value === '1' || value === 'true' || value === '"1"' || value === '"true"';
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      if (shouldAlwaysShowOnboarding()) {
        setHasCompletedOnboarding(false);
      } else {
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(onboardingCompleted === 'true');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!hasCompletedOnboarding) {
        router.replace('/(boarding)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, hasCompletedOnboarding]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider>
      <AudioProvider>
        <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0A2647',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="(boarding)" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="breathing-exercise" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="pomodoro-timer" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="tasks" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="journal" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="stretching" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
      </AudioProvider>
    </ThemeProvider>
  );
}
