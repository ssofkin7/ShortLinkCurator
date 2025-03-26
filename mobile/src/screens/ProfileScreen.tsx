import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors, typography, spacing } from '../components/ui/theme';
import { shareAppInvite } from '../services/sharingService';

export default function ProfileScreen() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // State for profile editing
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for notification preferences
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [newContentAlerts, setNewContentAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [platformUpdates, setPlatformUpdates] = useState(false);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { displayName?: string; bio?: string }) => {
      return await api.auth.updateProfile(profileData);
    },
    onSuccess: (data) => {
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditingProfile(false);
    },
    onError: (error) => {
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      return await api.auth.updatePassword(currentPassword, newPassword);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Password updated successfully');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update password'
      );
    },
  });

  // Notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (preferences: {
      emailNotifications: boolean;
      newContentAlerts: boolean;
      weeklyDigest: boolean;
      platformUpdates: boolean;
    }) => {
      // In a real app, this would connect to an API
      // Here we're just simulating success
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    },
    onSuccess: () => {
      Alert.alert('Success', 'Notification preferences updated');
    },
    onError: (error) => {
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update notification preferences'
      );
    },
  });

  // Handle profile save
  const handleSaveProfile = () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    updateProfileMutation.mutate({
      displayName: displayName.trim(),
      bio: bio.trim(),
    });
  };

  // Handle password save
  const handleSavePassword = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  // Handle notification preferences save
  const handleSaveNotifications = () => {
    updateNotificationsMutation.mutate({
      emailNotifications,
      newContentAlerts,
      weeklyDigest,
      platformUpdates,
    });
  };

  // Handle invite friends
  const handleInviteFriends = async () => {
    try {
      await shareAppInvite();
    } catch (error) {
      Alert.alert('Error', 'Failed to share app invitation');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile section */}
        <Card style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>
                {user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{user.displayName || user.username}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </View>
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => setIsEditingProfile(true)}
            style={styles.actionButton}
          />
        </Card>

        {/* Account settings section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => setIsChangingPassword(true)}
          >
            <Text style={styles.settingLabel}>Change Password</Text>
            <Text style={styles.settingAction}>{'>'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleInviteFriends}>
            <Text style={styles.settingLabel}>Invite Friends</Text>
            <Text style={styles.settingAction}>{'>'}</Text>
          </TouchableOpacity>
        </Card>

        {/* Notification preferences section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>New Content Alerts</Text>
            <Switch
              value={newContentAlerts}
              onValueChange={setNewContentAlerts}
              trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Weekly Digest</Text>
            <Switch
              value={weeklyDigest}
              onValueChange={setWeeklyDigest}
              trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Platform Updates</Text>
            <Switch
              value={platformUpdates}
              onValueChange={setPlatformUpdates}
              trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
              thumbColor="#fff"
            />
          </View>
          
          <Button
            title="Save Notification Settings"
            variant="outline"
            onPress={handleSaveNotifications}
            style={styles.actionButton}
            loading={updateNotificationsMutation.isPending}
            disabled={updateNotificationsMutation.isPending}
          />
        </Card>

        {/* App info section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>100</Text>
          </View>
        </Card>

        {/* Logout button */}
        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          loading={authLoading}
          disabled={authLoading}
        />

        {/* Edit profile modal */}
        <Modal
          visible={isEditingProfile}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter display name"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setDisplayName(user.displayName || '');
                    setBio(user.bio || '');
                    setIsEditingProfile(false);
                  }}
                  style={styles.modalButton}
                />
                <Button
                  title="Save"
                  variant="primary"
                  onPress={handleSaveProfile}
                  style={styles.modalButton}
                  loading={updateProfileMutation.isPending}
                  disabled={updateProfileMutation.isPending}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Change password modal */}
        <Modal
          visible={isChangingPassword}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Password</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setIsChangingPassword(false);
                  }}
                  style={styles.modalButton}
                />
                <Button
                  title="Save"
                  variant="primary"
                  onPress={handleSavePassword}
                  style={styles.modalButton}
                  loading={updatePasswordMutation.isPending}
                  disabled={updatePasswordMutation.isPending}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100, // Extra padding at bottom for scroll
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold as any,
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.gray[900],
  },
  username: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  email: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  actionButton: {
    width: '100%',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[800],
  },
  settingAction: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[500],
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  infoLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[800],
  },
  infoValue: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[500],
  },
  logoutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.gray[900],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});