import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../components/ui/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary[500]} style={styles.spinner} />
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.subText}>Preparing your content library</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  subText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[500],
    textAlign: 'center',
  },
});