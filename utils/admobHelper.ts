import { NativeModules } from 'react-native';

/**
 * AdMobモジュールが利用可能かチェック
 * Expo Goでは利用不可、カスタム開発クライアントでのみ利用可能
 */
export const isAdMobAvailable = (): boolean => {
  try {
    // RNGoogleMobileAdsModuleの存在をチェック
    return !!NativeModules.RNGoogleMobileAdsModule;
  } catch (error) {
    console.log('[AdMob] Native module not available - using mock implementation');
    return false;
  }
};

/**
 * 現在の環境を取得
 */
export const getAdMobEnvironment = (): 'production' | 'development' | 'mock' => {
  if (!isAdMobAvailable()) {
    return 'mock';
  }
  return __DEV__ ? 'development' : 'production';
};

console.log(`[AdMob] Environment: ${getAdMobEnvironment()}`);