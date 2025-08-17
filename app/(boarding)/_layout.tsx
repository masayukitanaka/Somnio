import { Stack } from "expo-router";

export default function BoardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="breathing-intro" 
        options={{ 
          animation: "fade"
        }} 
      />
      <Stack.Screen 
        name="language-settings" 
        options={{ 
          animation: "fade"
        }} 
      />
      <Stack.Screen 
        name="color-settings" 
        options={{ 
          animation: "fade"
        }} 
      />
    </Stack>
  );
}