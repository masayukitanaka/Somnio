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

// Sample data for relaxation content
const ambientSoundsData = [
  { id: '1', title: 'Forest Birds', duration: '∞', color: '#2D5A27', icon: 'forest' },
  { id: '2', title: 'Ocean Waves', duration: '∞', color: '#1B4B5A', icon: 'waves' },
  { id: '3', title: 'Gentle Rain', duration: '∞', color: '#4A5568', icon: 'water-drop' },
  { id: '4', title: 'Crackling Fire', duration: '∞', color: '#B83280', icon: 'local-fire-department' },
];

const guidedMeditationData = [
  { id: '1', title: 'Mindful Breathing', duration: '10 min', color: '#553C9A', icon: 'air' },
  { id: '2', title: 'Body Relaxation', duration: '15 min', color: '#6B46C1', icon: 'accessibility' },
  { id: '3', title: 'Stress Relief', duration: '12 min', color: '#7C3AED', icon: 'self-improvement' },
  { id: '4', title: 'Inner Peace', duration: '20 min', color: '#8B5CF6', icon: 'spa' },
];

const natureSoundsData = [
  { id: '1', title: 'Mountain Stream', duration: '∞', color: '#065F46', icon: 'landscape' },
  { id: '2', title: 'Wind in Trees', duration: '∞', color: '#059669', icon: 'nature' },
  { id: '3', title: 'Night Crickets', duration: '∞', color: '#10B981', icon: 'nightlife' },
  { id: '4', title: 'Thunderstorm', duration: '∞', color: '#34D399', icon: 'thunderstorm' },
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

const ActionButton = ({ title, icon, onPress, color }: { title: string; icon: string; onPress: () => void; color: string }) => (
  <TouchableOpacity 
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <MaterialIcons name={icon as any} size={32} color="#ffffff" />
    <Text style={styles.actionButtonText}>{title}</Text>
  </TouchableOpacity>
);

export default function RelaxScreen() {
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

  const handleBreathingExercise = () => {
    router.push('/breathing-exercise');
  };

  const handleStretch = () => {
    // TODO: Navigate to stretch exercise screen
    console.log('Navigate to stretch exercise');
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
                  name="spa" 
                  size={80} 
                  color="rgba(255, 255, 255, 0.3)" 
                />
              </View>
              <ThemedView style={[styles.heroContent, { backgroundColor: 'transparent' }]}>
                <ThemedText type="title" style={styles.heroTitle}>Relax</ThemedText>
                <ThemedText type="subtitle" style={styles.heroSubtitle}>
                  Unwind and let go of stress
                </ThemedText>
              </ThemedView>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <ThemedText type="defaultSemiBold" style={styles.actionSectionTitle}>
                Quick Activities
              </ThemedText>
              <View style={styles.actionButtons}>
                <ActionButton
                  title="Breathing"
                  icon="air"
                  onPress={handleBreathingExercise}
                  color="rgba(99, 102, 241, 0.8)"
                />
                <ActionButton
                  title="Streching"
                  icon="accessibility"
                  onPress={handleStretch}
                  color="rgba(16, 185, 129, 0.8)"
                />
              </View>
            </View>

            {/* Content Sections */}
            <ContentSection 
              title="Ambient Sounds" 
              data={ambientSoundsData} 
              icon="volume-up" 
              onItemPress={handleItemPress}
            />
            <ContentSection 
              title="Guided Meditation" 
              data={guidedMeditationData} 
              icon="self-improvement" 
              onItemPress={handleItemPress}
            />
            <ContentSection 
              title="Nature Sounds" 
              data={natureSoundsData} 
              icon="nature" 
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
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  actionSectionTitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});