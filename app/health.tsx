import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, TouchableOpacity, Text, Platform, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { getCurrentLanguage, getTranslation } from '@/utils/i18n';
import healthKitService from '@/services/healthKitService';

const healthTranslations = {
  health_title: {
    en: 'Health',
    es: 'Salud',
    zh: '健康',
    ja: '健康'
  },
  health_data: {
    en: 'Health Data',
    es: 'Datos de Salud',
    zh: '健康数据',
    ja: '健康データ'
  },
  sleep: {
    en: 'Sleep',
    es: 'Sueño',
    zh: '睡眠',
    ja: '睡眠'
  },
  mindful_minutes: {
    en: 'Mindful Minutes',
    es: 'Minutos de Atención Plena',
    zh: '正念分钟',
    ja: 'マインドフル分'
  },
  today: {
    en: 'Today',
    es: 'Hoy',
    zh: '今天',
    ja: '今日'
  },
  hours: {
    en: 'hours',
    es: 'horas',
    zh: '小时',
    ja: '時間'
  },
  minutes: {
    en: 'min',
    es: 'min',
    zh: '分钟',
    ja: '分'
  },
  no_data: {
    en: 'No data available',
    es: 'No hay datos disponibles',
    zh: '暂无数据',
    ja: 'データなし'
  },
  connect_health: {
    en: 'Connect to Apple Health',
    es: 'Conectar con Apple Health',
    zh: '连接到 Apple Health',
    ja: 'Apple Healthに接続'
  },
  health_not_available: {
    en: 'Health data is only available on iOS devices with Apple Health',
    es: 'Los datos de salud solo están disponibles en dispositivos iOS con Apple Health',
    zh: '健康数据仅在配备 Apple Health 的 iOS 设备上可用',
    ja: 'ヘルスデータはApple HealthのあるiOSデバイスでのみ利用可能です'
  },
  all_sources: {
    en: 'All Sources',
    es: 'Todas las Fuentes',
    zh: '所有来源',
    ja: 'すべてのソース'
  },
  sleep_source: {
    en: 'Sleep Source',
    es: 'Fuente de Sueño',
    zh: '睡眠来源',
    ja: '睡眠ソース'
  }
};

interface SleepSource {
  sourceId: string;
  sourceName: string;
  totalHours: number;
  startTime?: string;
  endTime?: string;
}

interface HealthData {
  sleep?: number;
  sleepSources?: SleepSource[];
  mindfulMinutes?: number;
}

export default function HealthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [healthData, setHealthData] = useState<HealthData>({});
  const [loading, setLoading] = useState(true);
  const [isHealthAvailable, setIsHealthAvailable] = useState(Platform.OS === 'ios');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  

  useEffect(() => {
    loadCurrentLanguage();
    if (Platform.OS === 'ios') {
      loadHealthData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const language = await getCurrentLanguage();
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error loading current language:', error);
    }
  };

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      // Initialize HealthKit
      const initialized = await healthKitService.initialize();
      if (!initialized) {
        setIsHealthAvailable(false);
        setLoading(false);
        return;
      }
      
      const today = new Date();
      
      // Get sleep data by source
      const sleepData = await healthKitService.getSleepDataBySource(today);
      
      // Get mindfulness data  
      const mindfulnessData = await healthKitService.getMindfulnessData(today);
      
      setHealthData({
        sleep: sleepData ? Math.round(sleepData.totalHours * 60) : undefined,
        sleepSources: sleepData?.sources || [],
        mindfulMinutes: mindfulnessData ? Math.round(mindfulnessData.totalMinutes) : undefined
      });
    } catch (error) {
      console.error('Error loading health data:', error);
      setIsHealthAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string) => getTranslation(healthTranslations, key, currentLanguage);

  // Calculate sleep hours based on selected source
  const getSleepHours = () => {
    if (!healthData.sleepSources || healthData.sleepSources.length === 0) {
      return undefined;
    }
    
    if (selectedSourceId === 'all') {
      return healthData.sleep;
    }
    
    const selectedSource = healthData.sleepSources.find(s => s.sourceId === selectedSourceId);
    return selectedSource ? Math.round(selectedSource.totalHours * 60) : undefined;
  };

  const sleepHours = getSleepHours();

  
  const getSelectedSourceName = () => {
    if (selectedSourceId === 'all') {
      return t('all_sources');
    }
    const source = healthData.sleepSources?.find(s => s.sourceId === selectedSourceId);
    return source?.sourceName || t('all_sources');
  };

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {!isHealthAvailable ? (
              <View style={styles.unavailableContainer}>
                <MaterialIcons name="phone-iphone" size={64} color="rgba(255,255,255,0.5)" />
                <ThemedText style={styles.unavailableText}>
                  {t('health_not_available')}
                </ThemedText>
              </View>
            ) : loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : (
              <>
                <View style={styles.todaySection}>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                    {t('today')}
                  </ThemedText>
                </View>

                {/* Sleep Section */}
                <View style={styles.sleepSection}>
                  {/* Source selector for sleep data */}
                  {healthData.sleepSources && healthData.sleepSources.length > 1 && (
                    <TouchableOpacity 
                      style={styles.sourceSelector}
                      onPress={() => setSourceModalVisible(true)}
                    >
                      <ThemedText style={styles.sourceSelectorLabel}>
                        {t('sleep_source')}:
                      </ThemedText>
                      <ThemedText style={styles.sourceSelectorValue}>
                        {getSelectedSourceName()}
                      </ThemedText>
                      <MaterialIcons name="arrow-drop-down" size={24} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                  
                  {/* Sleep Metric Card */}
                  <View style={[styles.metricCard, styles.fullWidthCard]}>
                    <View style={[styles.metricIconContainer, { backgroundColor: '#9C27B020' }]}>
                      <MaterialIcons 
                        name="bedtime" 
                        size={32} 
                        color="#9C27B0" 
                      />
                    </View>
                    <ThemedText style={styles.metricLabel}>
                      {t('sleep')}
                    </ThemedText>
                    <View style={styles.metricValueContainer}>
                      <ThemedText type="defaultSemiBold" style={styles.metricValue}>
                        {sleepHours ? (sleepHours / 60).toFixed(1) : t('no_data')}
                      </ThemedText>
                      {sleepHours ? (
                        <ThemedText style={styles.metricUnit}>
                          {' '}{t('hours')}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Mindfulness Section */}
                <View style={styles.mindfulnessSection}>
                  <View style={[styles.metricCard, styles.fullWidthCard]}>
                    <View style={[styles.metricIconContainer, { backgroundColor: '#00BCD420' }]}>
                      <MaterialIcons 
                        name="spa" 
                        size={32} 
                        color="#00BCD4" 
                      />
                    </View>
                    <ThemedText style={styles.metricLabel}>
                      {t('mindful_minutes')}
                    </ThemedText>
                    <View style={styles.metricValueContainer}>
                      <ThemedText type="defaultSemiBold" style={styles.metricValue}>
                        {healthData.mindfulMinutes || t('no_data')}
                      </ThemedText>
                      {healthData.mindfulMinutes ? (
                        <ThemedText style={styles.metricUnit}>
                          {' '}{t('minutes')}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                </View>

                {Object.keys(healthData).length === 0 && (
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={loadHealthData}
                  >
                    <MaterialIcons name="sync" size={24} color="#ffffff" />
                    <ThemedText style={styles.connectButtonText}>
                      {t('connect_health')}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      
      {/* Source Selection Modal */}
      <Modal
        visible={sourceModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSourceModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSourceModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                {t('sleep_source')}
              </ThemedText>
            </View>
            
            {/* All Sources option */}
            <TouchableOpacity
              style={[
                styles.sourceOption,
                selectedSourceId === 'all' && styles.selectedSourceOption
              ]}
              onPress={() => {
                setSelectedSourceId('all');
                setSourceModalVisible(false);
              }}
            >
              <ThemedText style={styles.sourceOptionText}>
                {t('all_sources')}
              </ThemedText>
              {selectedSourceId === 'all' && (
                <MaterialIcons name="check" size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
            
            {/* Individual sources */}
            {healthData.sleepSources?.map((source) => (
              <TouchableOpacity
                key={source.sourceId}
                style={[
                  styles.sourceOption,
                  selectedSourceId === source.sourceId && styles.selectedSourceOption
                ]}
                onPress={() => {
                  setSelectedSourceId(source.sourceId);
                  setSourceModalVisible(false);
                }}
              >
                <View style={styles.sourceOptionContent}>
                  <ThemedText style={styles.sourceOptionText}>
                    {source.sourceName}
                  </ThemedText>
                  <ThemedText style={styles.sourceOptionHours}>
                    {(source.totalHours).toFixed(1)} {t('hours')}
                  </ThemedText>
                </View>
                {selectedSourceId === source.sourceId && (
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  content: {
    padding: 20,
    paddingTop: 40,
  },
  todaySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  sleepSection: {
    marginBottom: 20,
  },
  mindfulnessSection: {
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  fullWidthCard: {
    width: '100%',
  },
  metricIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 24,
    color: '#ffffff',
  },
  metricUnit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  unavailableText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  connectButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  sourceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sourceSelectorLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 8,
  },
  sourceSelectorValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2C3E50',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    color: '#ffffff',
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  selectedSourceOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceOptionContent: {
    flex: 1,
  },
  sourceOptionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  sourceOptionHours: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
});