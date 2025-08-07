import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { PlayerModal } from '@/components/PlayerModal';
import { MiniPlayer } from '@/components/MiniPlayer';
import CoffeeSteamAnimation from '@/components/CoffeeSteamAnimation';
import { getRelaxContent, ContentItem } from '@/services/contentService';
import { useAudio } from '@/contexts/AudioContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

interface RelaxContent {
  calmingSounds: ContentItem[];
  guidedRelaxation: ContentItem[];
}

const ContentCard = ({ item, onPress }: { item: ContentItem; onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.card}
    activeOpacity={0.8}
    onPress={onPress}
  >
    {item.thumbnail ? (
      <View style={styles.cardBackground}>
        <Image 
          source={{ uri: item.thumbnail }}
          style={styles.cardImage}
          resizeMode="cover"
        />
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
      </View>
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
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [content, setContent] = useState<RelaxContent>({
    calmingSounds: [],
    guidedRelaxation: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { currentItem } = useAudio();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const relaxContent = await getRelaxContent();
      setContent(relaxContent);
    } catch (error) {
      console.error('Error loading relax content:', error);
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

  const handleBreathingExercise = () => {
    router.push('/breathing-exercise');
  };

  const handleStretch = () => {
    router.push('/stretching');
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
              <ThemedView style={[styles.heroContent, { backgroundColor: 'transparent' }]}>
                <ThemedText type="title" style={styles.heroTitle}>Relax</ThemedText>
                <ThemedText type="subtitle" style={styles.heroSubtitle}>
                  Unwind and let go of stress
                </ThemedText>
              </ThemedView>
              <CoffeeSteamAnimation />
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
              title="Calming Sounds" 
              data={content.calmingSounds} 
              icon="volume-up" 
              onItemPress={handleItemPress}
              isLoading={isLoading}
            />
            <ContentSection 
              title="Guided Relaxation" 
              data={content.guidedRelaxation} 
              icon="self-improvement" 
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
      <MiniPlayer onPress={() => {
        if (currentItem) {
          setSelectedItem(currentItem);
          setModalVisible(true);
        }
      }} />
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
    paddingTop: 40,
    paddingHorizontal: 20,
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
  cardImage: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    bottom: 0,
    width: CARD_WIDTH,
    height: 160,
    borderRadius: 20,
    backgroundColor: 'transparent',
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
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
});