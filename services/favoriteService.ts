import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorites';

export class FavoriteService {
  private static favorites: Set<string> = new Set();
  private static isLoaded = false;

  static async loadFavorites(): Promise<void> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        const favoritesArray = JSON.parse(favoritesJson);
        this.favorites = new Set(favoritesArray);
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = new Set();
      this.isLoaded = true;
    }
  }

  static async saveFavorites(): Promise<void> {
    try {
      const favoritesArray = Array.from(this.favorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  static async isFavorite(itemId: string): Promise<boolean> {
    if (!this.isLoaded) {
      await this.loadFavorites();
    }
    return this.favorites.has(itemId);
  }

  static async toggleFavorite(itemId: string): Promise<boolean> {
    if (!this.isLoaded) {
      await this.loadFavorites();
    }

    if (this.favorites.has(itemId)) {
      this.favorites.delete(itemId);
    } else {
      this.favorites.add(itemId);
    }

    await this.saveFavorites();
    return this.favorites.has(itemId);
  }

  static async getFavorites(): Promise<string[]> {
    if (!this.isLoaded) {
      await this.loadFavorites();
    }
    return Array.from(this.favorites);
  }
}