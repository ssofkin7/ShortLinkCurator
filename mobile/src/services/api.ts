import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Define the base URL for API requests
const API_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://api.linkorbit.com';

// Type definitions
type User = {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
};

type Link = {
  id: number;
  url: string;
  title: string;
  platform: string;
  category: string;
  created_at: string;
  last_viewed?: string;
  view_count: number;
  thumbnail_url?: string;
  tags: Tag[];
};

type Tag = {
  id: number;
  name: string;
  created_at: string;
  link_id: number;
};

type CustomTab = {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  links: Link[];
};

// Token management
const storeToken = async (token: string) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await SecureStore.setItemAsync('auth_token', token);
    }
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem('auth_token');
    } else {
      return await SecureStore.getItemAsync('auth_token');
    }
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

const removeToken = async () => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem('auth_token');
    } else {
      await SecureStore.deleteItemAsync('auth_token');
    }
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  const token = await getToken();
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    // Check if response is not ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    console.error(`API request error: ${endpoint}`, error);
    throw error;
  }
};

// Auth API
const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiRequest<{ token: string; user: User }>('/api/login', 'POST', { email, password });
    await storeToken(response.token);
    return response.user;
  },
  
  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await apiRequest<{ token: string; user: User }>('/api/register', 'POST', { username, email, password });
    await storeToken(response.token);
    return response.user;
  },
  
  logout: async (): Promise<void> => {
    await apiRequest('/api/logout', 'POST');
    await removeToken();
  },
  
  getCurrentUser: async (): Promise<User> => {
    return await apiRequest<User>('/api/user');
  },
  
  updateProfile: async (profileData: { displayName?: string; bio?: string }): Promise<User> => {
    return await apiRequest<User>('/api/profile', 'PATCH', profileData);
  },
  
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiRequest<void>('/api/profile/password', 'PATCH', { currentPassword, newPassword });
  },
  
  updateNotificationPreferences: async (preferences: {
    emailNotifications?: boolean;
    newContentAlerts?: boolean;
    weeklyDigest?: boolean;
    platformUpdates?: boolean;
  }): Promise<void> => {
    await apiRequest<void>('/api/profile/notifications', 'PATCH', preferences);
  }
};

// Links API
const linksApi = {
  getLinks: async (): Promise<Link[]> => {
    return await apiRequest<Link[]>('/api/links');
  },
  
  getLinksByPlatform: async (platform: string): Promise<Link[]> => {
    return await apiRequest<Link[]>(`/api/links?platform=${platform}`);
  },
  
  getLink: async (id: number): Promise<Link> => {
    return await apiRequest<Link>(`/api/links/${id}`);
  },
  
  addLink: async (url: string): Promise<Link> => {
    return await apiRequest<Link>('/api/links', 'POST', { url });
  },
  
  deleteLink: async (id: number): Promise<void> => {
    await apiRequest<void>(`/api/links/${id}`, 'DELETE');
  },
  
  updateLinkTitle: async (id: number, title: string): Promise<void> => {
    await apiRequest<void>(`/api/links/${id}/title`, 'PATCH', { title });
  },
  
  updateLinkCategory: async (id: number, category: string): Promise<void> => {
    await apiRequest<void>(`/api/links/${id}/category`, 'PATCH', { category });
  },
  
  markLinkAsViewed: async (id: number): Promise<void> => {
    await apiRequest<void>(`/api/links/${id}/view`, 'POST');
  },
  
  getRecommendations: async (): Promise<Link[]> => {
    return await apiRequest<Link[]>('/api/recommendations');
  },
  
  getNotViewedRecommendations: async (): Promise<Link[]> => {
    return await apiRequest<Link[]>('/api/recommendations/not-viewed');
  }
};

// Tags API
const tagsApi = {
  createTag: async (linkId: number, name: string): Promise<Tag> => {
    return await apiRequest<Tag>('/api/tags', 'POST', { link_id: linkId, name });
  },
  
  deleteTag: async (id: number): Promise<void> => {
    await apiRequest<void>(`/api/tags/${id}`, 'DELETE');
  }
};

// Custom Tabs API
const tabsApi = {
  getTabs: async (): Promise<CustomTab[]> => {
    return await apiRequest<CustomTab[]>('/api/custom-tabs');
  },
  
  getTab: async (id: number): Promise<CustomTab> => {
    return await apiRequest<CustomTab>(`/api/custom-tabs/${id}`);
  },
  
  createTab: async (name: string): Promise<CustomTab> => {
    return await apiRequest<CustomTab>('/api/custom-tabs', 'POST', { name });
  },
  
  deleteTab: async (id: number): Promise<void> => {
    await apiRequest<void>(`/api/custom-tabs/${id}`, 'DELETE');
  },
  
  addLinkToTab: async (tabId: number, linkId: number): Promise<void> => {
    await apiRequest<void>(`/api/custom-tabs/${tabId}/links/${linkId}`, 'POST');
  },
  
  removeLinkFromTab: async (tabId: number, linkId: number): Promise<void> => {
    await apiRequest<void>(`/api/custom-tabs/${tabId}/links/${linkId}`, 'DELETE');
  },
  
  getLinksInTab: async (tabId: number): Promise<Link[]> => {
    return await apiRequest<Link[]>(`/api/custom-tabs/${tabId}/links`);
  }
};

// Export API utilities
export const api = {
  auth: authApi,
  links: linksApi,
  tags: tagsApi,
  tabs: tabsApi
};