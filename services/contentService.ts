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
}

// API configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_TIMEOUT = 10000; // 10 seconds

// API error handling
class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API fetch function
const fetchApi = async (endpoint: string): Promise<any> => {
  if (!API_URL) {
    throw new ApiError('API URL not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    console.log(`Fetching API: ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
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
    console.log('API Response:', data);
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
const transformApiData = (apiData: any): ContentData => {
  console.log('Transform API Data received:', apiData, typeof apiData);
  
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
    Object.keys(apiData).forEach(tab => {
      if (tab === 'sleep' || tab === 'relax' || tab === 'focus') {
        const tabData = apiData[tab];
        Object.keys(tabData).forEach(category => {
          const items = tabData[category];
          if (Array.isArray(items)) {
            const transformedItems = items.map((item: any) => ({
              id: item.id.toString(),
              title: item.title,
              duration: item.duration,
              color: item.color,
              icon: item.icon,
              thumbnail: item.thumbnail,
              audioUrl: item.audioUrl, // API already uses 'audioUrl' field
              description: item.description,
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
        });
      }
    });

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
    console.log('getAllContent received apiData:', apiData);
    
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
    
    return transformApiData(apiData);
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
    const apiData = await fetchApi(`/api/content/audio/${id}`);
    
    if (!apiData) {
      return null;
    }

    return {
      id: apiData.id.toString(),
      title: apiData.title,
      duration: apiData.duration,
      color: apiData.color,
      icon: apiData.icon,
      thumbnail: apiData.thumbnail,
      audioUrl: apiData.source,
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
    const apiData = await fetchApi(`/api/content/audio/search?q=${encodeURIComponent(query)}`);
    
    return apiData.map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      duration: item.duration,
      color: item.color,
      icon: item.icon,
      thumbnail: item.thumbnail,
      audioUrl: item.source,
      description: item.description,
    }));
  } catch (error) {
    console.error(`Failed to search content with query "${query}":`, error);
    throw error;
  }
};