import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, User, Tag, CustomTab } from '../types';
import * as SecureStore from 'expo-secure-store';

// Base URL for the API
const API_URL = 'https://api.linkorbit.app';  // Replace with actual API URL or use environment variable

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Function to securely store the auth token
const storeAuthToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

// Function to securely get the auth token
const getAuthToken = async (): Promise<string | null> => {
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
};

// Function to remove the auth token (for logout)
const removeAuthToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
    }
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Generic request function with authentication
const request = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any,
  skipAuth = false
): Promise<T> => {
  try {
    // Build request headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available and required
    if (!skipAuth) {
      const token = await getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body) {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the API call
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || response.statusText || 'Unknown error';
      
      // Handle specific error status codes
      if (response.status === 401) {
        // Unauthorized, clear token
        await removeAuthToken();
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    // Parse and return the response data
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while making API request');
  }
};

// API functions for authentication
export const api = {
  // Auth
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await request<{ token: string; user: User }>('/api/login', 'POST', { email, password }, true);
      await storeAuthToken(response.token);
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await request<{ token: string; user: User }>('/api/register', 'POST', { username, email, password }, true);
      await storeAuthToken(response.token);
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await request('/api/logout', 'POST');
      await removeAuthToken();
    } catch (error) {
      // Force token removal even if API call fails
      await removeAuthToken();
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await request<User>('/api/user', 'GET');
    } catch (error) {
      console.log('Error fetching current user:', error);
      return null;
    }
  },

  // Links
  async getLinks(): Promise<Link[]> {
    return request<Link[]>('/api/links');
  },

  async getLinksByPlatform(platform: string): Promise<Link[]> {
    return request<Link[]>(`/api/links?platform=${platform}`);
  },

  async getLink(id: number): Promise<Link> {
    return request<Link>(`/api/links/${id}`);
  },

  async addLink(url: string): Promise<Link> {
    return request<Link>('/api/links', 'POST', { url });
  },

  async deleteLink(id: number): Promise<void> {
    await request(`/api/links/${id}`, 'DELETE');
  },

  async markLinkViewed(id: number): Promise<void> {
    await request(`/api/links/${id}/view`, 'POST');
  },

  async updateLinkCategory(id: number, category: string): Promise<void> {
    await request(`/api/links/${id}/category`, 'PATCH', { category });
  },

  async updateLinkTitle(id: number, title: string): Promise<void> {
    await request(`/api/links/${id}/title`, 'PATCH', { title });
  },

  // Tags
  async createTag(name: string, linkId: number): Promise<Tag> {
    return request<Tag>('/api/tags', 'POST', { name, link_id: linkId });
  },

  async deleteTag(id: number): Promise<void> {
    await request(`/api/tags/${id}`, 'DELETE');
  },

  // Custom Tabs
  async getCustomTabs(): Promise<CustomTab[]> {
    return request<CustomTab[]>('/api/custom-tabs');
  },

  async getCustomTabById(id: number): Promise<CustomTab> {
    return request<CustomTab>(`/api/custom-tabs/${id}`);
  },

  async createCustomTab(name: string): Promise<CustomTab> {
    return request<CustomTab>('/api/custom-tabs', 'POST', { name });
  },

  async deleteCustomTab(id: number): Promise<void> {
    await request(`/api/custom-tabs/${id}`, 'DELETE');
  },

  async addLinkToTab(linkId: number, tabId: number): Promise<void> {
    await request(`/api/custom-tabs/${tabId}/links/${linkId}`, 'POST');
  },

  async removeLinkFromTab(linkId: number, tabId: number): Promise<void> {
    await request(`/api/custom-tabs/${tabId}/links/${linkId}`, 'DELETE');
  },

  async getLinksByTabId(tabId: number): Promise<Link[]> {
    return request<Link[]>(`/api/custom-tabs/${tabId}/links`);
  },

  // Recommendations
  async getRecommendations(): Promise<Link[]> {
    return request<Link[]>('/api/recommendations');
  },

  async getNotViewedRecommendations(): Promise<Link[]> {
    return request<Link[]>('/api/recommendations/not-viewed');
  },
};