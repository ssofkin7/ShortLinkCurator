import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Link, Tag, CustomTab } from '../types';
import * as SecureStore from 'expo-secure-store';

// API base URL - adjust based on environment
const API_URL = 'https://f40e5ffd-daf7-4603-a3fa-a0d205fd7ab9-00-vcpnqsbpcg7t.spock.replit.dev';

// Helper function to set and get the auth token
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function setAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

async function request<T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  skipAuth: boolean = false
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token to headers if we're not skipping auth
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for session-based auth
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(url, requestOptions);

    // Handle unauthorized responses
    if (response.status === 401 && !skipAuth) {
      // Clear token on 401 responses
      await AsyncStorage.removeItem('auth_token');
      throw new Error('You are not authorized. Please log in again.');
    }

    // Handle other error responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || 'An error occurred';
      } catch {
        // If not JSON, use the raw text
        errorMessage = errorText || `Error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await request<{ token: string; user: User }>('/api/login', 'POST', { email, password }, true);
      
      if (response.token) {
        await setAuthToken(response.token);
      }
      
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await request<{ token: string; user: User }>('/api/register', 'POST', { username, email, password }, true);
      
      if (response.token) {
        await setAuthToken(response.token);
      }
      
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  },

  async logout(): Promise<void> {
    try {
      await request<void>('/api/logout', 'POST');
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the token even if the API call fails
      await AsyncStorage.removeItem('auth_token');
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await request<User>('/api/user');
    } catch (error) {
      console.log('Get current user error:', error);
      return null; // Return null instead of throwing on auth check
    }
  },

  async getLinks(): Promise<Link[]> {
    return await request<Link[]>('/api/links');
  },

  async getLinksByPlatform(platform: string): Promise<Link[]> {
    return await request<Link[]>(`/api/links?platform=${platform}`);
  },

  async getLink(id: number): Promise<Link> {
    return await request<Link>(`/api/links/${id}`);
  },

  async addLink(url: string): Promise<Link> {
    return await request<Link>('/api/links', 'POST', { url });
  },

  async deleteLink(id: number): Promise<void> {
    return await request<void>(`/api/links/${id}`, 'DELETE');
  },

  async markLinkViewed(id: number): Promise<void> {
    return await request<void>(`/api/links/${id}/view`, 'POST');
  },

  async updateLinkCategory(id: number, category: string): Promise<void> {
    return await request<void>(`/api/links/${id}/category`, 'PATCH', { category });
  },

  async updateLinkTitle(id: number, title: string): Promise<void> {
    return await request<void>(`/api/links/${id}/title`, 'PATCH', { title });
  },

  async createTag(name: string, linkId: number): Promise<Tag> {
    return await request<Tag>('/api/tags', 'POST', { name, link_id: linkId });
  },

  async deleteTag(id: number): Promise<void> {
    return await request<void>(`/api/tags/${id}`, 'DELETE');
  },

  async getCustomTabs(): Promise<CustomTab[]> {
    return await request<CustomTab[]>('/api/custom-tabs');
  },

  async getCustomTabById(id: number): Promise<CustomTab> {
    return await request<CustomTab>(`/api/custom-tabs/${id}`);
  },

  async createCustomTab(name: string): Promise<CustomTab> {
    return await request<CustomTab>('/api/custom-tabs', 'POST', { name });
  },

  async deleteCustomTab(id: number): Promise<void> {
    return await request<void>(`/api/custom-tabs/${id}`, 'DELETE');
  },

  async addLinkToTab(linkId: number, tabId: number): Promise<void> {
    return await request<void>(`/api/custom-tabs/${tabId}/links/${linkId}`, 'POST');
  },

  async removeLinkFromTab(linkId: number, tabId: number): Promise<void> {
    return await request<void>(`/api/custom-tabs/${tabId}/links/${linkId}`, 'DELETE');
  },

  async getLinksByTabId(tabId: number): Promise<Link[]> {
    return await request<Link[]>(`/api/custom-tabs/${tabId}/links`);
  },

  async getRecommendations(): Promise<Link[]> {
    return await request<Link[]>('/api/recommendations');
  },

  async getNotViewedRecommendations(): Promise<Link[]> {
    return await request<Link[]>('/api/recommendations/not-viewed');
  }
};