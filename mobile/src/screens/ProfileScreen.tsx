import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, spacing } from '../components/ui/theme';
import { Button } from '../components/ui/Button';
import { shareAppInvite } from '../services/sharingService';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Notification settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newContentAlerts, setNewContentAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [platformUpdates, setPlatformUpdates] = useState(true);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Navigation is handled by RootNavigator
    } catch (error) {
      Alert.alert(
        'Logout Failed',
        error instanceof Error ? error.message : 'Unable to log out. Please try again.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareAppInvite();
    } catch (error) {
      Alert.alert('Error', 'Could not share the app at this time.');
    }
  };

  // Display loading state while user data is loading
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Profile</Text>
        </View>

        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.displayName 
                  ? user.displayName.substring(0, 2).toUpperCase() 
                  : user.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.displayName || user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.joinDate}>Member since {new Date(user.created_at).toLocaleDateString()}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Edit Profile</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Change Password</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemText}>Premium Membership</Text>
                {user.is_premium ? (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>PRO</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.card}>
            <View style={styles.switchItem}>
              <Text style={styles.menuItemText}>Email Notifications</Text>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
                thumbColor={emailNotifications ? colors.primary[600] : colors.gray[100]}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.switchItem}>
              <Text style={styles.menuItemText}>New Content Alerts</Text>
              <Switch
                value={newContentAlerts}
                onValueChange={setNewContentAlerts}
                trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
                thumbColor={newContentAlerts ? colors.primary[600] : colors.gray[100]}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.switchItem}>
              <Text style={styles.menuItemText}>Weekly Digest</Text>
              <Switch
                value={weeklyDigest}
                onValueChange={setWeeklyDigest}
                trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
                thumbColor={weeklyDigest ? colors.primary[600] : colors.gray[100]}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.switchItem}>
              <Text style={styles.menuItemText}>Platform Updates</Text>
              <Switch
                value={platformUpdates}
                onValueChange={setPlatformUpdates}
                trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
                thumbColor={platformUpdates ? colors.primary[600] : colors.gray[100]}
              />
            </View>
          </View>
        </View>

        {/* Share & Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share & Support</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Text style={styles.menuItemText}>Invite Friends</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Help & Support</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Terms of Service</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title={isLoggingOut ? "Logging out..." : "Log Out"}
          onPress={handleLogout}
          variant="outline"
          disabled={isLoggingOut}
          loading={isLoggingOut}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold as any,
    color: colors.gray[900],
  },
  userInfoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold as any,
    color: 'white',
  },
  userName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  joinDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[400],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[800],
  },
  menuItemArrow: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray[400],
    fontWeight: typography.fontWeights.light as any,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.lg,
  },
  logoutButton: {
    marginVertical: spacing.xl,
  },
  premiumBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
    marginLeft: spacing.md,
  },
  premiumText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary[700],
  },
});