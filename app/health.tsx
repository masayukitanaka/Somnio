import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, TouchableOpacity, Text, Platform, ActivityIndicator } from 'react-native';
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
  }
};

interface HealthData {
  sleep?: number;
  mindfulMinutes?: number;
}

export default function HealthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [healthData, setHealthData] = useState<HealthData>({});
  const [loading, setLoading] = useState(true);
  const [isHealthAvailable, setIsHealthAvailable] = useState(Platform.OS === 'ios');

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
      
      // Get sleep data
      const sleepData = await healthKitService.getSleepData(today);
      
      // Get mindfulness data  
      const mindfulnessData = await healthKitService.getMindfulnessData(today);
      
      setHealthData({
        sleep: sleepData ? Math.round(sleepData.totalHours * 60) : undefined,
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

  const healthMetrics = [
    {
      id: 'sleep',
      icon: 'bedtime',
      label: t('sleep'),
      value: healthData.sleep ? (healthData.sleep / 60).toFixed(1) : t('no_data'),
      unit: healthData.sleep ? t('hours') : '',
      color: '#9C27B0'
    },
    {
      id: 'mindful',
      icon: 'spa',
      label: t('mindful_minutes'),
      value: healthData.mindfulMinutes || t('no_data'),
      unit: healthData.mindfulMinutes ? t('minutes') : '',
      color: '#00BCD4'
    }
  ];

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            {t('health_title')}
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

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

                <View style={styles.metricsGrid}>
                  {healthMetrics.map((metric) => (
                    <View key={metric.id} style={styles.metricCard}>
                      <View style={[styles.metricIconContainer, { backgroundColor: metric.color + '20' }]}>
                        <MaterialIcons 
                          name={metric.icon as any} 
                          size={32} 
                          color={metric.color} 
                        />
                      </View>
                      <ThemedText style={styles.metricLabel}>
                        {metric.label}
                      </ThemedText>
                      <View style={styles.metricValueContainer}>
                        <ThemedText type="defaultSemiBold" style={styles.metricValue}>
                          {metric.value}
                        </ThemedText>
                        {metric.unit ? (
                          <ThemedText style={styles.metricUnit}>
                            {' '}{metric.unit}
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                  ))}
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  todaySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
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
});