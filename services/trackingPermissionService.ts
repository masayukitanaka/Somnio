import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TRACKING_PERMISSION_KEY = '@tracking_permission_status';
const TRACKING_PERMISSION_ASKED_KEY = '@tracking_permission_asked';

export interface TrackingPermissionStatus {
  hasPermission: boolean;
  hasAsked: boolean;
  timestamp: string;
}

export class TrackingPermissionService {
  /**
   * トラッキング許可をリクエストし、結果を保存する
   */
  static async requestTrackingPermission(): Promise<TrackingPermissionStatus> {
    try {
      // iOS以外では常に許可として扱う
      if (Platform.OS !== 'ios') {
        const status: TrackingPermissionStatus = {
          hasPermission: true,
          hasAsked: true,
          timestamp: new Date().toISOString()
        };
        await this.savePermissionStatus(status);
        return status;
      }

      // iOS でのトラッキング許可リクエスト
      const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
      const { status } = await requestTrackingPermissionsAsync();
      
      const permissionStatus: TrackingPermissionStatus = {
        hasPermission: status === 'granted',
        hasAsked: true,
        timestamp: new Date().toISOString()
      };

      await this.savePermissionStatus(permissionStatus);
      
      console.log('[TrackingPermission] Permission requested:', {
        status,
        hasPermission: permissionStatus.hasPermission
      });

      return permissionStatus;
    } catch (error) {
      console.error('[TrackingPermission] Error requesting permission:', error);
      
      // エラーの場合は許可なしとして処理
      const status: TrackingPermissionStatus = {
        hasPermission: false,
        hasAsked: true,
        timestamp: new Date().toISOString()
      };
      await this.savePermissionStatus(status);
      return status;
    }
  }

  /**
   * 現在のトラッキング許可状態を取得する
   */
  static async getTrackingPermissionStatus(): Promise<TrackingPermissionStatus | null> {
    try {
      const stored = await AsyncStorage.getItem(TRACKING_PERMISSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('[TrackingPermission] Error getting permission status:', error);
      return null;
    }
  }

  /**
   * トラッキング許可をすでに尋ねたかどうかをチェック
   */
  static async hasAskedForPermission(): Promise<boolean> {
    try {
      const status = await this.getTrackingPermissionStatus();
      return status?.hasAsked || false;
    } catch (error) {
      console.error('[TrackingPermission] Error checking if asked:', error);
      return false;
    }
  }

  /**
   * トラッキング許可状態を保存する
   */
  private static async savePermissionStatus(status: TrackingPermissionStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(TRACKING_PERMISSION_KEY, JSON.stringify(status));
      // 古い形式のフラグも設定（互換性のため）
      await AsyncStorage.setItem(TRACKING_PERMISSION_ASKED_KEY, 'true');
    } catch (error) {
      console.error('[TrackingPermission] Error saving permission status:', error);
    }
  }

  /**
   * AdMobのパーソナライゼーション設定を適用する
   */
  static async configureAdMobPersonalization(hasTrackingPermission: boolean): Promise<void> {
    try {
      // AdMobが利用可能かチェック
      const { isAdMobAvailable } = await import('@/utils/admobHelper');
      if (!isAdMobAvailable()) {
        console.log('[TrackingPermission] AdMob not available, skipping personalization config');
        return;
      }

      // TODO: AdMob consent configuration currently disabled due to publisher account setup requirement
      // The error "Failed to read publisher's account configuration" indicates that proper consent forms
      // need to be configured in the AdMob console before this functionality can be used.
      // 
      // To enable this feature:
      // 1. Configure consent forms in AdMob console for the app ID: ca-app-pub-8544694020228255~5422999791
      // 2. Uncomment the code below once the forms are properly set up
      
      console.log(`[TrackingPermission] Tracking permission: ${hasTrackingPermission ? 'granted' : 'denied'}`);
      console.log('[TrackingPermission] AdMob consent configuration temporarily disabled - requires publisher account setup');
      
      // Commented out until AdMob account is properly configured:
      /*
      const { AdsConsent } = await import('react-native-google-mobile-ads');
      
      if (hasTrackingPermission) {
        console.log('[TrackingPermission] Enabling personalized ads');
        await AdsConsent.requestInfoUpdate();
      } else {
        console.log('[TrackingPermission] Disabling personalized ads');
        await AdsConsent.reset();
      }
      */
      
    } catch (error) {
      console.error('[TrackingPermission] Error configuring AdMob personalization:', error);
    }
  }

  /**
   * アプリ起動時のトラッキング許可チェックとリクエスト
   */
  static async handleAppLaunchTrackingPermission(): Promise<TrackingPermissionStatus> {
    const hasAsked = await this.hasAskedForPermission();
    
    if (hasAsked) {
      // すでに尋ねている場合は既存の状態を返す
      const status = await this.getTrackingPermissionStatus();
      if (status) {
        console.log('[TrackingPermission] Using existing permission status:', status.hasPermission);
        await this.configureAdMobPersonalization(status.hasPermission);
        return status;
      }
    }

    // まだ尋ねていない場合はリクエスト
    console.log('[TrackingPermission] Requesting tracking permission for first time');
    const status = await this.requestTrackingPermission();
    await this.configureAdMobPersonalization(status.hasPermission);
    return status;
  }
}