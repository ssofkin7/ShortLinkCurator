import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '../components/ui/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Text style={styles.logoText}>L</Text>
        </View>
        <Text style={styles.appName}>LinkOrbit</Text>
      </View>
      <ActivityIndicator 
        size="large" 
        color={colors.primary[600]} 
        style={styles.spinner} 
      />
      <Text style={styles.text}>Loading your content...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoText: {
    fontSize: 44,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  appName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
});