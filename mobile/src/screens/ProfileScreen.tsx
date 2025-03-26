import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { colors, typography, spacing } from '../components/ui/theme';
import { shareAppInvite } from '../services/sharingService';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Settings
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [linkCount, setLinkCount] = useState<number | null>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // No need to navigate - RootNavigator will handle this
    } catch (error) {
      Alert.alert(
        'Logout Error',
        error instanceof Error ? error.message : 'Failed to log out'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    // In a real app, we would save the profile changes to the backend
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditingProfile(false);
  };

  const handleShareApp = async () => {
    const success = await shareAppInvite();
    if (!success) {
      Alert.alert('Share Error', 'Failed to share the app. Please try again.');
    }
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile</Text>

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          {!isEditingProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditingProfile(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isEditingProfile ? (
        <View style={styles.editForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.editActions}>
            <Button
              title="Cancel"
              onPress={() => setIsEditingProfile(false)}
              variant="outline"
              size="md"
              style={{ flex: 1, marginRight: 10 }}
            />
            <Button
              title="Save"
              onPress={handleSaveProfile}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.profileDetails}>
          {displayName ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Display Name</Text>
              <Text style={styles.detailValue}>{displayName}</Text>
            </View>
          ) : null}

          {bio ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bio</Text>
              <Text style={styles.detailValue}>{bio}</Text>
            </View>
          ) : null}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Member Since</Text>
            <Text style={styles.detailValue}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>

          {linkCount !== null && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Saved Links</Text>
              <Text style={styles.detailValue}>{linkCount}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Email Notifications</Text>
        <Switch
          value={emailNotifications}
          onValueChange={setEmailNotifications}
          trackColor={{ false: colors.gray[300], true: colors.primary[600] }}
          thumbColor={colors.white}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: colors.gray[300], true: colors.primary[600] }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Actions</Text>

      <Button
        title="Share App with Friends"
        onPress={handleShareApp}
        variant="outline"
        size="md"
        fullWidth
        style={styles.actionButton}
      />

      <Button
        title="Privacy Policy"
        onPress={() => Alert.alert('Privacy', 'Privacy policy will open here')}
        variant="outline"
        size="md"
        fullWidth
        style={styles.actionButton}
      />

      <Button
        title="Terms of Service"
        onPress={() => Alert.alert('Terms', 'Terms of service will open here')}
        variant="outline"
        size="md"
        fullWidth
        style={styles.actionButton}
      />

      <Button
        title="Log Out"
        onPress={handleLogout}
        variant="primary"
        size="md"
        fullWidth
        loading={loading}
        disabled={loading}
        style={[styles.actionButton, styles.logoutButton]}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderProfileSection()}
        {renderSettingsSection()}
        {renderActionsSection()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[600],
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs / 2,
  },
  email: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  editButton: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[600],
  },
  profileDetails: {
    marginTop: spacing.sm,
  },
  detailItem: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[500],
    marginBottom: spacing.xs / 2,
  },
  detailValue: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[900],
  },
  editForm: {
    marginTop: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[900],
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});