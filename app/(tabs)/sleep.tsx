import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlayerModal } from '@/components/PlayerModal';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { getSleepContent, ContentItem } from '@/services/contentService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

interface SleepContent {
  sleepyMusic: ContentItem[];
  stories: ContentItem[];
  meditation: ContentItem[];
  whiteNoise: ContentItem[];
}

const ContentCard = ({ item, onPress }: { item: ContentItem; onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.card}
    activeOpacity={0.8}
    onPress={onPress}
  >
    {item.thumbnail ? (
      <ImageBackground 
        source={{ uri: item.thumbnail }}
        style={styles.cardBackground}
        imageStyle={styles.cardBackgroundImage}
      >
        <View style={styles.cardOverlay} />
        <MaterialIcons 
          name={item.icon as any} 
          size={36} 
          color="rgba(255, 255, 255, 0.8)" 
          style={styles.cardIcon}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDuration}>{item.duration}</Text>
        </View>
      </ImageBackground>
    ) : (
      <View style={[styles.cardBackground, { backgroundColor: item.color }]}>
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
      </View>
    )}
  </TouchableOpacity>
);

const ContentSection = ({ title, data, icon, onItemPress, isLoading }: { 
  title: string; 
  data: ContentItem[]; 
  icon?: string; 
  onItemPress: (item: ContentItem) => void;
  isLoading?: boolean;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon && <MaterialIcons name={icon as any} size={24} color="#ffffff" style={styles.sectionIcon} />}
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{title}</ThemedText>
    </View>
    {isLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    ) : (
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
    )}
  </View>
);

export default function SleepScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [content, setContent] = useState<SleepContent>({
    sleepyMusic: [],
    stories: [],
    meditation: [],
    whiteNoise: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const sleepContent = await getSleepContent();
      setContent(sleepContent);
    } catch (error) {
      console.error('Error loading sleep content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = (item: ContentItem) => {
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
              data={content.sleepyMusic} 
              icon="music-note" 
              onItemPress={handleItemPress}
              isLoading={isLoading}
            />
            <ContentSection 
              title="Story" 
              data={content.stories} 
              icon="menu-book" 
              onItemPress={handleItemPress}
              isLoading={isLoading}
            />
            <ContentSection 
              title="Sleep Meditation" 
              data={content.meditation} 
              icon="spa" 
              onItemPress={handleItemPress}
              isLoading={isLoading}
            />
            <ContentSection 
              title="White Noise" 
              data={content.whiteNoise} 
              icon="hearing" 
              onItemPress={handleItemPress}
              isLoading={isLoading}
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardBackgroundImage: {
    borderRadius: 20,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
});