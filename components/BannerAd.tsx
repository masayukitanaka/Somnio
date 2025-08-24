import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { isAdMobAvailable } from '@/utils/admobHelper';

interface BannerAdProps {
  style?: any;
}

// モック版バナー広告（Expo Go用）
const MockBannerAd: React.FC<BannerAdProps> = ({ style }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAdPress = () => {
    console.log('[Mock BannerAd] Banner ad clicked');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(147, 51, 234, 0.15)', 'rgba(79, 70, 229, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.adContainer}
      >
        <TouchableOpacity
          style={styles.adContent}
          onPress={handleAdPress}
          activeOpacity={0.8}
        >
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>AD</Text>
          </View>
          
          <View style={styles.adTextContainer}>
            <Text style={styles.adTitle}>Premium - Ad Free</Text>
            <Text style={styles.adDescription}>Enjoy unlimited access without ads</Text>
          </View>
          
          <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={18} color="rgba(255, 255, 255, 0.5)" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// 実際のAdMobバナー広告
const RealBannerAd: React.FC<BannerAdProps> = ({ style }) => {
  const [AdMobBanner, setAdMobBanner] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);
  const [TestIds, setTestIds] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const loadAdMob = async () => {
      try {
        const admob = await import('react-native-google-mobile-ads');
        setAdMobBanner(() => admob.BannerAd);
        setBannerAdSize(admob.BannerAdSize);
        setTestIds(admob.TestIds);
        setIsLoaded(true);
        console.log('[BannerAd] AdMob modules loaded successfully');
      } catch (error) {
        console.error('[BannerAd] Failed to load AdMob:', error);
      }
    };

    loadAdMob();
  }, []);

  if (!isLoaded || !AdMobBanner) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Loading ad...</Text>
      </View>
    );
  }

  const adUnitId = __DEV__ 
    ? TestIds.ADAPTIVE_BANNER 
    : 'ca-app-pub-8544694020228255/5508412660';

  return (
    <View style={[styles.container, style]}>
      <AdMobBanner
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          console.log('[BannerAd] Test banner ad loaded successfully');
        }}
        onAdFailedToLoad={(error: any) => {
          console.error('[BannerAd] Banner ad failed to load:', error);
        }}
        onAdOpened={() => {
          console.log('[BannerAd] Banner ad opened');
        }}
        onAdClosed={() => {
          console.log('[BannerAd] Banner ad closed');
        }}
      />
    </View>
  );
};

export const BannerAd: React.FC<BannerAdProps> = (props) => {
  const admobAvailable = isAdMobAvailable();
  
  if (admobAvailable) {
    return <RealBannerAd {...props} />;
  } else {
    return <MockBannerAd {...props} />;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    width: '100%',
  },
  adContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 80,
    marginHorizontal: 20,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  adBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  adBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  adDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    padding: 20,
  },
});