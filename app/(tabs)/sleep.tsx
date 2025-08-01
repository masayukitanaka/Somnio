import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlayerModal } from '@/components/PlayerModal';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

// Sample data for each section
const sleepyMusicData = [
  { id: '1', title: 'Peaceful Piano', duration: '45 min', color: '#4A628A', icon: 'piano' },
  { id: '2', title: 'Nature Sounds', duration: '60 min', color: '#5C769C', icon: 'forest' },
  { id: '3', title: 'Ambient Dreams', duration: '30 min', color: '#6E8AAE', icon: 'cloud' },
  { id: '4', title: 'Soft Guitar', duration: '40 min', color: '#7F9EC0', icon: 'music-note' },
];

const storyData = [
  { id: '1', title: 'The Enchanted Forest', duration: '25 min', color: '#B0A695', icon: 'auto-stories' },
  { id: '2', title: 'Journey to the Stars', duration: '30 min', color: '#C3B8A7', icon: 'star' },
  { id: '3', title: 'The Peaceful Village', duration: '20 min', color: '#D6CAB9', icon: 'home' },
  { id: '4', title: 'Ocean Adventures', duration: '35 min', color: '#E9DCCB', icon: 'waves' },
];

const meditationData = [
  { id: '1', title: 'Body Scan', duration: '15 min', color: '#7077A1', icon: 'accessibility' },
  { id: '2', title: 'Breathing Exercise', duration: '10 min', color: '#8289B3', icon: 'air' },
  { id: '3', title: 'Mindful Sleep', duration: '20 min', color: '#949BC5', icon: 'self-improvement' },
  { id: '4', title: 'Relaxation Journey', duration: '25 min', color: '#A6ADD7', icon: 'explore' },
];

const whiteNoiseData = [
  { id: '1', title: 'Rain Sounds', duration: '∞', color: '#2D5071', icon: 'water-drop' },
  { id: '2', title: 'Ocean Waves', duration: '∞', color: '#3F6283', icon: 'waves' },
  { id: '3', title: 'Fan Noise', duration: '∞', color: '#517495', icon: 'toys' },
  { id: '4', title: 'Pink Noise', duration: '∞', color: '#6386A7', icon: 'graphic-eq' },
];

const ContentCard = ({ item, index, onPress }: { item: any; index: number; onPress: () => void }) => (
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
      renderItem={({ item, index }) => (
        <ContentCard 
          item={item} 
          index={index} 
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

export default function SleepScreen() {
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
            <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
              <ThemedText type="title">Sleep</ThemedText>
              <ThemedText type="subtitle">Drift into peaceful dreams</ThemedText>
            </ThemedView>
            
            <ContentSection 
              title="Sleepy Music" 
              data={sleepyMusicData} 
              icon="music-note" 
              onItemPress={handleItemPress}
            />
            <ContentSection 
              title="Story" 
              data={storyData} 
              icon="menu-book" 
              onItemPress={handleItemPress}
            />
            <ContentSection 
              title="Sleep Meditation" 
              data={meditationData} 
              icon="spa" 
              onItemPress={handleItemPress}
            />
            <ContentSection 
              title="White Noise" 
              data={whiteNoiseData} 
              icon="hearing" 
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
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
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