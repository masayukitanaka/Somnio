import { Stack } from "expo-router";
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
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
