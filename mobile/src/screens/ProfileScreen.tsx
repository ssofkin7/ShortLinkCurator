import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  // State for profile form
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // State for password form
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newContentAlerts, setNewContentAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [platformUpdates, setPlatformUpdates] = useState(true);

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (profileData: { username?: string, email?: string, displayName?: string, bio?: string }) => {
      const response = await api.patch('/api/profile', profileData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData('user', data);
        setIsEditingProfile(false);
        Alert.alert('Success', 'Profile updated successfully');
      },
      onError: (error) => {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  );

  // Update password mutation
  const updatePasswordMutation = useMutation(
    async (passwordData: { currentPassword: string, newPassword: string }) => {
      const response = await api.patch('/api/profile/password', passwordData);
      return response.data;
    },
    {
      onSuccess: () => {
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Success', 'Password updated successfully');
      },
      onError: (error) => {
        console.error('Error updating password:', error);
        Alert.alert('Error', 'Failed to update password. Please verify your current password and try again.');
      }
    }
  );

  // Update notification preferences mutation
  const updateNotificationsMutation = useMutation(
    async (notificationData: { 
      emailNotifications: boolean,
      newContentAlerts: boolean,
      weeklyDigest: boolean,
      platformUpdates: boolean
    }) => {
      const response = await api.patch('/api/profile/notifications', notificationData);
      return response.data;
    },
    {
      onSuccess: () => {
        Alert.alert('Success', 'Notification preferences updated');
      },
      onError: (error) => {
        console.error('Error updating notifications:', error);
        Alert.alert('Error', 'Failed to update notification preferences');
      }
    }
  );

  // Handle profile form submission
  const handleUpdateProfile = () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Error', 'Username and email are required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    updateProfileMutation.mutate({
      username,
      email,
      displayName,
      bio
    });
  };

  // Handle password form submission
  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  // Handle notification preferences update
  const handleUpdateNotifications = () => {
    updateNotificationsMutation.mutate({
      emailNotifications,
      newContentAlerts,
      weeklyDigest,
      platformUpdates
    });
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => logout(),
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0)?.toUpperCase() || 
             user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.displayName}>
          {user?.displayName || user?.username || 'User'}
        </Text>
        <Text style={styles.memberSince}>
          Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
        </Text>
      </View>

      {/* Profile Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!isEditingProfile ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditingProfile(true)}
            >
              <Ionicons name="pencil-outline" size={18} color="#6366f1" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isEditingProfile ? (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name (optional)"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="A short bio about yourself (optional)"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setIsEditingProfile(false);
                  // Reset form data
                  setUsername(user?.username || '');
                  setEmail(user?.email || '');
                  setDisplayName(user?.displayName || '');
                  setBio(user?.bio || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdateProfile}
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{user?.username}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            
            {user?.displayName ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Display Name</Text>
                <Text style={styles.infoValue}>{user?.displayName}</Text>
              </View>
            ) : null}
            
            {user?.bio ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bio</Text>
                <Text style={styles.infoValue}>{user?.bio}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security</Text>
          {!isChangingPassword ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsChangingPassword(true)}
            >
              <Ionicons name="key-outline" size={18} color="#6366f1" />
              <Text style={styles.editButtonText}>Change</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isChangingPassword ? (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current Password"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm New Password"
                secureTextEntry
              />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setIsChangingPassword(false);
                  // Reset form data
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdatePassword}
                disabled={updatePasswordMutation.isLoading}
              >
                {updatePasswordMutation.isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Password</Text>
              <Text style={styles.infoValue}>••••••••</Text>
            </View>
          </View>
        )}
      </View>

      {/* Notification Preferences */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
        </View>
        
        <View style={styles.notificationSettings}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive emails about account activity</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#d1d5db', true: '#818cf8' }}
              thumbColor={emailNotifications ? '#6366f1' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>New Content Alerts</Text>
              <Text style={styles.settingDescription}>Get notified about new recommended content</Text>
            </View>
            <Switch
              value={newContentAlerts}
              onValueChange={setNewContentAlerts}
              trackColor={{ false: '#d1d5db', true: '#818cf8' }}
              thumbColor={newContentAlerts ? '#6366f1' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Weekly Digest</Text>
              <Text style={styles.settingDescription}>Receive a weekly summary of your content activity</Text>
            </View>
            <Switch
              value={weeklyDigest}
              onValueChange={setWeeklyDigest}
              trackColor={{ false: '#d1d5db', true: '#818cf8' }}
              thumbColor={weeklyDigest ? '#6366f1' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Platform Updates</Text>
              <Text style={styles.settingDescription}>Get notified about LinkOrbit updates and new features</Text>
            </View>
            <Switch
              value={platformUpdates}
              onValueChange={setPlatformUpdates}
              trackColor={{ false: '#d1d5db', true: '#818cf8' }}
              thumbColor={platformUpdates ? '#6366f1' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.saveSettingsButton} 
            onPress={handleUpdateNotifications}
            disabled={updateNotificationsMutation.isLoading}
          >
            {updateNotificationsMutation.isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveSettingsButtonText}>Save Preferences</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>LinkOrbit</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 4,
  },
  profileInfo: {},
  infoRow: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
  },
  formContainer: {
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  notificationSettings: {},
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    maxWidth: '80%',
  },
  saveSettingsButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  saveSettingsButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
  },
  appVersion: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});