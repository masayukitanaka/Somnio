import contentData from '../assets/data/content.json';

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

// Simulate API delay
const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Get all content data (simulate server API)
export const getAllContent = async (): Promise<ContentData> => {
  await simulateApiDelay();
  return contentData as ContentData;
};

// Get sleep content
export const getSleepContent = async () => {
  await simulateApiDelay();
  return contentData.sleep;
};

// Get relax content
export const getRelaxContent = async () => {
  await simulateApiDelay();
  return contentData.relax;
};

// Get focus content
export const getFocusContent = async () => {
  await simulateApiDelay();
  return contentData.focus;
};

// Get specific content by category and type
export const getContentByCategory = async (
  tab: 'sleep' | 'relax' | 'focus',
  category: string
): Promise<ContentItem[]> => {
  await simulateApiDelay();
  
  const tabData = contentData[tab] as any;
  if (!tabData || !tabData[category]) {
    return [];
  }
  
  return tabData[category];
};

// Get single content item by ID
export const getContentById = async (id: string): Promise<ContentItem | null> => {
  await simulateApiDelay();
  
  // Search through all content to find the item with matching ID
  const allData = contentData as any;
  
  for (const tabKey of Object.keys(allData)) {
    const tabData = allData[tabKey];
    for (const categoryKey of Object.keys(tabData)) {
      const items = tabData[categoryKey];
      const found = items.find((item: ContentItem) => item.id === id);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
};

// Search content across all tabs
export const searchContent = async (query: string): Promise<ContentItem[]> => {
  await simulateApiDelay();
  
  const results: ContentItem[] = [];
  const allData = contentData as any;
  
  for (const tabKey of Object.keys(allData)) {
    const tabData = allData[tabKey];
    for (const categoryKey of Object.keys(tabData)) {
      const items = tabData[categoryKey];
      const matches = items.filter((item: ContentItem) => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...matches);
    }
  }
  
  return results;
};