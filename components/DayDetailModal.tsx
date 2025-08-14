import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { getTranslation, homeTabTranslations } from '@/utils/i18n';

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
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editInputValue, setEditInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [focusEditModalVisible, setFocusEditModalVisible] = useState(false);
  const t = (key: string) => getTranslation(homeTabTranslations, key, currentLanguage);

  // Load data for the selected date
  useEffect(() => {
    if (date) {
      loadMeditationData();
      loadFocusData();
    }
  }, [date]);

  const loadMeditationData = async () => {
    if (!date) return;
    
    try {
      const key = `meditation_${date}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setMeditationMinutes(parseInt(stored));
      } else {
        setMeditationMinutes(0);
      }
    } catch (error) {
      console.error('Error loading meditation data:', error);
    }
  };

  const saveMeditationData = async (minutes: number) => {
    if (!date) return;
    
    try {
      const key = `meditation_${date}`;
      await AsyncStorage.setItem(key, minutes.toString());
      setMeditationMinutes(minutes);
    } catch (error) {
      console.error('Error saving meditation data:', error);
    }
  };

  const loadFocusData = async () => {
    if (!date) return;
    
    try {
      const key = `focus_${date}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setIsFocused(stored === 'true');
      } else {
        setIsFocused(false);
      }
    } catch (error) {
      console.error('Error loading focus data:', error);
    }
  };

  const saveFocusData = async (focused: boolean) => {
    if (!date) return;
    
    try {
      const key = `focus_${date}`;
      await AsyncStorage.setItem(key, focused.toString());
      setIsFocused(focused);
    } catch (error) {
      console.error('Error saving focus data:', error);
    }
  };

  const handleEditFocus = () => {
    setFocusEditModalVisible(true);
  };

  const handleSaveFocus = (focused: boolean) => {
    saveFocusData(focused);
    setFocusEditModalVisible(false);
  };

  const handleEditMeditation = () => {
    setEditInputValue(meditationMinutes.toString());
    setEditModalVisible(true);
  };

  const handleSaveMeditation = () => {
    const minutes = parseInt(editInputValue) || 0;
    saveMeditationData(minutes);
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
    // This is a simplified version - in real app, you'd get from the actual records
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
      return (
        <View style={styles.modalTabContent}>
          <View style={styles.modalContentHeader}>
            {/* <MaterialIcons name="nights-stay" size={40} color="#205295" /> */}
            <ThemedText type="defaultSemiBold" style={styles.modalContentTitle}>
              {t('sleep_achievement')}
            </ThemedText>
          </View>
          <ThemedText style={styles.modalContentDescription}>
            {t('sleep_achievement_desc')}
          </ThemedText>
          <View style={styles.modalStats}>
            <ThemedText type="defaultSemiBold" style={styles.modalStatsValue}>
              8 hours
            </ThemedText>
            <ThemedText style={styles.modalStatsLabel}>
              {t('today_total')}
            </ThemedText>
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
              source={meditationMinutes > 0 ? meditationImages.guru : meditationImages.knocked}
              style={styles.meditationStatusImage}
            />
            <ThemedText style={styles.meditationStatusText}>
              {meditationMinutes > 0 ? t('meditation_completed') : t('no_meditation')}
            </ThemedText>
          </View>

          <View style={styles.modalStats}>
            <ThemedText type="defaultSemiBold" style={styles.modalStatsValue}>
              {meditationMinutes} {t('minutes')}
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
            source={isFocused ? focusImages.focused : focusImages.unfocused}
            style={isFocused ? styles.focusStatusImage : styles.focusStatusImageUnfocused}
          />
          <ThemedText style={styles.focusStatusText}>
            {isFocused ? t('laser_focus') : t('all_over_the_place')}
          </ThemedText>
        </View>

        <View style={styles.modalStats}>
          <ThemedText type="defaultSemiBold" style={styles.modalStatsValue}>
            {isFocused ? t('focused') : t('unfocused')}
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
                  isFocused && styles.focusOptionButtonSelected
                ]}
                onPress={() => handleSaveFocus(true)}
              >
                <Image 
                  source={focusImages.focused}
                  style={styles.focusOptionImage}
                />
                <ThemedText style={[
                  styles.focusOptionText,
                  isFocused && styles.focusOptionTextSelected
                ]}>
                  {t('laser_focus')}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.focusOptionButton,
                  !isFocused && styles.focusOptionButtonSelected
                ]}
                onPress={() => handleSaveFocus(false)}
              >
                <Image 
                  source={focusImages.unfocused}
                  style={styles.focusOptionImageUnfocused}
                />
                <ThemedText style={[
                  styles.focusOptionText,
                  !isFocused && styles.focusOptionTextSelected
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
  // Meditation status styles
  meditationStatusContainer: {
    alignItems: 'center',
    marginVertical: 20,
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
    marginVertical: 10,
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