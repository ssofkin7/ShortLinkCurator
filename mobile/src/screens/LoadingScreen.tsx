import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography } from '../components/ui/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>L</Text>
        </View>
        <Text style={styles.appName}>LinkOrbit</Text>
      </View>
      
      <ActivityIndicator 
        size="large" 
        color={colors.primary[500]} 
        style={styles.spinner} 
      />
      
      <Text style={styles.loadingText}>Loading your content...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  appName: {
    fontSize: 28,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
});