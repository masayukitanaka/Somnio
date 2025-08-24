import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAdmob from '@/hooks/useAdmob';

interface RewardAdContextType {
  showRewardedAd: () => Promise<boolean>;
  canShowRewardedAd: boolean;
  isRewardedAdBlocked: boolean;
  lastRewardedAdTime: Date | null;
  checkRewardAdSpan: () => Promise<boolean>;
  clearRewardAdCooldown: () => Promise<void>;
}

const RewardAdContext = createContext<RewardAdContextType | undefined>(undefined);

interface RewardAdProviderProps {
  children: ReactNode;
}

const LAST_REWARDED_AD_KEY = '@last_rewarded_ad_time';

export const RewardAdProvider: React.FC<RewardAdProviderProps> = ({ children }) => {
  const { loadRewarded, lastRewardedAdTime: admobLastTime, isInterstitialBlocked } = useAdmob();
  const [lastRewardedAdTime, setLastRewardedAdTime] = useState<Date | null>(null);
  const [canShowRewardedAd, setCanShowRewardedAd] = useState(true);

  // 環境変数からリワード広告の間隔を取得（デフォルト300秒 = 5分）
  const rewardAdSpan = parseInt(process.env.EXPO_REWARD_AD_SPAN || '300') * 1000; // ミリ秒に変換

  useEffect(() => {
    loadLastRewardedTime();
  }, []);

  // AdMobフックの時刻が更新されたら、こちらも更新
  useEffect(() => {
    if (admobLastTime) {
      setLastRewardedAdTime(admobLastTime);
      saveLastRewardedTime(admobLastTime);
    }
  }, [admobLastTime]);

  // 最後のリワード広告時刻を読み込み
  const loadLastRewardedTime = async () => {
    try {
      const stored = await AsyncStorage.getItem(LAST_REWARDED_AD_KEY);
      if (stored) {
        const time = new Date(stored);
        setLastRewardedAdTime(time);
      }
    } catch (error) {
      console.error('Error loading last rewarded ad time:', error);
    }
  };

  // 最後のリワード広告時刻を保存
  const saveLastRewardedTime = async (time: Date) => {
    try {
      await AsyncStorage.setItem(LAST_REWARDED_AD_KEY, time.toISOString());
    } catch (error) {
      console.error('Error saving last rewarded ad time:', error);
    }
  };

  // リワード広告の間隔をチェック
  const checkRewardAdSpan = async (): Promise<boolean> => {
    // 開発時のクールダウン無効化チェック
    const disableCooldown = process.env.EXPO_DISABLE_REWARD_COOLDOWN === '1';
    if (disableCooldown) {
      console.log('[RewardAd] Cooldown disabled for development');
      setCanShowRewardedAd(true);
      return true;
    }
    
    if (!lastRewardedAdTime) {
      return true; // 初回は表示可能
    }
    
    const now = Date.now();
    const timeDifference = now - lastRewardedAdTime.getTime();
    const canShow = timeDifference >= rewardAdSpan;
    
    setCanShowRewardedAd(canShow);
    
    if (!canShow) {
      const remainingTime = Math.ceil((rewardAdSpan - timeDifference) / 1000);
      console.log(`[RewardAd] Still in cooldown. ${remainingTime} seconds remaining.`);
    }
    
    return canShow;
  };

  // リワード広告を表示
  const showRewardedAd = async (): Promise<boolean> => {
    try {
      const canShow = await checkRewardAdSpan();
      
      if (!canShow) {
        console.log('[RewardAd] Ad is in cooldown period');
        return true; // クールダウン中は広告なしで実行を許可
      }
      
      console.log('[RewardAd] Showing rewarded ad');
      
      return new Promise((resolve) => {
        let timeoutId: NodeJS.Timeout;
        let resolved = false;
        
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
        };
        
        // Load the ad with callback
        loadRewarded((success: boolean) => {
          if (!resolved) {
            resolved = true;
            cleanup();
            
            if (success) {
              console.log('[RewardAd] Reward earned, action allowed');
              
              // Update our local state
              const newTime = new Date();
              setLastRewardedAdTime(newTime);
              saveLastRewardedTime(newTime);
              
              resolve(true);
            } else {
              console.log('[RewardAd] Ad closed without reward, access denied');
              resolve(false);
            }
          }
        });
        
        // タイムアウト処理（10秒でタイムアウト - 開発時は短くする）
        const timeoutDuration = __DEV__ ? 10000 : 30000;
        timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            console.log('[RewardAd] Timeout - assuming ad was cancelled');
            resolve(false);
          }
        }, timeoutDuration);
      });
    } catch (error) {
      console.error('[RewardAd] Error showing rewarded ad:', error);
      return false;
    }
  };

  // クールダウンをクリア（開発・デバッグ用）
  const clearRewardAdCooldown = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LAST_REWARDED_AD_KEY);
      setLastRewardedAdTime(null);
      setCanShowRewardedAd(true);
      console.log('[RewardAd] Cooldown cleared');
    } catch (error) {
      console.error('Error clearing reward ad cooldown:', error);
    }
  };

  const isRewardedAdBlocked = !canShowRewardedAd;

  const contextValue: RewardAdContextType = {
    showRewardedAd,
    canShowRewardedAd,
    isRewardedAdBlocked,
    lastRewardedAdTime,
    checkRewardAdSpan,
    clearRewardAdCooldown,
  };

  return (
    <RewardAdContext.Provider value={contextValue}>
      {children}
    </RewardAdContext.Provider>
  );
};

export const useRewardAd = (): RewardAdContextType => {
  const context = useContext(RewardAdContext);
  if (!context) {
    throw new Error('useRewardAd must be used within a RewardAdProvider');
  }
  return context;
};