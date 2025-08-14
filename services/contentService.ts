import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface ContentItem {
  id: string;
  title: string;
  duration: string;
  color: string;
  icon: string;
  thumbnail?: string;
  audioUrl?: string;
  description: string;
}

export interface ContentData {
  sleep: {
    sleepyMusic: ContentItem[];
    stories: ContentItem[];
    meditation: ContentItem[];
    whiteNoise: ContentItem[];
  };
  relax: {
    calmingSounds: ContentItem[];
    guidedRelaxation: ContentItem[];
  };
  focus: {
    workMusic: ContentItem[];
    quickMeditation: ContentItem[];
  };
  recommendation?: ContentItem[];
}

// API configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_TIMEOUT = 10000; // 10 seconds
const API_CACHE_EXPIRE_SECONDS = parseInt(process.env.EXPO_PUBLIC_API_EXPIRE || '60', 10);
const CACHE_KEY_PREFIX = 'api_cache_';
const THUMBNAIL_CACHE_DIR = `${FileSystem.documentDirectory}thumbnails/`;

// API error handling
class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Cache utilities
interface CacheEntry {
  data: any;
  timestamp: number;
}

const getCacheKey = (endpoint: string): string => {
  return `${CACHE_KEY_PREFIX}${endpoint.replace(/\//g, '_')}`;
};

const getCachedData = async (endpoint: string): Promise<any | null> => {
  try {
    const cacheKey = getCacheKey(endpoint);
    const cachedEntry = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedEntry) {
      return null;
    }

    const parsedEntry: CacheEntry = JSON.parse(cachedEntry);
    const currentTime = Math.floor(Date.now() / 1000);
    const cacheAge = currentTime - parsedEntry.timestamp;

    if (cacheAge > API_CACHE_EXPIRE_SECONDS) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(cacheKey);
      console.log(`Cache expired for ${endpoint}, age: ${cacheAge}s, max: ${API_CACHE_EXPIRE_SECONDS}s`);
      return null;
    }

    console.log(`Cache hit for ${endpoint}, age: ${cacheAge}s`);
    return parsedEntry.data;
  } catch (error) {
    console.error(`Error reading cache for ${endpoint}:`, error);
    return null;
  }
};

const setCachedData = async (endpoint: string, data: any): Promise<void> => {
  try {
    const cacheKey = getCacheKey(endpoint);
    const cacheEntry: CacheEntry = {
      data: data,
      timestamp: Math.floor(Date.now() / 1000),
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    console.log(`Cached data for ${endpoint}`);
  } catch (error) {
    console.error(`Error caching data for ${endpoint}:`, error);
  }
};

// Get selected audio languages from AsyncStorage
const getSelectedAudioLanguages = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem('audio_languages');
    if (stored) {
      return JSON.parse(stored);
    }
    return ['en']; // Default to English
  } catch (error) {
    console.error('Error getting audio languages:', error);
    return ['en'];
  }
};

// Generic API fetch function with caching
const fetchApi = async (endpoint: string, includeLangParam: boolean = true): Promise<any> => {
  let fullEndpoint = endpoint;
  
  // Add language parameter if requested
  if (includeLangParam) {
    const audioLanguages = await getSelectedAudioLanguages();
    const langParam = audioLanguages.join(',');
    const separator = endpoint.includes('?') ? '&' : '?';
    fullEndpoint = `${endpoint}${separator}lang=${langParam}`;
  }

  // Check cache first
  const cachedData = await getCachedData(fullEndpoint);
  if (cachedData) {
    return cachedData;
  }

  if (!API_URL) {
    throw new ApiError('API URL not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    console.log(`Fetching API: ${API_URL}${fullEndpoint}`);
    const response = await fetch(`${API_URL}${fullEndpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }

    const data = await response.json();
    
    // Cache the successful response
    await setCachedData(fullEndpoint, data);
    
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout');
    }
    
    throw new ApiError(`Network error: ${error.message}`);
  }
};

// Transform API data to match the expected format
const transformApiData = async (apiData: any): Promise<ContentData> => {
  // The API now returns a structured object instead of a flat array
  if (apiData && typeof apiData === 'object' && !Array.isArray(apiData)) {
    // API returns {sleep: {sleepyMusic: [...], stories: [...], ...}, relax: {...}, focus: {...}}
    const result: ContentData = {
      sleep: {
        sleepyMusic: [],
        stories: [],
        meditation: [],
        whiteNoise: [],
      },
      relax: {
        calmingSounds: [],
        guidedRelaxation: [],
      },
      focus: {
        workMusic: [],
        quickMeditation: [],
      },
    };

    // Transform the structured API response
    for (const tab of Object.keys(apiData)) {
      if (tab === 'sleep' || tab === 'relax' || tab === 'focus') {
        const tabData = apiData[tab];
        for (const category of Object.keys(tabData)) {
          const items = tabData[category];
          if (Array.isArray(items)) {
            const transformedItems = await Promise.all(items.map(async (item: any) => {
              let cachedThumbnail = item.thumbnail;
              
              // Cache thumbnail if it exists
              if (item.thumbnail) {
                try {
                  cachedThumbnail = await getCachedThumbnailPath(item.thumbnail);
                } catch (error) {
                  console.error('Error caching thumbnail for item:', item.id, error);
                  cachedThumbnail = item.thumbnail; // fallback to original URL
                }
              }
              
              return {
                id: item.id.toString(),
                title: item.title,
                duration: item.duration,
                color: item.color,
                icon: item.icon,
                thumbnail: cachedThumbnail,
                audioUrl: item.audioUrl, // API already uses 'audioUrl' field
                description: item.description,
              };
            }));

            // Map API categories to our expected categories
            if (tab === 'sleep') {
              if (category === 'sleepyMusic') result.sleep.sleepyMusic = transformedItems;
              if (category === 'stories') result.sleep.stories = transformedItems;
              if (category === 'meditation') result.sleep.meditation = transformedItems;
              if (category === 'whiteNoise') result.sleep.whiteNoise = transformedItems;
            } else if (tab === 'relax') {
              if (category === 'calmingSounds') result.relax.calmingSounds = transformedItems;
              if (category === 'guidedRelaxation') result.relax.guidedRelaxation = transformedItems;
            } else if (tab === 'focus') {
              if (category === 'workMusic') result.focus.workMusic = transformedItems;
              if (category === 'quickMeditation') result.focus.quickMeditation = transformedItems;
            }
          }
        }
      } else if (tab === 'recommendation' && Array.isArray(apiData[tab])) {
        // Handle recommendation
        const transformedItems = await Promise.all(apiData[tab].map(async (item: any) => {
          let cachedThumbnail = item.thumbnail;
          
          // Cache thumbnail if it exists
          if (item.thumbnail) {
            try {
              cachedThumbnail = await getCachedThumbnailPath(item.thumbnail);
            } catch (error) {
              console.error('Error caching thumbnail for item:', item.id, error);
              cachedThumbnail = item.thumbnail; // fallback to original URL
            }
          }
          
          return {
            id: item.id.toString(),
            title: item.title,
            duration: item.duration,
            color: item.color,
            icon: item.icon,
            thumbnail: cachedThumbnail,
            audioUrl: item.audioUrl,
            description: item.description,
          };
        }));
        
        result.recommendation = transformedItems;
      }
    }

    return result;
  }

  // Fallback for unexpected data format
  console.warn('API data has unexpected format:', apiData);
  return {
    sleep: {
      sleepyMusic: [],
      stories: [],
      meditation: [],
      whiteNoise: [],
    },
    relax: {
      calmingSounds: [],
      guidedRelaxation: [],
    },
    focus: {
      workMusic: [],
      quickMeditation: [],
    },
  };
};

// Get all content data from API
export const getAllContent = async (): Promise<ContentData> => {
  try {
    const apiData = await fetchApi('/api/content/audio');
    
    if (!apiData) {
      console.warn('API returned null/undefined data');
      return {
        sleep: {
          sleepyMusic: [],
          stories: [],
          meditation: [],
          whiteNoise: [],
        },
        relax: {
          calmingSounds: [],
          guidedRelaxation: [],
        },
        focus: {
          workMusic: [],
          quickMeditation: [],
        },
      };
    }
    
    return await transformApiData(apiData);
  } catch (error) {
    console.error('Failed to fetch all content:', error);
    throw error;
  }
};

// Get sleep content
export const getSleepContent = async () => {
  try {
    const allContent = await getAllContent();
    return allContent.sleep;
  } catch (error) {
    console.error('Failed to fetch sleep content:', error);
    throw error;
  }
};

// Get relax content
export const getRelaxContent = async () => {
  try {
    const allContent = await getAllContent();
    return allContent.relax;
  } catch (error) {
    console.error('Failed to fetch relax content:', error);
    throw error;
  }
};

// Get focus content
export const getFocusContent = async () => {
  try {
    const allContent = await getAllContent();
    return allContent.focus;
  } catch (error) {
    console.error('Failed to fetch focus content:', error);
    throw error;
  }
};

// Get specific content by category and type
export const getContentByCategory = async (
  tab: 'sleep' | 'relax' | 'focus',
  category: string
): Promise<ContentItem[]> => {
  try {
    const allContent = await getAllContent();
    const tabData = allContent[tab] as any;
    
    if (!tabData || !tabData[category]) {
      return [];
    }
    
    return tabData[category];
  } catch (error) {
    console.error(`Failed to fetch content for ${tab}/${category}:`, error);
    throw error;
  }
};

// Get single content item by ID
export const getContentById = async (id: string): Promise<ContentItem | null> => {
  try {
    const apiData = await fetchApi(`/api/content/audio/${id}`, false); // Don't include lang param for specific ID
    
    if (!apiData) {
      return null;
    }

    let cachedThumbnail = apiData.thumbnail;
    
    // Cache thumbnail if it exists
    if (apiData.thumbnail) {
      try {
        cachedThumbnail = await getCachedThumbnailPath(apiData.thumbnail);
      } catch (error) {
        console.error('Error caching thumbnail for item:', apiData.id, error);
        cachedThumbnail = apiData.thumbnail; // fallback to original URL
      }
    }

    return {
      id: apiData.id.toString(),
      title: apiData.title,
      duration: apiData.duration,
      color: apiData.color,
      icon: apiData.icon,
      thumbnail: cachedThumbnail,
      audioUrl: apiData.audioUrl,
      description: apiData.description,
    };
  } catch (error) {
    console.error(`Failed to fetch content by ID ${id}:`, error);
    return null;
  }
};

// Search content across all tabs
export const searchContent = async (query: string): Promise<ContentItem[]> => {
  try {
    const apiData = await fetchApi(`/api/content/audio/search?q=${encodeURIComponent(query)}`, true); // Include lang param for search
    
    return await Promise.all(apiData.map(async (item: any) => {
      let cachedThumbnail = item.thumbnail;
      
      // Cache thumbnail if it exists
      if (item.thumbnail) {
        try {
          cachedThumbnail = await getCachedThumbnailPath(item.thumbnail);
        } catch (error) {
          console.error('Error caching thumbnail for item:', item.id, error);
          cachedThumbnail = item.thumbnail; // fallback to original URL
        }
      }
      
      return {
        id: item.id.toString(),
        title: item.title,
        duration: item.duration,
        color: item.color,
        icon: item.icon,
        thumbnail: cachedThumbnail,
        audioUrl: item.audioUrl,
        description: item.description,
      };
    }));
  } catch (error) {
    console.error(`Failed to search content with query "${query}":`, error);
    throw error;
  }
};

// Get recommendations from API
export const getRecommendations = async (): Promise<ContentItem[]> => {
  try {
    const allContent = await getAllContent();
    return allContent.recommendation || [];
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    throw error;
  }
};

// Clear all cached data
export const clearApiCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`Cleared ${cacheKeys.length} cache entries`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Clear thumbnail cache
export const clearThumbnailCache = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(THUMBNAIL_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(THUMBNAIL_CACHE_DIR, { idempotent: true });
      console.log('Cleared thumbnail cache directory');
    }
  } catch (error) {
    console.error('Error clearing thumbnail cache:', error);
  }
};

// Clear API cache when audio languages change
export const clearApiCacheForLanguageChange = async (): Promise<void> => {
  try {
    // Clear API cache to force fresh data with new language parameters
    await clearApiCache();
    console.log('Cleared API cache for language change');
    
    // Set flag to trigger content refresh
    await AsyncStorage.setItem('languages_changed', 'true');
  } catch (error) {
    console.error('Error clearing cache for language change:', error);
  }
};

// Thumbnail caching utilities
const getFileNameFromUrl = (url: string): string => {
  return url.split('/').pop() || 'unknown';
};

const getThumbnailLocalPath = (url: string): string => {
  const fileName = getFileNameFromUrl(url);
  return `${THUMBNAIL_CACHE_DIR}${fileName}`;
};

const ensureThumbnailDirectoryExists = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(THUMBNAIL_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(THUMBNAIL_CACHE_DIR, { intermediates: true });
      console.log('Created thumbnail cache directory');
    }
  } catch (error) {
    console.error('Error creating thumbnail directory:', error);
  }
};

const isThumbnailCached = async (url: string): Promise<boolean> => {
  try {
    const localPath = getThumbnailLocalPath(url);
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking thumbnail cache:', error);
    return false;
  }
};

const downloadThumbnail = async (url: string): Promise<string | null> => {
  try {
    await ensureThumbnailDirectoryExists();
    
    const localPath = getThumbnailLocalPath(url);
    
    // Check if already cached
    if (await isThumbnailCached(url)) {
      console.log(`Thumbnail already cached: ${getFileNameFromUrl(url)}`);
      return localPath;
    }
    
    console.log(`Downloading thumbnail: ${getFileNameFromUrl(url)}`);
    const downloadResult = await FileSystem.downloadAsync(url, localPath);
    
    if (downloadResult.status === 200) {
      console.log(`Thumbnail cached successfully: ${getFileNameFromUrl(url)}`);
      return localPath;
    } else {
      console.error(`Failed to download thumbnail, status: ${downloadResult.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error downloading thumbnail:', error);
    return null;
  }
};

const getCachedThumbnailPath = async (url: string): Promise<string> => {
  try {
    // Check if thumbnail is already cached
    if (await isThumbnailCached(url)) {
      return getThumbnailLocalPath(url);
    }
    
    // Try to download and cache the thumbnail
    const cachedPath = await downloadThumbnail(url);
    if (cachedPath) {
      return cachedPath;
    }
    
    // Fallback to original URL if caching fails
    console.warn(`Failed to cache thumbnail, using original URL: ${url}`);
    return url;
  } catch (error) {
    console.error('Error getting cached thumbnail:', error);
    return url;
  }
};