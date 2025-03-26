import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Define types for our data
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

export default function LibraryScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Query for links
  const { 
    data: links,
    isLoading: isLinksLoading,
    isError: isLinksError,
    error: linksError,
    refetch: refetchLinks
  } = useQuery<Link[]>(
    ['links', selectedPlatform],
    async () => {
      const url = selectedPlatform 
        ? `/api/links?platform=${selectedPlatform}`
        : '/api/links';
      const response = await api.get(url);
      return response.data;
    },
    {
      enabled: !!user && activeTab === 'all',
    }
  );

  // Query for custom tabs
  const { 
    data: customTabs,
    isLoading: isTabsLoading,
    isError: isTabsError,
    refetch: refetchTabs
  } = useQuery<CustomTab[]>(
    'customTabs',
    async () => {
      const response = await api.get('/api/custom-tabs');
      return response.data;
    },
    {
      enabled: !!user,
    }
  );

  // Query for links in custom tab
  const {
    data: tabLinks,
    isLoading: isTabLinksLoading,
    isError: isTabLinksError,
    refetch: refetchTabLinks
  } = useQuery<Link[]>(
    ['tabLinks', activeTab],
    async () => {
      const response = await api.get(`/api/custom-tabs/${activeTab}/links`);
      return response.data;
    },
    {
      enabled: !!user && activeTab !== 'all' && !isNaN(Number(activeTab)),
    }
  );

  // Delete link mutation
  const deleteLinkMutation = useMutation(
    async (linkId: number) => {
      await api.delete(`/api/links/${linkId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('links');
        queryClient.invalidateQueries('tabLinks');
        queryClient.invalidateQueries('customTabs');
      },
    }
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'all') {
        await refetchLinks();
      } else {
        await refetchTabLinks();
      }
      await refetchTabs();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Mark link as viewed and open it
  const handleLinkClick = async (link: Link) => {
    try {
      await api.post(`/api/links/${link.id}/view`);
      // Open the link URL in browser
      // We'll implement this later
    } catch (err) {
      console.error('Error marking link as viewed:', err);
    }
  };

  // Confirm delete link
  const confirmDeleteLink = (link: Link) => {
    Alert.alert(
      "Delete Link",
      `Are you sure you want to delete "${link.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteLinkMutation.mutate(link.id)
        }
      ]
    );
  };

  // Platform filters for the library
  const platforms = [
    { id: 'all', name: 'All' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'article', name: 'Articles' },
  ];

  // Filter by platform
  const handlePlatformFilter = (platform: string) => {
    if (platform === 'all') {
      setSelectedPlatform(null);
    } else {
      setSelectedPlatform(platform);
    }
  };

  // Get color based on platform
  const getPlatformColor = (platform: string): string => {
    const platformColors: Record<string, string> = {
      'youtube': '#FF0000',
      'tiktok': '#000000',
      'instagram': '#C13584',
      'twitter': '#1DA1F2',
      'linkedin': '#0077B5',
      'facebook': '#4267B2',
      'medium': '#00AB6C',
      'github': '#333333',
      'reddit': '#FF4500',
      'vimeo': '#1AB7EA',
      'substack': '#FF6719',
      'article': '#2A9D8F',
      'document': '#4361EE',
      'webpage': '#4896ef',
    };
    
    return platformColors[platform.toLowerCase()] || '#6366f1';
  };

  // Render link item
  const renderLinkItem = ({ item }: { item: Link }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleLinkClick(item)}
      onLongPress={() => confirmDeleteLink(item)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(item.platform) }]}>
          <Text style={styles.platformText}>{item.platform}</Text>
        </View>
        <Text style={styles.viewCount}>
          <Ionicons name="eye-outline" size={16} /> {item.view_count || 0}
        </Text>
      </View>
      
      <Text style={styles.cardTitle}>{item.title}</Text>
      
      <View style={styles.cardMeta}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      
      <View style={styles.tagsContainer}>
        {item.tags && item.tags.map(tag => (
          <View key={tag.id} style={styles.tag}>
            <Text style={styles.tagText}>{tag.name}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  // Render tab item for horizontal scroll
  const renderTabItem = ({ item }: { item: { id: string | number, name: string } }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === item.id.toString() && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(item.id.toString())}
    >
      <Text 
        style={[
          styles.tabButtonText,
          activeTab === item.id.toString() && styles.activeTabButtonText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render platform filter item
  const renderPlatformItem = ({ item }: { item: { id: string, name: string } }) => (
    <TouchableOpacity
      style={[
        styles.platformButton,
        (selectedPlatform === item.id || (item.id === 'all' && !selectedPlatform)) && 
          styles.activePlatformButton
      ]}
      onPress={() => handlePlatformFilter(item.id)}
    >
      <Text 
        style={[
          styles.platformButtonText,
          (selectedPlatform === item.id || (item.id === 'all' && !selectedPlatform)) && 
            styles.activePlatformButtonText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Create tabs array with 'All' as the first tab
  const allTabs = [
    { id: 'all', name: 'All Links' },
    ...(customTabs || []).map(tab => ({ id: tab.id, name: tab.name }))
  ];

  // Handle loading states
  const isLoading = (activeTab === 'all' && isLinksLoading) || 
                    (activeTab !== 'all' && isTabLinksLoading) ||
                    isTabsLoading;

  // Get current data based on active tab
  const currentData = activeTab === 'all' ? links : tabLinks;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const isError = (activeTab === 'all' && isLinksError) || 
                  (activeTab !== 'all' && isTabLinksError) ||
                  isTabsError;

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmpty = !currentData || currentData.length === 0;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <FlatList
        data={allTabs}
        renderItem={renderTabItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      />
      
      {/* Platform filters (only show in All Links tab) */}
      {activeTab === 'all' && (
        <FlatList
          data={platforms}
          renderItem={renderPlatformItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.platformFiltersContainer}
        />
      )}
      
      {/* Content list */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No links found</Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'all'
              ? "Add some links to start building your library"
              : "Add links to this tab to organize your content"
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderLinkItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  tabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f3f4f6',
  },
  activeTabButton: {
    backgroundColor: '#6366f1',
  },
  tabButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  platformFiltersContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  platformButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#e5e7eb',
  },
  activePlatformButton: {
    backgroundColor: '#6366f1',
  },
  platformButtonText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '500',
  },
  activePlatformButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  platformBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  platformText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  viewCount: {
    color: '#6b7280',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  cardMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});