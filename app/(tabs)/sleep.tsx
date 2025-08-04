import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlayerModal } from '@/components/PlayerModal';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { MiniPlayer } from '@/components/MiniPlayer';
import { getSleepContent, ContentItem } from '@/services/contentService';
import { useAudio } from '@/contexts/AudioContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

interface SleepContent {
  sleepyMusic: ContentItem[];
  stories: ContentItem[];
  meditation: ContentItem[];
  whiteNoise: ContentItem[];
}

const ContentCard = ({ item, onPress }: { 
  item: ContentItem; 
  onPress: () => void;
}) => {
  const [isDownloaded, setIsDownloaded] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { isAudioDownloaded, downloadAudio } = useAudio();

  React.useEffect(() => {
    checkDownloadStatus();
  }, [item.id]);

  const checkDownloadStatus = async () => {
    try {
      const downloaded = await isAudioDownloaded(item.id);
      setIsDownloaded(downloaded);
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  const handleDownloadClick = async (e: any) => {
    e.stopPropagation();
    
    if (isDownloaded || isDownloading || !item.audioUrl) return;

    setIsDownloading(true);
    try {
      await downloadAudio(item.id, item.audioUrl);
      setIsDownloaded(true);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getDownloadIcon = () => {
    if (isDownloading) return "hourglass-empty";
    if (isDownloaded) return "check-circle";
    return "download";
  };

  const getDownloadIconColor = () => {
    if (isDownloaded) return "#4CAF50";
    return "rgba(255, 255, 255, 0.9)";
  };

  return (
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
            onError={(error) => console.log('Image error:', error)}
            onLoad={() => console.log('Image loaded:', item.thumbnail)}
          />
          <View style={styles.cardOverlay} />
          <MaterialIcons 
            name={item.icon as any} 
            size={36} 
            color="rgba(255, 255, 255, 0.8)" 
            style={styles.cardIcon}
          />
          <TouchableOpacity 
            style={[styles.downloadButton, isDownloaded && styles.downloadedButton]}
            onPress={handleDownloadClick}
            disabled={isDownloaded || isDownloading}
          >
            <MaterialIcons 
              name={getDownloadIcon() as any}
              size={20} 
              color={getDownloadIconColor()}
            />
          </TouchableOpacity>
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
          <TouchableOpacity 
            style={[styles.downloadButton, isDownloaded && styles.downloadedButton]}
            onPress={handleDownloadClick}
            disabled={isDownloaded || isDownloading}
          >
            <MaterialIcons 
              name={getDownloadIcon() as any}
              size={20} 
              color={getDownloadIconColor()}
            />
          </TouchableOpacity>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDuration}>{item.duration}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

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
  const { currentItem } = useAudio();
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: CARD_WIDTH,
    height: 140,
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