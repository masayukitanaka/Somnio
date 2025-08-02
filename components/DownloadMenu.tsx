import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudio } from '@/contexts/AudioContext';

const { width: screenWidth } = Dimensions.get('window');

interface DownloadMenuProps {
  visible: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    audioUrl?: string;
  } | null;
}

export function DownloadMenu({ visible, onClose, item }: DownloadMenuProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const { downloadAudio, deleteDownload, isAudioDownloaded } = useAudio();

  useEffect(() => {
    if (item?.id) {
      checkDownloadStatus();
    }
  }, [item?.id]);

  const checkDownloadStatus = async () => {
    if (!item?.id) return;
    try {
      const downloaded = await isAudioDownloaded(item.id);
      setIsDownloaded(downloaded);
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  const handleDownload = async () => {
    if (!item?.audioUrl || !item?.id) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      await downloadAudio(item.id, item.audioUrl, (progress) => {
        setDownloadProgress(progress);
      });
      
      setIsDownloaded(true);
      setDownloadProgress(1);
      Alert.alert('Download Complete', `"${item.title}" has been downloaded successfully.`);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', 'Failed to download the audio file. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!item?.id) return;

    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete the downloaded file for "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDownload(item.id);
              setIsDownloaded(false);
              Alert.alert('Deleted', 'Downloaded file has been removed.');
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Delete Failed', 'Failed to delete the file. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <LinearGradient
          colors={['#0A2647', '#144272']}
          style={styles.content}
        >
          <View style={styles.header}>
            <MaterialIcons name="download" size={24} color="#ffffff" />
            <Text style={styles.title}>Download Options</Text>
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {isDownloaded && (
              <View style={styles.downloadedBadge}>
                <MaterialIcons name="download-done" size={16} color="#4CAF50" />
                <Text style={styles.downloadedText}>Downloaded</Text>
              </View>
            )}
          </View>

          {isDownloading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Downloading... {Math.round(downloadProgress * 100)}%
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${downloadProgress * 100}%` }]} 
                />
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {!isDownloaded && !isDownloading && (
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={handleDownload}
              >
                <MaterialIcons name="download" size={20} color="#ffffff" />
                <Text style={styles.downloadButtonText}>Download for Offline</Text>
              </TouchableOpacity>
            )}

            {isDownloaded && !isDownloading && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <MaterialIcons name="delete" size={20} color="#ffffff" />
                <Text style={styles.deleteButtonText}>Delete Download</Text>
              </TouchableOpacity>
            )}

            {isDownloading && (
              <TouchableOpacity 
                style={styles.disabledButton}
                disabled
              >
                <MaterialIcons name="hourglass-empty" size={20} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.disabledButtonText}>Downloading...</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: screenWidth * 0.85,
    marginLeft: -(screenWidth * 0.85) / 2,
    marginTop: -150,
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  itemInfo: {
    marginBottom: 20,
  },
  itemTitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  downloadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadedText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  downloadButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  disabledButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});