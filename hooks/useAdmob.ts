import { useEffect, useRef, useState } from "react";
import { Platform } from 'react-native';
import { isAdMobAvailable } from '@/utils/admobHelper';

const useAdmob = () => {
  const [lastRewardedAdTime, setLastRewardedAdTime] = useState<Date | null>(null);
  const [isInterstitialBlocked, setIsInterstitialBlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = isAdMobAvailable() ? '[AdMob' : '[Mock AdMob';
    console.log(`${prefix} ${timestamp}] ${message}`, data ? data : '');
  };

  // AdMobが利用可能でない場合のモック実装
  const mockImplementation = {
    loadRewarded: () => {
      log('Loading rewarded ad (mock)');
      setTimeout(() => {
        log('Rewarded ad completed (mock)');
        const completionTime = new Date();
        setLastRewardedAdTime(completionTime);
        setIsInterstitialBlocked(true);
        
        if (blockTimerRef.current) {
          clearTimeout(blockTimerRef.current);
        }
        
        log('Blocking interstitial ads for 1 minute');
        blockTimerRef.current = setTimeout(() => {
          setIsInterstitialBlocked(false);
          log('Interstitial ads unblocked');
        }, 60000);
      }, 2000);
    },

    loadInterstitial: () => {
      if (isInterstitialBlocked) {
        const remainingTime = lastRewardedAdTime 
          ? Math.max(0, 60000 - (Date.now() - lastRewardedAdTime.getTime()))
          : 0;
        log(`Interstitial blocked. Remaining time: ${Math.floor(remainingTime / 1000)}s`);
        return;
      }
      log('Loading interstitial ad (mock)');
      setTimeout(() => {
        log('Interstitial ad displayed (mock)');
      }, 1000);
    },

    initialize: async () => {
      try {
        log('Initializing AdMob (mock mode for Expo Go)');
        setIsInitialized(true);
        return true;
      } catch (error) {
        log('Initialization error', error);
        return false;
      }
    }
  };

  // 実際のAdMob実装
  const realImplementation = {
    loadRewarded: () => {
      log('Loading rewarded ad');
      // Dynamic import will be handled in the effect
    },

    loadInterstitial: () => {
      if (isInterstitialBlocked) {
        const remainingTime = lastRewardedAdTime 
          ? Math.max(0, 60000 - (Date.now() - lastRewardedAdTime.getTime()))
          : 0;
        log(`Interstitial blocked. Remaining time: ${Math.floor(remainingTime / 1000)}s`);
        return;
      }
      log('Loading interstitial ad');
      // Dynamic import will be handled in the effect
    },

    initialize: async () => {
      try {
        // iOS向けのトラッキング許可リクエスト
        if (Platform.OS === 'ios') {
          try {
            const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
            const { status } = await requestTrackingPermissionsAsync();
            if (status !== 'granted') {
              log('Tracking permission not granted');
            }
          } catch (error) {
            log('Tracking permission module not available', error);
          }
        }
        
        // AdMob初期化
        const mobileAds = (await import('react-native-google-mobile-ads')).default;
        await mobileAds().initialize();
        log('AdMob initialized successfully');
        setIsInitialized(true);
        return true;
      } catch (error) {
        log('Initialization error', error);
        setIsInitialized(false);
        return false;
      }
    }
  };

  // AdMob利用可能性に基づいて実装を選択
  const implementation = isAdMobAvailable() ? realImplementation : mockImplementation;

  // 実際のAdMob広告のセットアップ（利用可能な場合のみ）
  useEffect(() => {
    if (!isAdMobAvailable()) {
      // モック実装の場合はタイマーのクリーンアップのみ
      return () => {
        if (blockTimerRef.current) {
          clearTimeout(blockTimerRef.current);
        }
      };
    }

    // 実際のAdMob実装
    let rewarded: any = null;
    let interstitial: any = null;
    let unsubscribeFunctions: (() => void)[] = [];

    const setupAdMob = async () => {
      try {
        const {
          RewardedAdEventType,
          RewardedAd,
          TestIds,
          InterstitialAd,
          AdEventType,
        } = await import("react-native-google-mobile-ads");

        // 広告インスタンスの作成
        rewarded = RewardedAd.createForAdRequest(
          __DEV__ ? TestIds.REWARDED : 'ca-app-pub-8544694020228255/YOUR_REWARDED_ID'
        );
        interstitial = InterstitialAd.createForAdRequest(
          __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-8544694020228255/YOUR_INTERSTITIAL_ID'
        );

        // リワード広告のイベントリスナー
        const unsubscribeLoaded = rewarded.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => {
            log('Rewarded ad loaded');
            rewarded.show();
          }
        );

        const unsubscribeEarned = rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: any) => {
            const completionTime = new Date();
            log('Reward earned', { 
              type: reward.type, 
              amount: reward.amount,
              completionTime: completionTime.toISOString()
            });
            
            setLastRewardedAdTime(completionTime);
            setIsInterstitialBlocked(true);
            
            if (blockTimerRef.current) {
              clearTimeout(blockTimerRef.current);
            }
            
            log('Blocking interstitial ads for 1 minute');
            blockTimerRef.current = setTimeout(() => {
              setIsInterstitialBlocked(false);
              log('Interstitial ads unblocked');
            }, 60000);
          }
        );

        const unsubscribeInterstitialLoaded = interstitial.addAdEventListener(
          AdEventType.LOADED,
          () => {
            log('Interstitial ad loaded');
            if (!isInterstitialBlocked) {
              interstitial.show();
            } else {
              log('Interstitial ad display skipped (blocked)');
            }
          }
        );

        // その他のイベントリスナー
        const unsubscribeError = rewarded.addAdEventListener(
          AdEventType.ERROR,
          (error: any) => {
            log('Rewarded ad error', error);
          }
        );

        const unsubscribeInterstitialError = interstitial.addAdEventListener(
          AdEventType.ERROR,
          (error: any) => {
            log('Interstitial ad error', error);
          }
        );

        // クリーンアップ用の関数を保存
        unsubscribeFunctions = [
          unsubscribeLoaded,
          unsubscribeEarned,
          unsubscribeInterstitialLoaded,
          unsubscribeError,
          unsubscribeInterstitialError
        ];

        // loadRewarded と loadInterstitial の実装を更新
        realImplementation.loadRewarded = () => {
          log('Loading rewarded ad');
          rewarded?.load();
        };

        realImplementation.loadInterstitial = () => {
          if (isInterstitialBlocked) {
            const remainingTime = lastRewardedAdTime 
              ? Math.max(0, 60000 - (Date.now() - lastRewardedAdTime.getTime()))
              : 0;
            log(`Interstitial blocked. Remaining time: ${Math.floor(remainingTime / 1000)}s`);
            return;
          }
          log('Loading interstitial ad');
          interstitial?.load();
        };

      } catch (error) {
        log('Failed to setup AdMob', error);
      }
    };

    setupAdMob();

    return () => {
      // イベントリスナーのクリーンアップ
      unsubscribeFunctions.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          // イベントリスナーのクリーンアップエラーは無視
        }
      });
      
      // タイマーのクリーンアップ
      if (blockTimerRef.current) {
        clearTimeout(blockTimerRef.current);
      }
    };
  }, [isInterstitialBlocked]);

  return { 
    loadRewarded: implementation.loadRewarded, 
    loadInterstitial: implementation.loadInterstitial,
    isInterstitialBlocked,
    lastRewardedAdTime,
    isInitialized,
    initialize: implementation.initialize
  };
};

export default useAdmob;