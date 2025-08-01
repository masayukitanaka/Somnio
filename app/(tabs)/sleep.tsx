import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SleepScreen() {
  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        <ScrollView style={styles.scrollView}>
        <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
        <ThemedText type="title">Sleep</ThemedText>
        <ThemedText type="subtitle">Drift into peaceful dreams</ThemedText>
      </ThemedView>
      
        <ThemedView style={[styles.content, { backgroundColor: 'transparent' }]}>
        <ThemedText type="defaultSemiBold">Sleep Stories & Sounds</ThemedText>
        <ThemedText>
          Choose from a collection of calming sleep stories, nature sounds, 
          and white noise to help you fall asleep peacefully.
        </ThemedText>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Tonight's Recommendations</ThemedText>
          <ThemedText>• Rain sounds for deep sleep</ThemedText>
          <ThemedText>• Bedtime story: The Enchanted Forest</ThemedText>
          <ThemedText>• 8-hour white noise</ThemedText>
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