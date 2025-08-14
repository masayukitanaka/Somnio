import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Dimensions, Image, Text, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { DayDetailModal } from '@/components/DayDetailModal';
import { PlayerModal } from '@/components/PlayerModal';
import { MiniPlayer } from '@/components/MiniPlayer';
import { getCurrentLanguage, getTranslation, homeTabTranslations } from '@/utils/i18n';
import { getRecommendations, ContentItem } from '@/services/contentService';
import { useAudio } from '@/contexts/AudioContext';

const { width } = Dimensions.get('window');

// Tools Menu Component
const ToolsMenu = ({ currentLanguage }: { currentLanguage: string }) => {
  const navigation = useNavigation<any>();
  
  const menuItems = [
    {
      id: 'breathing',
      title: 'Breathing',
      icon: 'air',
      color: '#4FC3F7',
      gradient: ['#4FC3F7', '#29B6F6'] as [string, string],
      onPress: () => navigation.navigate('breathing-exercise'),
    },
    {
      id: 'stretching',
      title: 'Stretching',
      icon: 'accessibility',
      color: '#66BB6A',
      gradient: ['#66BB6A', '#4CAF50'] as [string, string],
      onPress: () => navigation.navigate('stretching'),
    },
    {
      id: 'pomodoro',
      title: 'Pomodoro',
      icon: 'timer',
      color: '#FF7043',
      gradient: ['#FF7043', '#FF5722'] as [string, string],
      onPress: () => navigation.navigate('pomodoro-timer'),
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: 'checklist',
      color: '#AB47BC',
      gradient: ['#AB47BC', '#9C27B0'] as [string, string],
      onPress: () => navigation.navigate('tasks'),
    },
    {
      id: 'journal',
      title: 'Journal',
      icon: 'book',
      color: '#FFB74D',
      gradient: ['#FFB74D', '#FF9800'] as [string, string],
      onPress: () => navigation.navigate('journal'),
    },
    {
      id: 'sudoku',
      title: 'Sudoku',
      icon: 'grid-on',
      color: '#EC407A',
      gradient: ['#EC407A', '#E91E63'] as [string, string],
      onPress: () => navigation.navigate('sudoku'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      color: '#78909C',
      gradient: ['#78909C', '#607D8B'] as [string, string],
      onPress: () => navigation.navigate('profile'),
    },
  ];
  
  return (
    <View style={styles.toolsSection}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="build" size={24} color="#ffffff" style={styles.sectionIcon} />
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {getTranslation(homeTabTranslations, 'tools', currentLanguage)}
        </ThemedText>
      </View>
      
      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuButton}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={item.gradient}
              style={styles.menuButtonGradient}
            >
              <MaterialIcons name={item.icon as any} size={32} color="#ffffff" />
              <ThemedText style={styles.menuButtonText}>
                {item.title}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Recommendations component
const RecommendationsView = ({ 
  currentLanguage, 
  onItemPress,
  isFocused
}: { 
  currentLanguage: string;
  onItemPress: (item: ContentItem) => void;
  isFocused: boolean;
}) => {
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRecommendations();
  }, []);

  // Reload recommendations when tab is focused
  useEffect(() => {
    if (isFocused) {
      loadRecommendations();
    }
  }, [isFocused]);

  const loadRecommendations = async () => {
    try {
      const items = await getRecommendations();
      setRecommendations(items);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setLoading(false);
    }
  };

  const renderRecommendationItem = ({ item }: { item: ContentItem }) => {
    return (
      <TouchableOpacity 
        style={styles.recommendationItem}
        onPress={() => onItemPress(item)}
      >
        <View style={styles.recommendationThumbnail}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.recommendationImage} />
          ) : (
            <LinearGradient
              colors={[item.color, `${item.color}80`]}
              style={styles.recommendationGradient}
            />
          )}
        </View>
        <ThemedText style={styles.recommendationTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.recommendationDuration}>
          {item.duration}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return null; // Skip rendering while loading
  }

  return (
    <View style={styles.recommendationsSection}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="recommend" size={24} color="#ffffff" style={styles.sectionIcon} />
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {getTranslation(homeTabTranslations, 'recommendations', currentLanguage)}
        </ThemedText>
      </View>
      <FlatList
        data={recommendations}
        renderItem={renderRecommendationItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationsContainer}
        ItemSeparatorComponent={() => <View style={styles.recommendationSeparator} />}
      />
    </View>
  );
};

interface DayRecord {
  date: string;
  hasActivity: boolean;
  starLevel?: number; // 0 = no star, 1-3 = star level
  activities?: {
    sleep?: boolean;
    relax?: boolean;
    focus?: boolean;
  };
}

// Star images
const starImages = {
  1: require('@/assets/images/star_1.png'),
  2: require('@/assets/images/star_2.png'),
  3: require('@/assets/images/star_3.png'),
};

const CalendarView = ({ currentLanguage }: { currentLanguage: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthRecords, setMonthRecords] = useState<DayRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  useEffect(() => {
    loadMonthRecords();
  }, [currentDate]);

  const loadMonthRecords = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const records: DayRecord[] = [];
      
      // Load records for current month from AsyncStorage
      const monthKey = `records_${year}_${month}`;
      const storedRecords = await AsyncStorage.getItem(monthKey);
      
      if (storedRecords) {
        records.push(...JSON.parse(storedRecords));
      } else {
        // Generate random data for demonstration
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          // Random chance of having activity (70% chance)
          if (Math.random() < 0.7) {
            const starLevel = Math.floor(Math.random() * 4); // 0-3 (0 = no star)
            records.push({
              date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
              hasActivity: true,
              starLevel: starLevel,
            });
          }
        }
      }
      
      setMonthRecords(records);
    } catch (error) {
      console.error('Error loading month records:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    // Add empty days for the start of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getRecordForDay = (day: number | null): DayRecord | undefined => {
    if (!day) return undefined;
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthRecords.find(record => record.date === dateStr);
  };

  const hasActivityOnDay = (day: number | null) => {
    const record = getRecordForDay(day);
    return record?.hasActivity || false;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDayPress = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setModalVisible(true);
  };

  const monthYear = currentDate.toLocaleDateString(currentLanguage === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'long'
  });

  const weekDays = currentLanguage === 'ja' 
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <MaterialIcons name="chevron-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.monthText}>
          {monthYear}
        </ThemedText>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <MaterialIcons name="chevron-right" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <ThemedText style={styles.weekDayText}>{day}</ThemedText>
          </View>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {getDaysInMonth(currentDate).map((day, index) => {
          const record = getRecordForDay(day);
          const starLevel = record?.starLevel;
          
          return (
            <View key={index} style={styles.dayCell}>
              {day ? (
                <TouchableOpacity 
                  onPress={() => handleDayPress(day)}
                  style={[
                    styles.dayContent,
                    isToday(day) ? styles.todayCell : undefined,
                    hasActivityOnDay(day) ? styles.activeDay : undefined
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    isToday(day) ? styles.todayText : undefined,
                    hasActivityOnDay(day) ? styles.activeDayText : undefined
                  ]}>
                    {day}
                  </Text>
                  {starLevel && starLevel > 0 ? (
                    <Image 
                      source={starImages[starLevel as keyof typeof starImages]} 
                      style={styles.starIcon}
                    />
                  ) : null}
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </View>
      
      <DayDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        date={selectedDate}
        currentLanguage={currentLanguage}
        onDateChange={(newDate) => setSelectedDate(newDate)}
      />
    </View>
  );
};

export default function HomeScreen() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const isFocused = useIsFocused();
  const { 
    currentSound,
    currentItem,
    isPlaying,
    setCurrentItem, 
    setCurrentSound, 
    setIsPlaying, 
    setIsLoaded,
    setDuration,
    getAudioPathWithAutoDownload,
    stopAndUnloadAudio
  } = useAudio();

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  // Reload language when screen is focused (after settings change)
  useEffect(() => {
    if (isFocused) {
      loadCurrentLanguage();
    }
  }, [isFocused]);

  const loadCurrentLanguage = async () => {
    try {
      const language = await getCurrentLanguage();
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error loading current language:', error);
    }
  };

  const t = (key: string) => getTranslation(homeTabTranslations, key, currentLanguage);

  const handleRecommendationPress = async (item: ContentItem) => {
    try {
      setSelectedItem(item);
      
      // Stop any existing audio
      if (currentSound) {
        await stopAndUnloadAudio();
      }
      
      // Play the audio
      if (item.audioUrl) {
        // Get audio path with auto-download
        const audioPath = await getAudioPathWithAutoDownload(item.id, item.audioUrl);
        
        // Create and load the sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioPath },
          { shouldPlay: true }
        );
        
        // Set audio context state
        setCurrentItem(item);
        setCurrentSound(sound);
        setIsPlaying(true);
        setIsLoaded(true);
        
        // Get and set duration
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setDuration(status.durationMillis);
        }
      }
      
      setPlayerModalVisible(true);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        <RemoveAdsButton />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
            <ThemedText type="title">{t('somnio')}</ThemedText>
            <ThemedText type="subtitle">{t('journey_to_better_sleep')}</ThemedText>
          </ThemedView>
          
          {/* Key Image Section */}
          <View style={styles.keyImageContainer}>
            <LinearGradient
              colors={['rgba(32, 82, 149, 0.3)', 'rgba(10, 38, 71, 0.3)']}
              style={styles.keyImageGradient}
            >
              <View style={styles.keyImageContent}>
                <MaterialIcons name="nights-stay" size={80} color="#ffffff" />
                <ThemedText type="defaultSemiBold" style={styles.keyImageText}>
                  {t('track_your_wellness')}
                </ThemedText>
              </View>
            </LinearGradient>
          </View>

          {/* Recommendations */}
          <RecommendationsView 
            currentLanguage={currentLanguage} 
            onItemPress={handleRecommendationPress}
            isFocused={isFocused}
          />

          {/* Daily Record Calendar */}
          <View style={styles.calendarSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="calendar-today" size={24} color="#ffffff" style={styles.sectionIcon} />
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {t('daily_records')}
              </ThemedText>
            </View>
            <CalendarView currentLanguage={currentLanguage} />
          </View>

          {/* Tools Menu */}
          <ToolsMenu currentLanguage={currentLanguage} />

          <View style={styles.bottomPadding} />
        </ScrollView>
        
        {/* MiniPlayer */}
        {currentItem && currentSound && !playerModalVisible && (
          <MiniPlayer
            onPress={() => {
              setSelectedItem(currentItem);
              setPlayerModalVisible(true);
            }}
          />
        )}
      </SafeAreaView>
      
      {selectedItem && (
        <PlayerModal
          visible={playerModalVisible}
          onClose={() => setPlayerModalVisible(false)}
          item={selectedItem}
        />
      )}
    </LinearGradient>
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
  keyImageContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  keyImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyImageContent: {
    alignItems: 'center',
    gap: 16,
  },
  keyImageText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  calendarSection: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffffff',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    color: '#ffffff',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    color: '#ffffff',
    zIndex: 1,
  },
  todayCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  todayText: {
    fontWeight: 'bold',
  },
  activeDay: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  activeDayText: {
    fontWeight: 'bold',
  },
  activityDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  starIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    resizeMode: 'contain',
    zIndex: 2,
  },
  bottomPadding: {
    height: 100,
  },
  // Recommendations styles
  recommendationsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  recommendationsContainer: {
    paddingLeft: 0,
    paddingRight: 20,
  },
  recommendationItem: {
    width: 120,
    alignItems: 'center',
  },
  recommendationThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendationGradient: {
    width: '100%',
    height: '100%',
  },
  recommendationTitle: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  recommendationDuration: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  recommendationSeparator: {
    width: 12,
  },
  // Tools Menu styles
  toolsSection: {
    marginTop: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  menuButton: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  menuButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 10,
  },
});