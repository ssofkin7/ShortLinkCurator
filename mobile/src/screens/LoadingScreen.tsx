import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { colors, typography, spacing } from '../components/ui/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LinkOrbit</Text>
      <ActivityIndicator 
        size="large" 
        color={colors.primary[600]} 
        style={styles.spinner} 
      />
      <Text style={styles.loadingText}>Loading your content universe...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  logo: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[600],
    marginBottom: spacing.xl,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    textAlign: 'center',
  }
});