import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainTabNavigator';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { colors, typography, spacing } from '../components/ui/theme';
import { Card } from '../components/ui/Card';

// Define the navigation prop type for this screen
type AddLinkScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'AddLink'>;

interface SuccessViewProps {
  onAddAnother: () => void;
  onViewLibrary: () => void;
}

const SuccessView = ({ onAddAnother, onViewLibrary }: SuccessViewProps) => (
  <View style={styles.successContainer}>
    <Text style={styles.successTitle}>Link Added Successfully!</Text>
    <Text style={styles.successDescription}>
      Your link has been added to your content library and processed for categorization and tagging.
    </Text>
    
    <View style={styles.successButtonsContainer}>
      <Button
        title="Add Another Link"
        onPress={onAddAnother}
        variant="outline"
        style={styles.successButton}
      />
      <Button
        title="View Library"
        onPress={onViewLibrary}
        variant="primary"
        style={styles.successButton}
      />
    </View>
  </View>
);

export default function AddLinkScreen() {
  const navigation = useNavigation<AddLinkScreenNavigationProp>();
  const [url, setUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Add link mutation
  const { mutate, isPending, isSuccess, data } = useMutation({
    mutationFn: async (linkUrl: string) => {
      return await api.links.add(linkUrl);
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      setError(error instanceof Error 
        ? error.message 
        : 'Failed to add link. Please try again.'
      );
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    },
  });

  // Handle form submission
  const handleSubmit = () => {
    // Reset error state
    setError('');
    
    // Validate URL
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    
    // Add http:// or https:// if not present
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Submit the URL
    mutate(formattedUrl);
  };

  // Reset the form
  const resetForm = () => {
    setUrl('');
    setIsSubmitted(false);
    setError('');
  };

  // Navigate to library
  const goToLibrary = () => {
    navigation.navigate('Library');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Add Content</Text>
            <Text style={styles.subtitle}>
              Save and organize links from your favorite platforms
            </Text>
          </View>

          {isSuccess ? (
            <SuccessView onAddAnother={resetForm} onViewLibrary={goToLibrary} />
          ) : (
            <Card style={styles.formContainer} variant="elevated">
              <Text style={styles.formTitle}>Add New Link</Text>
              <Text style={styles.formDescription}>
                Paste a URL from YouTube, TikTok, Instagram, Twitter, or any other website to save it to your library.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>URL</Text>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  placeholder="Paste or type URL here"
                  autoCapitalize="none"
                  keyboardType="url"
                  value={url}
                  onChangeText={setUrl}
                  autoCorrect={false}
                  editable={!isPending}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              <Button
                title={isPending ? 'Adding...' : 'Add to Library'}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                loading={isPending}
                disabled={isPending || !url.trim()}
                fullWidth
                style={styles.submitButton}
              />
              
              <View style={styles.supportedPlatforms}>
                <Text style={styles.supportedTitle}>Supported Platforms</Text>
                <View style={styles.platformList}>
                  <Text style={styles.platformTag}>YouTube</Text>
                  <Text style={styles.platformTag}>TikTok</Text>
                  <Text style={styles.platformTag}>Instagram</Text>
                  <Text style={styles.platformTag}>Twitter</Text>
                  <Text style={styles.platformTag}>+ More</Text>
                </View>
              </View>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  screenTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold as any,
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  formContainer: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  formDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.gray[800],
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  supportedPlatforms: {
    marginTop: spacing.md,
  },
  supportedTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  platformList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  platformTag: {
    fontSize: typography.fontSizes.sm,
    backgroundColor: colors.gray[200],
    color: colors.gray[700],
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary[600],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  successButton: {
    flex: 1,
    margin: spacing.xs,
  },
});