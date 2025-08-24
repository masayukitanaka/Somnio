import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlayerModal } from '@/components/PlayerModal';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { MiniPlayer } from '@/components/MiniPlayer';
import { ContentCard } from '@/components/ContentCard';
import { BannerAd } from '@/components/BannerAd';
import { getSleepContent, ContentItem, clearApiCache } from '@/services/contentService';
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

interface SleepContent {
  sleepyMusic: ContentItem[];
  stories: ContentItem[];
  meditation: ContentItem[];
  whiteNoise: ContentItem[];
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

export default function SleepScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const { currentItem } = useAudio();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [content, setContent] = useState<SleepContent>({
    sleepyMusic: [],
    stories: [],
    meditation: [],
    whiteNoise: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { showRewardedAd } = useRewardAd();

  useEffect(() => {
    loadContent();
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
      const sleepContent = await getSleepContent();
      
      // Sort each category by favorites
      const sortedContent = {
        sleepyMusic: await sortContentByFavorites(sleepContent.sleepyMusic),
        stories: await sortContentByFavorites(sleepContent.stories),
        meditation: await sortContentByFavorites(sleepContent.meditation),
        whiteNoise: await sortContentByFavorites(sleepContent.whiteNoise),
      };
      
      setContent(sortedContent);
    } catch (error) {
      console.error('Error loading sleep content:', error);
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
            <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
              <ThemedText type="title">{t('sleep')}</ThemedText>
              <ThemedText type="subtitle">{t('drift_into_peaceful_dreams')}</ThemedText>
            </ThemedView>
            
            <ContentSection 
              title={t('sleepy_music')} 
              data={content.sleepyMusic} 
              icon="music-note" 
              onItemPress={handleItemPress}
              onFavoriteChange={handleFavoriteChange}
              isLoading={isLoading}
              refreshKey={refreshKey}
            />
            <ContentSection 
              title={t('story')} 
              data={content.stories} 
              icon="menu-book" 
              onItemPress={handleItemPress}
              onFavoriteChange={handleFavoriteChange}
              isLoading={isLoading}
              refreshKey={refreshKey}
            />
            
            {/* Banner Ad */}
            <BannerAd />
            
            <ContentSection 
              title={t('sleep_meditation')} 
              data={content.meditation} 
              icon="spa" 
              onItemPress={handleItemPress}
              onFavoriteChange={handleFavoriteChange}
              isLoading={isLoading}
              refreshKey={refreshKey}
            />
            <ContentSection 
              title={t('white_noise')} 
              data={content.whiteNoise} 
              icon="hearing" 
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
  downloadButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
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