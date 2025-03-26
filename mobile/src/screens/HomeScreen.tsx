import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

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

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Query for recommended links (not viewed)
  const { 
    data: recommendations,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Link[]>(
    'recommendations',
    async () => {
      const response = await api.get('/api/recommendations/not-viewed');
      return response.data;
    },
    {
      enabled: !!user,
      onError: (err) => console.error('Failed to fetch recommendations:', err)
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Mark link as viewed when clicked
  const handleLinkClick = async (link: Link) => {
    try {
      await api.post(`/api/links/${link.id}/view`);
      // Open the link URL in browser
      // We'll implement this later
    } catch (err) {
      console.error('Error marking link as viewed:', err);
    }
  };

  const renderItem = ({ item }: { item: Link }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleLinkClick(item)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(item.platform) }]}>
          <Text style={styles.platformText}>{item.platform}</Text>
        </View>
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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text>{(error as Error)?.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>No recommendations yet</Text>
        <Text style={styles.emptySubtext}>
          Add more links to get recommendations or explore your existing content
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user?.displayName || user?.username}</Text>
      <Text style={styles.sectionTitle}>Recommended for you</Text>
      
      <FlatList
        data={recommendations}
        renderItem={renderItem}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#4b5563',
  },
  list: {
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