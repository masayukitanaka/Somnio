import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';

export default function RelaxScreen() {
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
        <ThemedText type="title">Relax</ThemedText>
        <ThemedText type="subtitle">Unwind and let go of stress</ThemedText>
      </ThemedView>
      
        <ThemedView style={[styles.content, { backgroundColor: 'transparent' }]}>
        <ThemedText type="defaultSemiBold">Relaxation Techniques</ThemedText>
        <ThemedText>
          Discover breathing exercises, progressive muscle relaxation, 
          and mindfulness practices to help you unwind.
        </ThemedText>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Popular Sessions</ThemedText>
          <ThemedText>• 5-minute breathing exercise</ThemedText>
          <ThemedText>• Body scan meditation</ThemedText>
          <ThemedText>• Ocean waves relaxation</ThemedText>
          <ThemedText>• Progressive muscle relaxation</ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <ThemedText type="defaultSemiBold">Ambient Sounds</ThemedText>
          <ThemedText>• Forest birds</ThemedText>
          <ThemedText>• Gentle rain</ThemedText>
          <ThemedText>• Crackling fireplace</ThemedText>
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