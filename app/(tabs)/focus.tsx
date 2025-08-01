import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FocusScreen() {
  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        <ScrollView style={styles.scrollView}>
        <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
        <ThemedText type="title">Focus</ThemedText>
        <ThemedText type="subtitle">Enhance your concentration</ThemedText>
      </ThemedView>
      
        <ThemedView style={[styles.content, { backgroundColor: 'transparent' }]}>
        <ThemedText type="defaultSemiBold">Focus Sessions</ThemedText>
        <ThemedText>
          Boost your productivity with concentration music, binaural beats, 
          and guided focus meditations designed to enhance mental clarity.
        </ThemedText>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Study & Work</ThemedText>
          <ThemedText>• Instrumental focus music</ThemedText>
          <ThemedText>• Alpha wave binaural beats</ThemedText>
          <ThemedText>• 25-minute Pomodoro session</ThemedText>
          <ThemedText>• Lo-fi study beats</ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Meditation for Focus</ThemedText>
          <ThemedText>• 10-minute concentration meditation</ThemedText>
          <ThemedText>• Mindful attention training</ThemedText>
          <ThemedText>• Focus breathing exercise</ThemedText>
        </ThemedView>
      </ThemedView>
        </ScrollView>
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
    marginTop: 50,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  section: {
    marginTop: 20,
    gap: 8,
  },
});