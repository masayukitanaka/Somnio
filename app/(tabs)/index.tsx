import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Dimensions, Image, Modal, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RemoveAdsButton } from '@/components/RemoveAdsButton';
import { getCurrentLanguage, getTranslation, homeTabTranslations } from '@/utils/i18n';

const { width } = Dimensions.get('window');

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

// Day Detail Modal Component
const DayDetailModal = ({ 
  visible, 
  onClose, 
  date, 
  currentLanguage,
  onDateChange 
}: { 
  visible: boolean; 
  onClose: () => void; 
  date: string | null;
  currentLanguage: string;
  onDateChange: (newDate: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'sleep' | 'relax' | 'focus'>('sleep');
  const t = (key: string) => getTranslation(homeTabTranslations, key, currentLanguage);
  
  if (!date) return null;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(currentLanguage === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStarLevelForDate = (dateStr: string): number => {
    // This is a simplified version - in real app, you'd get from the actual records
    const dayOfMonth = parseInt(dateStr.split('-')[2]);
    return Math.floor(Math.random() * 4); // 0-3 (0 = no star)
  };

  const navigateDate = (direction: number) => {
    const [year, month, day] = date.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    currentDate.setDate(currentDate.getDate() + direction);
    
    const newDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    onDateChange(newDateStr);
  };

  const TabButton = ({ 
    tab, 
    label, 
    icon 
  }: { 
    tab: 'sleep' | 'relax' | 'focus'; 
    label: string; 
    icon: string;
  }) => (
    <TouchableOpacity 
      style={[
        styles.modalTab, 
        activeTab === tab ? styles.modalTabActive : undefined
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <MaterialIcons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? '#205295' : '#999999'} 
      />
      <ThemedText style={[
        styles.modalTabText,
        activeTab === tab ? styles.modalTabTextActive : undefined
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    const content = {
      sleep: {
        title: t('sleep_achievement'),
        description: t('sleep_achievement_desc'),
        stats: '8 hours',
        icon: 'nights-stay'
      },
      relax: {
        title: t('relax_achievement'),
        description: t('relax_achievement_desc'),
        stats: '30 min',
        icon: 'spa'
      },
      focus: {
        title: t('focus_achievement'),
        description: t('focus_achievement_desc'),
        stats: '2 hours',
        icon: 'psychology'
      }
    };

    const tabData = content[activeTab];

    return (
      <View style={styles.modalTabContent}>
        <View style={styles.modalContentHeader}>
          <MaterialIcons name={tabData.icon as any} size={40} color="#205295" />
          <ThemedText type="defaultSemiBold" style={styles.modalContentTitle}>
            {tabData.title}
          </ThemedText>
        </View>
        <ThemedText style={styles.modalContentDescription}>
          {tabData.description}
        </ThemedText>
        <View style={styles.modalStats}>
          <ThemedText type="defaultSemiBold" style={styles.modalStatsValue}>
            {tabData.stats}
          </ThemedText>
          <ThemedText style={styles.modalStatsLabel}>
            {t('today_total')}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {/* Close button row */}
              <View style={styles.modalCloseRow}>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                  <MaterialIcons name="close" size={24} color="#333333" />
                </TouchableOpacity>
              </View>
              
              {/* Date navigation row */}
              <View style={styles.modalDateRow}>
                <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.modalNavButton}>
                  <MaterialIcons name="chevron-left" size={24} color="#333333" />
                </TouchableOpacity>
                
                <View style={styles.modalTitleContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                    {formatDate(date)}
                  </ThemedText>
                  {getStarLevelForDate(date) > 0 && (
                    <Image 
                      source={starImages[getStarLevelForDate(date) as keyof typeof starImages]} 
                      style={styles.modalStarIcon}
                    />
                  )}
                </View>
                
                <TouchableOpacity onPress={() => navigateDate(1)} style={styles.modalNavButton}>
                  <MaterialIcons name="chevron-right" size={24} color="#333333" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalTabs}>
              <TabButton tab="sleep" label={t('sleep')} icon="nights-stay" />
              <View style={styles.modalTabDivider} />
              <TabButton tab="relax" label={t('relax')} icon="spa" />
              <View style={styles.modalTabDivider} />
              <TabButton tab="focus" label={t('focus')} icon="psychology" />
            </View>

            {renderTabContent()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CalendarView = ({ currentLanguage }: { currentLanguage: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthRecords, setMonthRecords] = useState<DayRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const t = (key: string) => getTranslation(homeTabTranslations, key, currentLanguage);
  
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
  const isFocused = useIsFocused();

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

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalCloseRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  modalDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: '#333333',
  },
  modalStarIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  modalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  modalTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalTabText: {
    fontSize: 14,
    color: '#999999',
  },
  modalTabTextActive: {
    color: '#205295',
    fontWeight: 'bold',
  },
  modalTabDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  modalTabContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
  },
  modalContentHeader: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  modalContentTitle: {
    fontSize: 18,
    color: '#333333',
  },
  modalContentDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  modalStats: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalStatsValue: {
    fontSize: 32,
    color: '#205295',
    marginBottom: 5,
  },
  modalStatsLabel: {
    fontSize: 14,
    color: '#999999',
  },
});