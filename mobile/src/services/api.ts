import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Types shared with the web app
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

// Configure API base URL
const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: 'http://localhost:3000',
      android: 'http://10.0.2.2:3000', // 10.0.2.2 is the special IP for the host machine when running in Android emulator
      default: 'http://localhost:3000',
    })
  : 'https://api.linkorbit.com'; // Production URL

// Store auth token
const storeAuthToken = async (token: string): Promise<void> => {
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem('auth_token', token);
    }
  } else {
    // For web, use localStorage
    localStorage.setItem('auth_token', token);
  }
};

// Get stored auth token
const getAuthToken = async (): Promise<string | null> => {
  if (Platform.OS !== 'web') {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore fails
      return await AsyncStorage.getItem('auth_token');
    }
  } else {
    // For web, use localStorage
    return localStorage.getItem('auth_token');
  }
};

// Remove auth token (for logout)
const removeAuthToken = async (): Promise<void> => {
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.removeItem('auth_token');
    }
  } else {
    // For web, use localStorage
    localStorage.removeItem('auth_token');
  }
};

// API request with auth token
const apiRequest = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
): Promise<T> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Build request options
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add auth token if available
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        // Add app info
        'X-App-Version': Constants.expoConfig?.version || '1.0.0',
        'X-Platform': Platform.OS,
      },
    };
    
    // Add body data for non-GET requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Parse response
    const responseData = await response.json();
    
    // Check for error status
    if (!response.ok) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    return responseData as T;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Auth API
const auth = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiRequest<{ token: string; user: User }>('/api/login', 'POST', { email, password });
    if (response.token) {
      await storeAuthToken(response.token);
    }
    return response.user;
  },
  
  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await apiRequest<{ token: string; user: User }>('/api/register', 'POST', { username, email, password });
    if (response.token) {
      await storeAuthToken(response.token);
    }
    return response.user;
  },
  
  logout: async (): Promise<void> => {
    await apiRequest('/api/logout', 'POST');
    await removeAuthToken();
  },
  
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/api/user');
  },
  
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    return apiRequest<User>('/api/profile', 'PATCH', profileData);
  },
  
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return apiRequest('/api/profile/password', 'PATCH', {
      currentPassword,
      newPassword,
    });
  },
};

// Links API
const links = {
  getAll: async (): Promise<Link[]> => {
    return apiRequest<Link[]>('/api/links');
  },
  
  getByPlatform: async (platform: string): Promise<Link[]> => {
    return apiRequest<Link[]>(`/api/links?platform=${platform}`);
  },
  
  getById: async (id: number): Promise<Link> => {
    return apiRequest<Link>(`/api/links/${id}`);
  },
  
  add: async (url: string): Promise<Link> => {
    return apiRequest<Link>('/api/links', 'POST', { url });
  },
  
  delete: async (id: number): Promise<void> => {
    return apiRequest(`/api/links/${id}`, 'DELETE');
  },
  
  markAsViewed: async (id: number): Promise<void> => {
    return apiRequest(`/api/links/${id}/view`, 'POST');
  },
  
  updateTitle: async (id: number, title: string): Promise<void> => {
    return apiRequest(`/api/links/${id}/title`, 'PATCH', { title });
  },
  
  updateCategory: async (id: number, category: string): Promise<void> => {
    return apiRequest(`/api/links/${id}/category`, 'PATCH', { category });
  },
};

// Tags API
const tags = {
  create: async (linkId: number, name: string): Promise<Tag> => {
    return apiRequest<Tag>('/api/tags', 'POST', { link_id: linkId, name });
  },
  
  delete: async (id: number): Promise<void> => {
    return apiRequest(`/api/tags/${id}`, 'DELETE');
  },
};

// Custom tabs API
const customTabs = {
  getAll: async (): Promise<CustomTab[]> => {
    return apiRequest<CustomTab[]>('/api/custom-tabs');
  },
  
  getById: async (id: number): Promise<CustomTab> => {
    return apiRequest<CustomTab>(`/api/custom-tabs/${id}`);
  },
  
  create: async (name: string): Promise<CustomTab> => {
    return apiRequest<CustomTab>('/api/custom-tabs', 'POST', { name });
  },
  
  delete: async (id: number): Promise<void> => {
    return apiRequest(`/api/custom-tabs/${id}`, 'DELETE');
  },
  
  addLink: async (tabId: number, linkId: number): Promise<void> => {
    return apiRequest(`/api/custom-tabs/${tabId}/links/${linkId}`, 'POST');
  },
  
  removeLink: async (tabId: number, linkId: number): Promise<void> => {
    return apiRequest(`/api/custom-tabs/${tabId}/links/${linkId}`, 'DELETE');
  },
  
  getLinks: async (tabId: number): Promise<Link[]> => {
    return apiRequest<Link[]>(`/api/custom-tabs/${tabId}/links`);
  },
};

// Recommendations API
const recommendations = {
  getRecommendations: async (): Promise<Link[]> => {
    return apiRequest<Link[]>('/api/recommendations');
  },
  
  getUnviewedRecommendations: async (): Promise<Link[]> => {
    return apiRequest<Link[]>('/api/recommendations/not-viewed');
  },
};

// Export API client
export const api = {
  auth,
  links,
  tags,
  customTabs,
  recommendations,
};

// Export types
export type { User, Link, Tag, CustomTab };