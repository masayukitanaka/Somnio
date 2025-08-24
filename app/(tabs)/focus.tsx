import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { PlayerModal } from '@/components/PlayerModal';
import { MiniPlayer } from '@/components/MiniPlayer';
import { ContentCard } from '@/components/ContentCard';
import { BannerAd } from '@/components/BannerAd';
import PenAnimation from '@/components/PenAnimation';
import { getFocusContent, ContentItem, clearApiCache } from '@/services/contentService';
import { useAudio } from '@/contexts/AudioContext';
import { contentTabTranslations, getCurrentLanguage, getTranslation } from '@/utils/i18n';
import { FavoriteService } from '@/services/favoriteService';
import { useTheme } from '@/contexts/ThemeContext';
import { useRewardAd } from '@/contexts/RewardAdContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

// Sort content to prioritize favorites first
const sortContentByFavorites = async (items: ContentItem[]): Promise<ContentItem[]> => {
  const favorites = await FavoriteService.getFavorites();
  const favoriteSet = new Set(favorites);
  
  return items.sort((a, b) => {
    const aIsFavorite = favoriteSet.has(a.id);
    const bIsFavorite = favoriteSet.has(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });
};

interface FocusContent {
  workMusic: ContentItem[];
  quickMeditation: ContentItem[];
}

const ContentSection = ({ title, data, icon, onItemPress, onFavoriteChange, isLoading, refreshKey }: { 
  title: string; 
  data: ContentItem[]; 
  icon?: string; 
  onItemPress: (item: ContentItem) => void;
  onFavoriteChange?: () => void;
  isLoading?: boolean;
  refreshKey?: number;
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
            key={`${item.id}-${refreshKey}`}
            item={item} 
            onPress={() => onItemPress(item)}
            onFavoriteChange={onFavoriteChange}
          />
        )}
        keyExtractor={(item) => `${item.id}-${refreshKey}`}
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
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [content, setContent] = useState<FocusContent>({
    workMusic: [],
    quickMeditation: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { currentItem } = useAudio();
  const isFocused = useIsFocused();
  const [refreshKey, setRefreshKey] = useState(0);
  const [saveBattery, setSaveBattery] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { showRewardedAd } = useRewardAd();

  useEffect(() => {
    loadContent();
    loadSaveBatterySetting();
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const language = await getCurrentLanguage();
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error loading current language:', error);
    }
  };

  // Translation helper function
  const t = (key: string) => getTranslation(contentTabTranslations, key, currentLanguage);

  const loadSaveBatterySetting = async () => {
    try {
      const stored = await AsyncStorage.getItem('save_battery');
      if (stored) {
        setSaveBattery(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading save battery setting:', error);
    }
  };

  // Force refresh when screen gains focus
  useEffect(() => {
    const checkCacheCleared = async () => {
      if (isFocused) {
        try {
          // Check if cache was cleared or languages changed
          const cacheCleared = await AsyncStorage.getItem('cache_cleared');
          const languagesChanged = await AsyncStorage.getItem('languages_changed');
          
          if (cacheCleared === 'true') {
            // Clear the API cache to force fresh data
            await clearApiCache();
            
            // Remove the flag
            await AsyncStorage.removeItem('cache_cleared');
            
            // Reload content from API
            await loadContent();
          } else if (languagesChanged === 'true') {
            // Remove the flag
            await AsyncStorage.removeItem('languages_changed');
            
            // Reload content from API with new language filter
            await loadContent();
          }
          
          // Always update refresh key when focused
          setRefreshKey(prev => prev + 1);
          
          // Reload save battery setting when focused
          await loadSaveBatterySetting();
          
          // Reload current language when focused
          await loadCurrentLanguage();
        } catch (error) {
          console.error('Error checking cache cleared flag:', error);
        }
      }
    };
    
    checkCacheCleared();
  }, [isFocused]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const focusContent = await getFocusContent();
      
      // Sort each category by favorites
      const sortedContent = {
        workMusic: await sortContentByFavorites(focusContent.workMusic),
        quickMeditation: await sortContentByFavorites(focusContent.quickMeditation),
      };
      
      setContent(sortedContent);
    } catch (error) {
      console.error('Error loading focus content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = async (item: ContentItem) => {
    const canAccess = await showRewardedAd();
    if (!canAccess) {
      console.log('User cancelled rewarded ad, not playing content');
      return;
    }
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleFavoriteChange = () => {
    // Reload and re-sort content when favorites change
    loadContent();
  };

  const handleToolPress = async (toolAction: () => void, toolName: string) => {
    const canAccess = await showRewardedAd();
    if (!canAccess) {
      console.log(`User cancelled rewarded ad, not accessing ${toolName}`);
      return;
    }
    toolAction();
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

  const handleSudoku = () => {
    router.push('/sudoku');
  };

  const handleMeditationTimer = () => {
    router.push('/meditation-timer');
  };


  return (
    <>
      <LinearGradient
        colors={colors.backgroundGradient as readonly [string, string, ...string[]]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={colors.backgroundGradient[0]} />
          <RemoveAdsButton />
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            
            {/* Hero Image Section */}
            <View style={styles.heroSection}>
              <ThemedView style={[styles.heroContent, { backgroundColor: 'transparent' }]}>
                <ThemedText type="title" style={styles.heroTitle}>{t('focus')}</ThemedText>
                <ThemedText type="subtitle" style={styles.heroSubtitle}>
                  {t('enhance_concentration')}
                </ThemedText>
              </ThemedView>
              {!saveBattery && (
                <View style={styles.heroImageContainer}>
                  <PenAnimation />
                </View>
              )}
            </View>

            {/* Tool Buttons */}
            <View style={styles.toolsSection}>
              <ThemedText type="defaultSemiBold" style={styles.toolsSectionTitle}>
                {t('productivity_tools')}
              </ThemedText>
              <View style={styles.toolsGrid}>
                <ToolButton
                  title="Meditation Timer"
                  icon="self-improvement"
                  onPress={() => handleToolPress(handleMeditationTimer, 'Meditation Timer')}
                  color="rgba(123, 104, 238, 0.8)"
                />
                <ToolButton
                  title={t('pomodoro_timer')}
                  icon="timer"
                  onPress={() => handleToolPress(handlePomodoroTimer, 'Pomodoro Timer')}
                  color="rgba(239, 68, 68, 0.8)"
                />
                <ToolButton
                  title={t('tasks')}
                  icon="assignment"
                  onPress={() => handleToolPress(handleTasks, 'Tasks')}
                  color="rgba(34, 197, 94, 0.8)"
                />
                <ToolButton
                  title={t('journal')}
                  icon="book"
                  onPress={() => handleToolPress(handleJournal, 'Journal')}
                  color="rgba(99, 102, 241, 0.8)"
                />
                <ToolButton
                  title="Sudoku"
                  icon="grid-on"
                  onPress={() => handleToolPress(handleSudoku, 'Sudoku')}
                  color="rgba(251, 146, 60, 0.8)"
                />
              </View>
            </View>

            {/* Banner Ad */}
            <BannerAd />

            {/* Content Sections */}
            <ContentSection 
              title={t('work_music')} 
              data={content.workMusic} 
              icon="music-note" 
              onItemPress={handleItemPress}
              onFavoriteChange={handleFavoriteChange}
              isLoading={isLoading}
              refreshKey={refreshKey}
            />
            <ContentSection 
              title={t('quick_meditation')} 
              data={content.quickMeditation} 
              icon="self-improvement" 
              onItemPress={handleItemPress}
              onFavoriteChange={handleFavoriteChange}
              isLoading={isLoading}
              refreshKey={refreshKey}
            />

            <View style={styles.bottomPadding} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <PlayerModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onFavoriteChange={handleFavoriteChange}
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
    elevation: 5, // Android shadow only
    // iOS shadows removed to prevent warning
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
    elevation: 5, // Android shadow only
    // iOS shadows removed to prevent warning
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