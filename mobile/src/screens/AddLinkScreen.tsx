import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainTabNavigator';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

type AddLinkScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'AddLink'>;

// Component to show after link is successfully added
interface SuccessViewProps {
  onAddAnother: () => void;
  onViewLibrary: () => void;
}

const SuccessView = ({ onAddAnother, onViewLibrary }: SuccessViewProps) => (
  <View style={styles.successContainer}>
    <View style={styles.successIconContainer}>
      <Ionicons name="checkmark-circle" size={80} color="#10b981" />
    </View>
    <Text style={styles.successTitle}>Link Added Successfully!</Text>
    <Text style={styles.successText}>
      Your link has been added to your library and analyzed with AI
    </Text>
    
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.secondaryButton} onPress={onAddAnother}>
        <Text style={styles.secondaryButtonText}>Add Another</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.primaryButton} onPress={onViewLibrary}>
        <Text style={styles.primaryButtonText}>View Library</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Main component
export default function AddLinkScreen() {
  const navigation = useNavigation<AddLinkScreenNavigationProp>();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [success, setSuccess] = useState(false);

  // Add link mutation
  const addLinkMutation = useMutation(
    async (linkUrl: string) => {
      const response = await api.post('/api/links', { url: linkUrl });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('links');
        queryClient.invalidateQueries('recommendations');
        setSuccess(true);
      },
      onError: (error) => {
        console.error('Error adding link:', error);
        Alert.alert(
          'Error',
          'Failed to add link. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  );

  const handleSubmit = () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }
    
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Add https:// prefix if missing
      const formattedUrl = `https://${url}`;
      addLinkMutation.mutate(formattedUrl);
    } else {
      addLinkMutation.mutate(url);
    }
  };

  const handleAddAnother = () => {
    setUrl('');
    setSuccess(false);
  };

  const handleViewLibrary = () => {
    navigation.navigate('Library');
  };

  // If we've just successfully added a link
  if (success) {
    return <SuccessView onAddAnother={handleAddAnother} onViewLibrary={handleViewLibrary} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="add-circle" size={50} color="#6366f1" />
            <Text style={styles.title}>Add New Link</Text>
            <Text style={styles.subtitle}>
              Paste a link from any supported platform to add it to your library
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Link URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={addLinkMutation.isLoading}
            >
              {addLinkMutation.isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Add to Library</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.supportedPlatformsContainer}>
            <Text style={styles.supportedPlatformsTitle}>Supported Platforms</Text>
            
            <View style={styles.platformTagsContainer}>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>YouTube</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>TikTok</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Instagram</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Twitter</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Facebook</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>LinkedIn</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Reddit</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Medium</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Substack</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>GitHub</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Articles</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Documents</Text>
              </View>
              <View style={styles.platformTag}>
                <Text style={styles.platformTagText}>Webpages</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportedPlatformsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  supportedPlatformsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  platformTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformTag: {
    backgroundColor: '#eef2ff',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  platformTagText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 6,
    padding: 14,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 6,
    padding: 14,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
});