import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, Dimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { ContentItem } from '@/services/contentService';
import { useAudio } from '@/contexts/AudioContext';
import { FavoriteService } from '@/services/favoriteService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 10;

interface ContentCardProps {
  item: ContentItem;
  onPress: () => void;
  onFavoriteChange?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onPress, onFavoriteChange }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDownloadIcon, setShowDownloadIcon] = useState(false);
  const { isAudioDownloaded, downloadAudio } = useAudio();

  // Convert underscore to hyphen in icon names for MaterialIcons compatibility
  const iconName = item.icon?.replace(/_/g, '-') || 'music-note';

  useEffect(() => {
    checkDownloadStatus();
    checkFavoriteStatus();
  }, [item.id]);

  // Re-check download status when screen receives focus
  useFocusEffect(
    useCallback(() => {
      // Delay showing the download icon to prevent flickering
      const timer = setTimeout(() => {
        checkDownloadStatus();
        checkFavoriteStatus();
        setShowDownloadIcon(true);
      }, 500); // Wait 500ms before showing the icon
      
      // Also check periodically while focused
      const checkInterval = setInterval(() => {
        checkDownloadStatus();
      }, 2000); // Check every 2 seconds

      return () => {
        clearTimeout(timer);
        clearInterval(checkInterval);
        setShowDownloadIcon(false); // Hide icon when leaving
      };
    }, [item.id])
  );

  const checkDownloadStatus = async () => {
    try {
      const downloaded = await isAudioDownloaded(item.id);
      setIsDownloaded(downloaded);
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await FavoriteService.isFavorite(item.id);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
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

  const handleFavoriteClick = async (e: any) => {
    e.stopPropagation();
    
    try {
      const newFavoriteStatus = await FavoriteService.toggleFavorite(item.id);
      setIsFavorite(newFavoriteStatus);
      // Notify parent component of favorite change
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
          />
          <View style={styles.cardOverlay} />
          <MaterialIcons 
            name={iconName as any} 
            size={36} 
            color="rgba(255, 255, 255, 0.8)" 
            style={styles.cardIcon}
          />
          {showDownloadIcon && (
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
          )}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteClick}
          >
            <MaterialIcons 
              name={isFavorite ? "favorite" : "favorite-border"}
              size={24} 
              color={isFavorite ? "#FF6B6B" : "rgba(255, 255, 255, 0.9)"}
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
            name={iconName as any} 
            size={36} 
            color="rgba(255, 255, 255, 0.6)" 
            style={styles.cardIcon}
          />
          {showDownloadIcon && (
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
          )}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteClick}
          >
            <MaterialIcons 
              name={isFavorite ? "favorite" : "favorite-border"}
              size={24} 
              color={isFavorite ? "#FF6B6B" : "rgba(255, 255, 255, 0.9)"}
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

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 20,
    marginRight: CARD_MARGIN * 2,
    overflow: 'hidden',
    elevation: 5, // Android shadow only
    // iOS shadows removed to prevent warning with background images
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
  favoriteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
});