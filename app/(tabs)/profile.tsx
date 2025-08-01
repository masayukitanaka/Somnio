import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';

export default function ProfileScreen() {
  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        <RemoveAdsButton />
        <ScrollView style={styles.scrollView}>
        <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText type="subtitle">Your wellness journey</ThemedText>
      </ThemedView>
      
        <ThemedView style={[styles.content, { backgroundColor: 'transparent' }]}>
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Sleep Stats</ThemedText>
          <ThemedText>• Average sleep: 7.5 hours</ThemedText>
          <ThemedText>• Sleep quality: Good</ThemedText>
          <ThemedText>• Sleep streak: 5 days</ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Meditation Progress</ThemedText>
          <ThemedText>• Total sessions: 42</ThemedText>
          <ThemedText>• Meditation streak: 7 days</ThemedText>
          <ThemedText>• Total mindful minutes: 315</ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Settings</ThemedText>
          <ThemedText>• Sleep reminders</ThemedText>
          <ThemedText>• Meditation reminders</ThemedText>
          <ThemedText>• Dark mode</ThemedText>
          <ThemedText>• Sound preferences</ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">About</ThemedText>
          <ThemedText>
            Somnio helps you achieve better sleep, relaxation, and focus 
            through scientifically-backed audio content and mindfulness practices.
          </ThemedText>
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