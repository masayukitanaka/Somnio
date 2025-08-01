import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';

export default function HomeScreen() {
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
        <ThemedText type="title">Somnio</ThemedText>
        <ThemedText type="subtitle">Your Journey to Better Sleep & Relaxation</ThemedText>
      </ThemedView>
      
        <ThemedView style={[styles.content, { backgroundColor: 'transparent' }]}>
        <ThemedText type="defaultSemiBold">Welcome Home</ThemedText>
        <ThemedText>
          Start your relaxation journey with Somnio. Choose from sleep sounds, 
          meditation sessions, or focus music to enhance your wellbeing.
        </ThemedText>
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
});