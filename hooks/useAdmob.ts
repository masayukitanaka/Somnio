import { useEffect, useRef, useState } from "react";
import { isAdMobAvailable } from '@/utils/admobHelper';

// グローバルに広告インスタンスを保持
let globalRewardedAd: any = null;
let globalInterstitialAd: any = null;

const useAdmob = () => {
  const [lastRewardedAdTime, setLastRewardedAdTime] = useState<Date | null>(null);
  const [isInterstitialBlocked, setIsInterstitialBlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardCallbackRef = useRef<((success: boolean) => void) | null>(null);
  const setupCompleteRef = useRef(false);
  const pendingLoadRequestRef = useRef(false);
  const rewardEarnedRef = useRef(false);

  const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[AdMob ${timestamp}] ${message}`, data ? data : '');
  };


  // リワード広告を直接ロードする関数
  const loadRewardedAd = (callback?: (success: boolean) => void) => {
    log('Loading rewarded ad');
    rewardCallbackRef.current = callback || null;
    rewardEarnedRef.current = false; // リセット
    log('Setup complete:', setupCompleteRef.current);
    
    if (!setupCompleteRef.current) {
      log('Setup not complete yet, marking as pending');
      pendingLoadRequestRef.current = true;
      return;
    }
    
    const rewardedToUse = globalRewardedAd;
    if (!rewardedToUse) {
      log('No rewarded ad instance available');
      if (rewardCallbackRef.current) {
        rewardCallbackRef.current(false);
        rewardCallbackRef.current = null;
      }
      return;
    }
    
    // 既に読み込まれているかチェック
    if (rewardedToUse.loaded) {
      log('Rewarded ad already loaded, showing immediately');
      try {
        rewardedToUse.show();
        log('Called rewarded.show() for already loaded ad');
      } catch (error) {
        log('Error showing already loaded ad', error);
        if (rewardCallbackRef.current) {
          rewardCallbackRef.current(false);
          rewardCallbackRef.current = null;
        }
      }
    } else {
      log('Loading new rewarded ad, current loaded state:', rewardedToUse.loaded);
      try {
        log('Calling rewarded.load()...');
        rewardedToUse.load();
        log('rewarded.load() called successfully');
        
        // ロード開始後の状態をログ
        setTimeout(() => {
          log('5 seconds after load - rewarded.loaded:', rewardedToUse.loaded);
        }, 5000);
      } catch (error) {
        log('Error calling rewarded.load()', error);
        if (rewardCallbackRef.current) {
          rewardCallbackRef.current(false);
          rewardCallbackRef.current = null;
        }
      }
    }
  };

  // AdMob実装
  const implementation = {
    loadRewarded: loadRewardedAd,

    loadInterstitial: () => {
      if (isInterstitialBlocked) {
        const remainingTime = lastRewardedAdTime 
          ? Math.max(0, 60000 - (Date.now() - lastRewardedAdTime.getTime()))
          : 0;
        log(`Interstitial blocked. Remaining time: ${Math.floor(remainingTime / 1000)}s`);
        return;
      }
      log('Loading interstitial ad');
      const interstitialToUse = globalInterstitialAd;
      if (interstitialToUse) {
        interstitialToUse.load();
      } else {
        log('No interstitial ad instance available');
      }
    },

    initialize: async () => {
      try {
        // AdMob初期化（トラッキング許可は_layout.tsxで処理済み）
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

  // AdMob広告のセットアップ
  useEffect(() => {
    // AdMob実装のセットアップ
    let rewarded: any = null;
    let interstitial: any = null;
    let unsubscribeFunctions: (() => void)[] = [];

    const setupAdMob = async () => {
      try {
        if (!isAdMobAvailable()) {
          log('AdMob native module not available');
          return;
        }

        const {
          RewardedAdEventType,
          RewardedAd,
          TestIds,
          InterstitialAd,
          AdEventType,
        } = await import("react-native-google-mobile-ads");

        // 広告インスタンスの作成
        const rewardedAdId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-8544694020228255/YOUR_REWARDED_ID';
        const interstitialAdId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-8544694020228255/YOUR_INTERSTITIAL_ID';
        
        log('Creating rewarded ad with ID:', rewardedAdId);
        rewarded = RewardedAd.createForAdRequest(rewardedAdId);
        globalRewardedAd = rewarded; // グローバルに保存
        log('Rewarded ad instance created:', rewarded ? 'success' : 'failed');
        
        log('Creating interstitial ad with ID:', interstitialAdId);
        interstitial = InterstitialAd.createForAdRequest(interstitialAdId);
        globalInterstitialAd = interstitial; // グローバルに保存
        log('Interstitial ad instance created:', interstitial ? 'success' : 'failed');

        // リワード広告のイベントリスナー
        log('Setting up rewarded ad event listeners...');
        const unsubscribeLoaded = rewarded.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => {
            log('Rewarded ad LOADED event fired');
            log('Callback ref exists:', rewardCallbackRef.current ? 'yes' : 'no');
            // 広告がロードされた時点で、コールバックが設定されている場合のみ表示
            if (rewardCallbackRef.current) {
              try {
                log('Showing loaded rewarded ad...');
                rewarded.show();
                log('Rewarded ad show() called successfully');
              } catch (error) {
                log('Error calling rewarded.show()', error);
                // Call failure callback if show fails
                if (rewardCallbackRef.current) {
                  rewardCallbackRef.current(false);
                  rewardCallbackRef.current = null;
                }
              }
            } else {
              log('No callback set, not showing ad automatically');
            }
          }
        );
        log('LOADED event listener set up');

        const unsubscribeEarned = rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: any) => {
            const completionTime = new Date();
            log('Reward earned', { 
              type: reward.type, 
              amount: reward.amount,
              completionTime: completionTime.toISOString()
            });
            
            rewardEarnedRef.current = true; // 報酬獲得フラグをセット
            
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
            
            // Call success callback
            if (rewardCallbackRef.current) {
              log('Calling success callback for earned reward');
              rewardCallbackRef.current(true);
              rewardCallbackRef.current = null;
            }
          }
        );

        const unsubscribeClosed = rewarded.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            if (rewardEarnedRef.current) {
              log('Rewarded ad closed (after earning reward)');
              // 報酬獲得後のクローズなので何もしない
            } else {
              log('Rewarded ad closed (user cancelled without reward)');
              // Call failure callback if no reward was earned
              if (rewardCallbackRef.current) {
                log('Calling failure callback for cancelled ad');
                rewardCallbackRef.current(false);
                rewardCallbackRef.current = null;
              }
            }
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
            log('Rewarded ad ERROR event', error);
            log('Error code:', error?.code);
            log('Error message:', error?.message);
            // Call failure callback on error
            if (rewardCallbackRef.current) {
              log('Calling error callback');
              rewardCallbackRef.current(false);
              rewardCallbackRef.current = null;
            } else {
              log('No callback to call for error');
            }
          }
        );

        const unsubscribeOpened = rewarded.addAdEventListener(
          AdEventType.OPENED,
          () => {
            log('Rewarded ad opened/displayed');
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
          unsubscribeClosed,
          unsubscribeOpened,
          unsubscribeInterstitialLoaded,
          unsubscribeError,
          unsubscribeInterstitialError
        ];

        // セットアップ完了をマーク
        setupCompleteRef.current = true;
        log('AdMob setup completed, rewarded ad ready');
        
        // Pending load request があれば実行
        if (pendingLoadRequestRef.current) {
          log('Executing pending load request');
          pendingLoadRequestRef.current = false;
          setTimeout(() => {
            if (rewardCallbackRef.current) {
              log('Calling loadRewardedAd for pending request');
              loadRewardedAd(rewardCallbackRef.current);
            }
          }, 100);
        }



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
  }, []); // 初期化は一度だけ実行

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