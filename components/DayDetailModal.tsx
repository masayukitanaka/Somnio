import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { getTranslation, homeTabTranslations } from '@/utils/i18n';
import { useProgressTracking, useSleepTracking } from '@/hooks/useProgressTracking';
import { DailyProgress } from '@/services/progressService';

// Star images
const starImages = {
  1: require('@/assets/images/star_1.png'),
  2: require('@/assets/images/star_2.png'),
  3: require('@/assets/images/star_3.png'),
};

// Meditation status images
const meditationImages = {
  guru: require('@/assets/images/guru.png'),
  knocked: require('@/assets/images/knocked.png'),
};

// Focus status images
const focusImages = {
  focused: require('@/assets/images/focus.png'),
  unfocused: require('@/assets/images/unfocused.png'),
};

// Sleep status images
const sleepImages = {
  noSleep: require('@/assets/images/no_sleep.png'),
};

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  date: string | null;
  currentLanguage: string;
  onDateChange: (newDate: string) => void;
}

export const DayDetailModal = ({ 
  visible, 
  onClose, 
  date, 
  currentLanguage,
  onDateChange 
}: DayDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<'sleep' | 'mindfulness' | 'focus'>('sleep');
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editInputValue, setEditInputValue] = useState('');
  const [focusEditModalVisible, setFocusEditModalVisible] = useState(false);
  const [sleepEditModalVisible, setSleepEditModalVisible] = useState(false);
  const [sleepEditValue, setSleepEditValue] = useState('');
  
  const { getDailyProgress, trackMindfulness, trackFocus } = useProgressTracking();
  const { trackSleepManual, sleepGoal } = useSleepTracking();
  const t = (key: string) => getTranslation(homeTabTranslations, key, currentLanguage);

  // Load data for the selected date
  useEffect(() => {
    if (date) {
      loadDailyProgress();
    }
  }, [date]);

  const loadDailyProgress = async () => {
    if (!date) return;
    
    try {
      const progress = await getDailyProgress(date);
      setDailyProgress(progress);
    } catch (error) {
      console.error('Error loading daily progress:', error);
    }
  };

  const saveSleepData = async (hours: number) => {
    if (!date) return;
    
    try {
      await trackSleepManual(hours, date);
      await loadDailyProgress(); // Refresh data
    } catch (error) {
      console.error('Error saving sleep data:', error);
    }
  };

  const saveMeditationData = async (minutes: number) => {
    if (!date) return;
    
    try {
      await trackMindfulness(minutes, undefined, undefined, date);
      await loadDailyProgress(); // Refresh data
    } catch (error) {
      console.error('Error saving meditation data:', error);
    }
  };

  const saveFocusData = async (focused: boolean) => {
    if (!date) return;
    
    try {
      await trackFocus(focused, date);
      await loadDailyProgress(); // Refresh data
    } catch (error) {
      console.error('Error saving focus data:', error);
    }
  };

  const handleEditSleep = () => {
    setSleepEditValue(dailyProgress?.sleep?.value?.toString() || '0');
    setSleepEditModalVisible(true);
  };

  const handleSaveSleep = async () => {
    const hours = parseFloat(sleepEditValue) || 0;
    await saveSleepData(hours);
    setSleepEditModalVisible(false);
  };

  const handleEditFocus = () => {
    setFocusEditModalVisible(true);
  };

  const handleSaveFocus = async (focused: boolean) => {
    await saveFocusData(focused);
    setFocusEditModalVisible(false);
  };

  const handleEditMeditation = () => {
    setEditInputValue(dailyProgress?.mindfulness?.value?.toString() || '0');
    setEditModalVisible(true);
  };

  const handleSaveMeditation = async () => {
    const minutes = parseInt(editInputValue) || 0;
    await saveMeditationData(minutes);
    setEditModalVisible(false);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString(currentLanguage === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!date) return null;

  const getStarLevelForDate = (): number => {
    return dailyProgress?.stars || 0;
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
    tab: 'sleep' | 'mindfulness' | 'focus'; 
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
    if (activeTab === 'sleep') {
      const sleepHours = dailyProgress?.sleep?.value || 0;
      const isGoalAchieved = sleepHours >= sleepGoal;
      
      return (
        <View style={styles.modalTabContent}>
          <View style={styles.modalContentHeader}>
            <ThemedText type="defaultSemiBold" style={styles.modalContentTitle}>
              {t('sleep_achievement')}
            </ThemedText>
          </View>
          
          <View style={styles.sleepStatusContainer}>
            {isGoalAchieved ? (
              <View style={styles.energyFullContainer}>
                <MaterialIcons name="bolt" size={80} color="#FFD700" />
                <ThemedText style={styles.sleepStatusText}>
                  {t('energy_full') || 'Energy Full!'}
                </ThemedText>
              </View>
            ) : (
              <>
                <Image 
                  source={sleepImages.noSleep}
                  style={styles.sleepStatusImage}
                />
                <ThemedText style={styles.sleepStatusText}>
                  {t('need_more_sleep') || 'Need More Sleep'}
                </ThemedText>
              </>
            )}
          </View>
          
          <ThemedText style={styles.modalContentDescription}>
            {isGoalAchieved ? 
              `${t('sleep_goal_achieved')} (${sleepGoal}h+)` : 
              `${t('sleep_goal_not_achieved')} (${sleepGoal}h)`
            }
          </ThemedText>
          
          <View style={styles.modalStats}>
            <ThemedText type="defaultSemiBold" style={styles.modalStatsValue}>
              {sleepHours} hours
            </ThemedText>
            <ThemedText style={styles.modalStatsLabel}>
              {t('today_total')}
            </ThemedText>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={handleEditSleep}
            >
              <MaterialIcons name="edit" size={16} color="#205295" />
              <ThemedText style={styles.editButtonText}>
                {t('edit')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (activeTab === 'mindfulness') {
      return (
        <View style={styles.modalTabContent}>
          <View style={styles.modalContentHeader}>
            {/* <MaterialIcons name="self-improvement" size={40} color="#205295" /> */}
            <ThemedText type="defaultSemiBold" style={styles.modalContentTitle}>
              {t('mindfulness_achievement')}
            </ThemedText>
          </View>
          
          <View style={styles.meditationStatusContainer}>
            <Image 
              source={(dailyProgress?.mindfulness?.value || 0) > 0 ? meditationImages.guru : meditationImages.knocked}
              style={styles.meditationStatusImage}
            />
            <ThemedText style={styles.meditationStatusText}>
              {(dailyProgress?.mindfulness?.value || 0) > 0 ? t('meditation_completed') : t('no_meditation')}
            </ThemedText>
          </View>

          <View style={styles.modalStats}>
            <ThemedText type="defaultSemiBold" style={styles.modalStatsValue}>
              {dailyProgress?.mindfulness?.value || 0} {t('minutes')}
            </ThemedText>
            <ThemedText style={styles.modalStatsLabel}>
              {t('meditation_time')}
            </ThemedText>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={handleEditMeditation}
            >
              <MaterialIcons name="edit" size={16} color="#205295" />
              <ThemedText style={styles.editButtonText}>
                {t('edit')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Focus tab content
    return (
      <View style={styles.modalTabContent}>
        <View style={styles.modalContentHeader}>
          {/* <MaterialIcons name="psychology" size={40} color="#205295" /> */}
          <ThemedText type="defaultSemiBold" style={styles.modalContentTitle}>
            {t('focus_achievement')}
          </ThemedText>
        </View>
        
        <View style={styles.focusStatusContainer}>
          <Image 
            source={(dailyProgress?.focus?.achieved || false) ? focusImages.focused : focusImages.unfocused}
            style={(dailyProgress?.focus?.achieved || false) ? styles.focusStatusImage : styles.focusStatusImageUnfocused}
          />
          <ThemedText style={styles.focusStatusText}>
            {(dailyProgress?.focus?.achieved || false) ? t('laser_focus') : t('all_over_the_place')}
          </ThemedText>
        </View>

        <View style={styles.modalStats}>
          <ThemedText type="defaultSemiBold" style={styles.modalStatsValue}>
            {(dailyProgress?.focus?.achieved || false) ? t('focused') : t('unfocused')}
          </ThemedText>
          <ThemedText style={styles.modalStatsLabel}>
            {t('focus_status')}
          </ThemedText>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditFocus}
          >
            <MaterialIcons name="edit" size={16} color="#205295" />
            <ThemedText style={styles.editButtonText}>
              {t('edit')}
            </ThemedText>
          </TouchableOpacity>
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
                  {getStarLevelForDate() > 0 && (
                    <Image 
                      source={starImages[getStarLevelForDate() as keyof typeof starImages]} 
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
              <TabButton tab="mindfulness" label={t('mindfulness')} icon="self-improvement" />
              <View style={styles.modalTabDivider} />
              <TabButton tab="focus" label={t('focus')} icon="psychology" />
            </View>

            {renderTabContent()}
          </View>
        </View>
      </View>

      {/* Edit Meditation Time Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContainer}>
            <ThemedText type="defaultSemiBold" style={styles.editModalTitle}>
              {t('edit_meditation_time')}
            </ThemedText>
            
            <TextInput
              style={styles.editModalInput}
              value={editInputValue}
              onChangeText={setEditInputValue}
              placeholder={t('enter_minutes')}
              keyboardType="numeric"
              autoFocus={true}
            />
            
            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalCancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <ThemedText style={styles.editModalCancelText}>
                  {t('cancel')}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalSaveButton]}
                onPress={handleSaveMeditation}
              >
                <ThemedText style={styles.editModalSaveText}>
                  {t('save')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Sleep Hours Modal */}
      <Modal
        visible={sleepEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSleepEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContainer}>
            <ThemedText type="defaultSemiBold" style={styles.editModalTitle}>
              {t('edit_sleep_hours')}
            </ThemedText>
            
            <TextInput
              style={styles.editModalInput}
              value={sleepEditValue}
              onChangeText={setSleepEditValue}
              placeholder={t('enter_hours')}
              keyboardType="numeric"
              autoFocus={true}
            />
            
            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalCancelButton]}
                onPress={() => setSleepEditModalVisible(false)}
              >
                <ThemedText style={styles.editModalCancelText}>
                  {t('cancel')}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalSaveButton]}
                onPress={handleSaveSleep}
              >
                <ThemedText style={styles.editModalSaveText}>
                  {t('save')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Focus Status Modal */}
      <Modal
        visible={focusEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFocusEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContainer}>
            <ThemedText type="defaultSemiBold" style={styles.editModalTitle}>
              {t('edit_focus_status')}
            </ThemedText>
            
            <View style={styles.focusOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.focusOptionButton,
                  (dailyProgress?.focus?.achieved || false) && styles.focusOptionButtonSelected
                ]}
                onPress={() => handleSaveFocus(true)}
              >
                <Image 
                  source={focusImages.focused}
                  style={styles.focusOptionImage}
                />
                <ThemedText style={[
                  styles.focusOptionText,
                  (dailyProgress?.focus?.achieved || false) && styles.focusOptionTextSelected
                ]}>
                  {t('laser_focus')}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.focusOptionButton,
                  !(dailyProgress?.focus?.achieved || false) && styles.focusOptionButtonSelected
                ]}
                onPress={() => handleSaveFocus(false)}
              >
                <Image 
                  source={focusImages.unfocused}
                  style={styles.focusOptionImageUnfocused}
                />
                <ThemedText style={[
                  styles.focusOptionText,
                  !(dailyProgress?.focus?.achieved || false) && styles.focusOptionTextSelected
                ]}>
                  {t('all_over_the_place')}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalCancelButton]}
                onPress={() => setFocusEditModalVisible(false)}
              >
                <ThemedText style={styles.editModalCancelText}>
                  {t('cancel')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '80%',
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
    marginBottom: 15,
    gap: 8,
  },
  modalContentTitle: {
    fontSize: 18,
    color: '#333333',
  },
  modalContentDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
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
    fontSize: 28,
    color: '#205295',
    marginBottom: 5,
    lineHeight: 32,
    textAlign: 'center',
  },
  modalStatsLabel: {
    fontSize: 14,
    color: '#999999',
  },
  // Sleep status styles
  sleepStatusContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  sleepStatusImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  sleepStatusText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  energyFullContainer: {
    alignItems: 'center',
  },
  // Meditation status styles
  meditationStatusContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  meditationStatusImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  meditationStatusText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#205295',
  },
  // Focus status styles
  focusStatusContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  focusStatusImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  focusStatusImageUnfocused: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  focusStatusText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Focus edit modal styles
  focusOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  focusOptionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  focusOptionButtonSelected: {
    borderColor: '#205295',
    backgroundColor: '#f0f5ff',
  },
  focusOptionImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  focusOptionImageUnfocused: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  focusOptionText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  focusOptionTextSelected: {
    color: '#205295',
  },
  // Edit modal styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  editModalTitle: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  editModalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editModalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  editModalSaveButton: {
    backgroundColor: '#205295',
  },
  editModalCancelText: {
    fontSize: 16,
    color: '#666666',
  },
  editModalSaveText: {
    fontSize: 16,
    color: '#ffffff',
  },
});