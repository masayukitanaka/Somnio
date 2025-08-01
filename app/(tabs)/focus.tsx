import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { PlayerModal } from '@/components/PlayerModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

// Sample data for focus content
const workMusicData = [
  { id: '1', title: 'Lo-fi Study Beats', duration: '60 min', color: '#6366F1', icon: 'headphones' },
  { id: '2', title: 'Classical Focus', duration: '45 min', color: '#8B5CF6', icon: 'piano' },
  { id: '3', title: 'Ambient Workspace', duration: '90 min', color: '#EC4899', icon: 'work' },
  { id: '4', title: 'Electronic Focus', duration: '30 min', color: '#06B6D4', icon: 'equalizer' },
];

const quickMeditationData = [
  { id: '1', title: 'Focus Meditation', duration: '5 min', color: '#10B981', icon: 'center-focus-strong' },
  { id: '2', title: 'Clarity Boost', duration: '3 min', color: '#F59E0B', icon: 'lightbulb' },
  { id: '3', title: 'Mind Reset', duration: '7 min', color: '#EF4444', icon: 'refresh' },
  { id: '4', title: 'Concentration', duration: '10 min', color: '#8B5CF6', icon: 'psychology' },
];

const ContentCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: item.color }]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <MaterialIcons 
      name={item.icon as any} 
      size={36} 
      color="rgba(255, 255, 255, 0.6)" 
      style={styles.cardIcon}
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDuration}>{item.duration}</Text>
    </View>
  </TouchableOpacity>
);

const ContentSection = ({ title, data, icon, onItemPress }: { title: string; data: any[]; icon?: string; onItemPress: (item: any) => void }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon && <MaterialIcons name={icon as any} size={24} color="#ffffff" style={styles.sectionIcon} />}
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{title}</ThemedText>
    </View>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      renderItem={({ item }) => (
        <ContentCard 
          item={item} 
          onPress={() => onItemPress(item)}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
      decelerationRate="fast"
    />
  </View>
);

const ToolButton = ({ title, icon, onPress, color }: { title: string; icon: string; onPress: () => void; color: string }) => (
  <TouchableOpacity 
    style={[styles.toolButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <MaterialIcons name={icon as any} size={28} color="#ffffff" />
    <Text style={styles.toolButtonText}>{title}</Text>
  </TouchableOpacity>
);

export default function FocusScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleItemPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handlePomodoroTimer = () => {
    router.push('/pomodoro-timer');
  };

  const handleTasks = () => {
    // TODO: Navigate to tasks screen
    console.log('Navigate to tasks');
  };

  const handleJournal = () => {
    // TODO: Navigate to journal screen
    console.log('Navigate to journal');
  };

  const handleGoalSetting = () => {
    // TODO: Navigate to goal setting screen
    console.log('Navigate to goal setting');
  };

  return (
    <>
      <LinearGradient
        colors={['#0A2647', '#144272', '#205295']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
          <RemoveAdsButton />
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            
            {/* Hero Image Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroImageContainer}>
                <MaterialIcons 
                  name="psychology" 
                  size={80} 
                  color="rgba(255, 255, 255, 0.3)" 
                />
              </View>
              <ThemedView style={[styles.heroContent, { backgroundColor: 'transparent' }]}>
                <ThemedText type="title" style={styles.heroTitle}>Focus</ThemedText>
                <ThemedText type="subtitle" style={styles.heroSubtitle}>
                  Enhance your concentration and productivity
                </ThemedText>
              </ThemedView>
            </View>

            {/* Tool Buttons */}
            <View style={styles.toolsSection}>
              <ThemedText type="defaultSemiBold" style={styles.toolsSectionTitle}>
                Productivity Tools
              </ThemedText>
              <View style={styles.toolsGrid}>
                <ToolButton
                  title="Pomodoro Timer"
                  icon="timer"
                  onPress={handlePomodoroTimer}
                  color="rgba(239, 68, 68, 0.8)"
                />
                <ToolButton
                  title="Tasks"
                  icon="assignment"
                  onPress={handleTasks}
                  color="rgba(34, 197, 94, 0.8)"
                />
                <ToolButton
                  title="Journal"
                  icon="book"
                  onPress={handleJournal}
                  color="rgba(99, 102, 241, 0.8)"
                />
                <ToolButton
                  title="Goal Setting"
                  icon="flag"
                  onPress={handleGoalSetting}
                  color="rgba(245, 158, 11, 0.8)"
                />
              </View>
            </View>

            {/* Content Sections */}
            <ContentSection 
              title="Work Music" 
              data={workMusicData} 
              icon="music-note" 
              onItemPress={handleItemPress}
            />
            <ContentSection 
              title="Quick Meditation" 
              data={quickMeditationData} 
              icon="self-improvement" 
              onItemPress={handleItemPress}
            />

            <View style={styles.bottomPadding} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <PlayerModal
        visible={modalVisible}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  toolsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  toolsSectionTitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 20,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  toolButton: {
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  toolButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffffff',
  },
  listContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 20,
    marginRight: CARD_MARGIN * 2,
    padding: 20,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardContent: {
    gap: 8,
  },
  cardIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomPadding: {
    height: 100,
  },
});