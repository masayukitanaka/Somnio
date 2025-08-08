import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { additionalScreenTranslations, getCurrentLanguage, getTranslation } from '@/utils/i18n';

interface JournalEntry {
  date: string; // YYYY-MM-DD format
  content: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = '@somnio_journal';

export default function JournalScreen() {
  const router = useRouter();
  
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEntryList, setShowEntryList] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load journal entries from storage
  useEffect(() => {
    loadEntries();
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
  const t = (key: string) => getTranslation(additionalScreenTranslations, key, currentLanguage);

  // Load current entry when date changes
  useEffect(() => {
    if (isLoaded) {
      loadCurrentEntry();
    }
  }, [selectedDate, isLoaded]);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      saveCurrentEntry();
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentEntry, selectedDate, isLoaded]);

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        // Convert date strings back to Date objects
        const entriesWithDates = Object.keys(parsedEntries).reduce((acc, key) => {
          acc[key] = {
            ...parsedEntries[key],
            createdAt: new Date(parsedEntries[key].createdAt),
            updatedAt: new Date(parsedEntries[key].updatedAt),
          };
          return acc;
        }, {} as Record<string, JournalEntry>);
        setEntries(entriesWithDates);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      Alert.alert(t('error'), 'Failed to load journal entries');
    } finally {
      setIsLoaded(true);
    }
  };

  const saveEntries = async (updatedEntries: Record<string, JournalEntry>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error saving journal entries:', error);
      Alert.alert(t('error'), 'Failed to save journal entry');
    }
  };

  const loadCurrentEntry = () => {
    const entry = entries[selectedDate];
    setCurrentEntry(entry?.content || '');
  };

  const saveCurrentEntry = async () => {
    if (isSaving || currentEntry.trim() === '') return;

    setIsSaving(true);
    try {
      const now = new Date();
      const wordCount = currentEntry.trim().split(/\s+/).filter(word => word.length > 0).length;
      
      const updatedEntries = {
        ...entries,
        [selectedDate]: {
          date: selectedDate,
          content: currentEntry,
          wordCount,
          createdAt: entries[selectedDate]?.createdAt || now,
          updatedAt: now,
        },
      };

      setEntries(updatedEntries);
      await saveEntries(updatedEntries);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = (date: string) => {
    Alert.alert(
      t('delete_entry'),
      t('are_you_sure_delete_journal'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = { ...entries };
            delete updatedEntries[date];
            setEntries(updatedEntries);
            await saveEntries(updatedEntries);
            if (date === selectedDate) {
              setCurrentEntry('');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const generateCalendarDates = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Get first day of the month and how many days in month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const calendar = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      calendar.push(date.toISOString().split('T')[0]);
    }
    
    return { calendar, month: firstDayOfMonth };
  };

  const getRecentEntries = () => {
    return Object.values(entries)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  };

  const currentWordCount = currentEntry.trim().split(/\s+/).filter(word => word.length > 0).length;
  const hasEntry = entries[selectedDate]?.content?.trim().length > 0;
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
  };
  
  const manualSave = () => {
    saveCurrentEntry();
    Alert.alert(t('saved'), t('your_journal_saved'));
  };
  
  const manualDelete = () => {
    if (!hasEntry) {
      Alert.alert(t('no_entry'), t('no_entry_to_delete'));
      return;
    }
    deleteEntry(selectedDate);
  };
  
  const { calendar, month } = generateCalendarDates();

  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('journal')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowEntryList(true)}
            >
              <MaterialIcons name="list" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowCalendar(true)}
            >
              <MaterialIcons name="calendar-today" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date and Stats */}
        <View style={styles.dateSection}>
          <TouchableOpacity
            style={styles.dateCard}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <View style={styles.dateStats}>
              <Text style={styles.statText}>
                {currentWordCount} {t('words')} {hasEntry && `• ${t('saved')}`}
              </Text>
              {isSaving && (
                <Text style={styles.savingText}>{t('saving')}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Text Editor */}
        <View style={styles.editorSection}>
          <ScrollView style={styles.editorContainer} showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.textEditor}
              value={currentEntry}
              onChangeText={setCurrentEntry}
              placeholder={t('whats_on_your_mind_today')}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              textAlignVertical="top"
              autoFocus={false}
            />
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={manualSave}
            >
              <MaterialIcons name="save" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>{t('save')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, !hasEntry && styles.disabledButton]}
              onPress={manualDelete}
              disabled={!hasEntry}
            >
              <MaterialIcons name="delete" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Modal */}
        <Modal
          visible={showCalendar}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.calendarModal}>
              <View style={styles.calendarHeader}>
                <View style={styles.monthNavigation}>
                  <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                    <MaterialIcons name="chevron-left" size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                    <MaterialIcons name="chevron-right" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              {/* Weekday Headers */}
              <View style={styles.weekdayHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.weekdayText}>{day}</Text>
                ))}
              </View>
              
              {/* Calendar Grid */}
              <FlatList
                data={calendar}
                numColumns={7}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.calendarDay,
                      item === selectedDate && styles.selectedCalendarDay,
                      entries[item] && styles.hasEntryCalendarDay,
                    ]}
                    onPress={() => {
                      if (item) {
                        setSelectedDate(item);
                        setShowCalendar(false);
                      }
                    }}
                    disabled={!item}
                  >
                    {item && (
                      <>
                        <Text style={[
                          styles.calendarDayText,
                          item === selectedDate && styles.selectedCalendarDayText,
                        ]}>
                          {new Date(item).getDate()}
                        </Text>
                        {entries[item] && (
                          <View style={styles.entryIndicator} />
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => `${item || 'empty'}-${index}`}
                style={styles.calendarGrid}
                scrollEnabled={false}
              />
            </View>
          </View>
        </Modal>

        {/* Entry List Modal */}
        <Modal
          visible={showEntryList}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEntryList(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.entryListModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('recent_entries')}</Text>
                <TouchableOpacity onPress={() => setShowEntryList(false)}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={getRecentEntries()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.entryItem}
                    onPress={() => {
                      setSelectedDate(item.date);
                      setShowEntryList(false);
                    }}
                  >
                    <View style={styles.entryItemHeader}>
                      <Text style={styles.entryItemDate}>{formatDate(item.date)}</Text>
                      <TouchableOpacity
                        onPress={() => deleteEntry(item.date)}
                        style={styles.deleteEntryButton}
                      >
                        <MaterialIcons name="delete" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.entryItemPreview} numberOfLines={2}>
                      {item.content}
                    </Text>
                    <Text style={styles.entryItemStats}>
                      {item.wordCount} {t('words')} • {item.updatedAt.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.date}
                style={styles.entryList}
                ListEmptyComponent={
                  <View style={styles.emptyEntries}>
                    <MaterialIcons name="book" size={48} color="rgba(255, 255, 255, 0.3)" />
                    <Text style={styles.emptyText}>{t('no_journal_entries_yet')}</Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  dateSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  dateStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  savingText: {
    fontSize: 12,
    color: '#10B981',
    fontStyle: 'italic',
  },
  editorSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  textEditor: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    minHeight: 200,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#144272',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  entryListModal: {
    backgroundColor: '#144272',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  calendarGrid: {
    marginTop: 10,
  },
  closeButton: {
    padding: 8,
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: 40,
  },
  selectedCalendarDay: {
    backgroundColor: '#10B981',
  },
  hasEntryCalendarDay: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  calendarDayText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  selectedCalendarDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  entryIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  entryList: {
    maxHeight: 400,
  },
  entryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryItemDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  deleteEntryButton: {
    padding: 4,
  },
  entryItemPreview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 8,
  },
  entryItemStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyEntries: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
  },
});