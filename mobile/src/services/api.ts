import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { User, Link, Tag, CustomTab } from '../types';

// API Configuration
const API_URL = __DEV__ 
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api' // Android emulator
    : 'http://localhost:5000/api' // iOS simulator or web
  : 'https://linkorbit.replit.app/api'; // Production URL

// Auth Token Management
const AUTH_TOKEN_KEY = 'linkOrbit_auth_token';

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function setAuthToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

async function removeAuthToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
}

// API Request Helper
async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  noAuth = false
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (!noAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  
  if (data) {
    requestOptions.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Parse json response or return empty object
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = {};
    }
    
    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(
        responseData.message || `API error: ${response.status} ${response.statusText}`
      );
    }
    
    return responseData as T;
  } catch (error) {
    // Enhance error with request details for better debugging
    console.error(`API request failed: ${method} ${url}`, error);
    throw error;
  }
}

// API Service
export const api = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await request<User>('/login', 'POST', { email, password }, true);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await request<User>('/register', 'POST', { username, email, password }, true);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    try {
      await request<void>('/logout', 'POST');
      await removeAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await request<User>('/user', 'GET');
      return response;
    } catch (error) {
      // Don't throw on 401s for getCurrentUser
      if (error instanceof Error && error.message.includes('401')) {
        return null;
      }
      console.error('Get user error:', error);
      throw error;
    }
  },
  
  async getLinks(): Promise<Link[]> {
    return request<Link[]>('/links', 'GET');
  },

  async getLinksByPlatform(platform: string): Promise<Link[]> {
    return request<Link[]>(`/links?platform=${platform}`, 'GET');
  },
  
  async getLink(id: number): Promise<Link> {
    return request<Link>(`/links/${id}`, 'GET');
  },
  
  async addLink(url: string): Promise<Link> {
    return request<Link>('/links', 'POST', { url });
  },
  
  async deleteLink(id: number): Promise<void> {
    return request<void>(`/links/${id}`, 'DELETE');
  },
  
  async markLinkViewed(id: number): Promise<void> {
    return request<void>(`/links/${id}/view`, 'POST');
  },
  
  async updateLinkCategory(id: number, category: string): Promise<void> {
    return request<void>(`/links/${id}/category`, 'PATCH', { category });
  },
  
  async updateLinkTitle(id: number, title: string): Promise<void> {
    return request<void>(`/links/${id}/title`, 'PATCH', { title });
  },
  
  async createTag(name: string, linkId: number): Promise<Tag> {
    return request<Tag>('/tags', 'POST', { name, link_id: linkId });
  },
  
  async deleteTag(id: number): Promise<void> {
    return request<void>(`/tags/${id}`, 'DELETE');
  },
  
  async getCustomTabs(): Promise<CustomTab[]> {
    return request<CustomTab[]>('/custom-tabs', 'GET');
  },
  
  async getCustomTabById(id: number): Promise<CustomTab> {
    return request<CustomTab>(`/custom-tabs/${id}`, 'GET');
  },
  
  async createCustomTab(name: string): Promise<CustomTab> {
    return request<CustomTab>('/custom-tabs', 'POST', { name });
  },
  
  async deleteCustomTab(id: number): Promise<void> {
    return request<void>(`/custom-tabs/${id}`, 'DELETE');
  },
  
  async addLinkToTab(linkId: number, tabId: number): Promise<void> {
    return request<void>(`/custom-tabs/${tabId}/links/${linkId}`, 'POST');
  },
  
  async removeLinkFromTab(linkId: number, tabId: number): Promise<void> {
    return request<void>(`/custom-tabs/${tabId}/links/${linkId}`, 'DELETE');
  },
  
  async getLinksByTabId(tabId: number): Promise<Link[]> {
    return request<Link[]>(`/custom-tabs/${tabId}/links`, 'GET');
  },
  
  async getRecommendations(): Promise<Link[]> {
    return request<Link[]>('/recommendations', 'GET');
  },
  
  async getNotViewedRecommendations(): Promise<Link[]> {
    return request<Link[]>('/recommendations/not-viewed', 'GET');
  }
};