import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { PlayerModal } from '@/components/PlayerModal';
import PenAnimation from '@/components/PenAnimation';
import { getFocusContent, ContentItem } from '@/services/contentService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

interface FocusContent {
  workMusic: ContentItem[];
  quickMeditation: ContentItem[];
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
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [content, setContent] = useState<FocusContent>({
    workMusic: [],
    quickMeditation: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const focusContent = await getFocusContent();
      setContent(focusContent);
    } catch (error) {
      console.error('Error loading focus content:', error);
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

  const handlePomodoroTimer = () => {
    router.push('/pomodoro-timer');
  };

  const handleTasks = () => {
    router.push('/tasks');
  };

  const handleJournal = () => {
    router.push('/journal');
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
              <ThemedView style={[styles.heroContent, { backgroundColor: 'transparent' }]}>
                <ThemedText type="title" style={styles.heroTitle}>Focus</ThemedText>
                <ThemedText type="subtitle" style={styles.heroSubtitle}>
                  Enhance your concentration and productivity
                </ThemedText>
              </ThemedView>
              <View style={styles.heroImageContainer}>
                <PenAnimation />
              </View>
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
              data={content.workMusic} 
              icon="music-note" 
              onItemPress={handleItemPress}
              isLoading={isLoading}
            />
            <ContentSection 
              title="Quick Meditation" 
              data={content.quickMeditation} 
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