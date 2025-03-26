import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  Pressable,
  ImageBackground
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { colors, typography, spacing, shadows } from '../components/ui/theme';
import { shareAppInvite, openInBrowser } from '../services/sharingService';
import { Card, CardContent } from '../components/ui/Card';
import { api } from '../services/api';

// Icons for profile sections (mock implementation - in real app use an icon library)
const Icon = ({ name, color }: { name: string; color: string }) => {
  // This is a placeholder. In a real app, use an icon library
  return (
    <View style={[styles.icon, { backgroundColor: color + '20' }]}>
      <Text style={{ color, fontWeight: 'bold', fontSize: 14 }}>{name[0]}</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const scrollY = new Animated.Value(0);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || '');

  // User stats
  const [stats, setStats] = useState({
    links: 0,
    tabs: 0,
    recommendations: 0
  });

  // App settings
  const [settings, setSettings] = useState({
    emailNotifications: false,
    darkMode: false,
    autoplayVideos: true,
    saveDataMode: false
  });

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Mock implementation - in a real app, fetch from API
        // const userStats = await api.getUserStats();
        // setStats(userStats);
        
        // For demo purposes:
        setStats({
          links: 12,
          tabs: 3,
          recommendations: 5
        });
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };
    
    fetchUserStats();
  }, []);

  // Animated header values
  const headerHeight = 220;
  const scrollDistance = headerHeight - 60;
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, scrollDistance],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, scrollDistance],
    outputRange: [0, -scrollDistance],
    extrapolate: 'clamp',
  });

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
    // api.updateProfile({displayName, bio, avatar})
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditingProfile(false);
  };

  const handleShareApp = async () => {
    const success = await shareAppInvite();
    if (!success) {
      Alert.alert('Share Error', 'Failed to share the app. Please try again.');
    }
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // In a real app, save settings to backend
    // api.updateSettings({ [setting]: value });
  };

  const openPremiumPlans = () => {
    Alert.alert(
      'Premium Plans',
      'Upgrade to LinkOrbit Premium to unlock unlimited links, advanced analytics, and premium features!',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'See Plans', onPress: () => {} }
      ]
    );
  };

  // Tab content renderers
  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {isEditingProfile ? (
        <Card style={styles.formCard}>
          <CardContent>
            <Text style={styles.formTitle}>Edit Profile</Text>
            
            <View style={styles.avatarEditRow}>
              <View style={styles.avatarPreview}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.editAvatar} />
                ) : (
                  <View style={styles.editAvatarPlaceholder}>
                    <Text style={styles.editAvatarInitial}>
                      {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={styles.changeAvatarButton}>
                  <Text style={styles.changeAvatarText}>Change</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.editFormFields}>
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
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.gray[100] }]}
                    value={user?.username}
                    editable={false}
                  />
                  <Text style={styles.inputHint}>Username cannot be changed</Text>
                </View>
              </View>
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
                title="Save Changes"
                onPress={handleSaveProfile}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </CardContent>
        </Card>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.links}</Text>
              <Text style={styles.statLabel}>Links</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.tabs}</Text>
              <Text style={styles.statLabel}>Tabs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.recommendations}</Text>
              <Text style={styles.statLabel}>Recommendations</Text>
            </View>
          </View>

          <Card style={styles.infoCard}>
            <CardContent>
              <View style={styles.bioSection}>
                {bio ? (
                  <>
                    <Text style={styles.bioTitle}>About Me</Text>
                    <Text style={styles.bioText}>{bio}</Text>
                  </>
                ) : (
                  <TouchableOpacity 
                    style={styles.addBioButton} 
                    onPress={() => setIsEditingProfile(true)}
                  >
                    <Text style={styles.addBioText}>Add a bio to tell others about yourself</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Icon name="Email" color={colors.info[500]} />
                  <Text style={styles.detailText}>{user?.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="Calendar" color={colors.success[500]} />
                  <Text style={styles.detailText}>
                    Joined {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="Star" color={colors.warning[500]} />
                  <Text style={styles.detailText}>
                    {user?.is_premium ? 'Premium Member' : 'Free Plan'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => setIsEditingProfile(true)}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>
          
          {!user?.is_premium && (
            <Card style={styles.premiumCard}>
              <CardContent>
                <View style={styles.premiumContent}>
                  <View style={styles.premiumTextContainer}>
                    <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                    <Text style={styles.premiumDescription}>
                      Get unlimited links, advanced analytics, and premium features
                    </Text>
                  </View>
                  <Button
                    title="See Plans"
                    variant="primary"
                    size="sm"
                    onPress={openPremiumPlans}
                  />
                </View>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.settingsCard}>
        <CardContent>
          <Text style={styles.settingsGroupTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates about new features and content</Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              trackColor={{ false: colors.gray[300], true: colors.primary[600] }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.gray[300]}
            />
          </View>
          
          <View style={styles.settingDivider} />
          
          <Text style={styles.settingsGroupTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme throughout the app</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => handleSettingChange('darkMode', value)}
              trackColor={{ false: colors.gray[300], true: colors.primary[600] }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.gray[300]}
            />
          </View>
          
          <View style={styles.settingDivider} />
          
          <Text style={styles.settingsGroupTitle}>Content</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Autoplay Videos</Text>
              <Text style={styles.settingDescription}>Automatically play videos while browsing</Text>
            </View>
            <Switch
              value={settings.autoplayVideos}
              onValueChange={(value) => handleSettingChange('autoplayVideos', value)}
              trackColor={{ false: colors.gray[300], true: colors.primary[600] }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.gray[300]}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Data Saver Mode</Text>
              <Text style={styles.settingDescription}>Reduce data usage by loading lower quality images</Text>
            </View>
            <Switch
              value={settings.saveDataMode}
              onValueChange={(value) => handleSettingChange('saveDataMode', value)}
              trackColor={{ false: colors.gray[300], true: colors.primary[600] }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.gray[300]}
            />
          </View>
        </CardContent>
      </Card>
      
      <View style={styles.actionsContainer}>
        <Card style={styles.actionsCard}>
          <CardContent>
            <Text style={styles.settingsGroupTitle}>App</Text>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleShareApp}>
              <Icon name="Share" color={colors.primary[600]} />
              <Text style={styles.actionLabel}>Share App with Friends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => openInBrowser('https://linkorbit.com/privacy')}
            >
              <Icon name="Lock" color={colors.info[600]} />
              <Text style={styles.actionLabel}>Privacy Policy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => openInBrowser('https://linkorbit.com/terms')}
            >
              <Icon name="Document" color={colors.gray[700]} />
              <Text style={styles.actionLabel}>Terms of Service</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Support', 'How can we help you?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Contact Support', onPress: () => {} }
              ])}
            >
              <Icon name="Help" color={colors.success[600]} />
              <Text style={styles.actionLabel}>Help & Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionItem, styles.logoutItem]} 
              onPress={handleLogout}
            >
              <Icon name="Logout" color={colors.error[600]} />
              <Text style={[styles.actionLabel, styles.logoutLabel]}>Log Out</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>LinkOrbit v1.0.0</Text>
        </View>
      </View>
    </View>
  );

  // Main render
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop' }}
          style={styles.headerBackground}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.profileContainer}>
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
            <Text style={styles.userName}>{displayName || user?.username || 'User'}</Text>
            {user?.is_premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </Animated.View>
      
      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </Pressable>
      </View>
      
      {/* Content */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          {activeTab === 'profile' ? renderProfileTab() : renderSettingsTab()}
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 260, // Header height + tabs
    paddingBottom: 40,
  },
  
  // Header Styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 10,
  },
  headerBackground: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30, // For status bar
  },
  avatarContainer: {
    marginBottom: spacing.sm,
    ...shadows.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarInitial: {
    fontSize: 42,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  userName: {
    fontSize: typography.fontSize['xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  premiumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.warning[500],
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  
  // Tabs Styles
  tabsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 220, // After header
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary[600],
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[600],
  },
  activeTabText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[600],
  },
  
  // Tab Content Styles
  tabContent: {
    padding: spacing.md,
  },
  
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: 5,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[600],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  
  // Profile Card
  infoCard: {
    marginBottom: spacing.md,
  },
  bioSection: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  bioTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  bioText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    lineHeight: 22,
  },
  addBioButton: {
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    alignItems: 'center',
  },
  addBioText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  detailText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[800],
  },
  editProfileButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
  },
  
  // Edit Profile Form
  formCard: {
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  avatarEditRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatarPreview: {
    marginRight: spacing.lg,
    alignItems: 'center',
  },
  editAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.xs,
  },
  editAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  editAvatarInitial: {
    fontSize: 32,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[600],
  },
  changeAvatarButton: {
    backgroundColor: colors.primary[50],
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  changeAvatarText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeights.medium,
  },
  editFormFields: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
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
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  inputHint: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: 4,
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
  
  // Premium Card
  premiumCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  premiumTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[700],
    marginBottom: 2,
  },
  premiumDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
  },
  
  // Settings Tab
  settingsCard: {
    marginBottom: spacing.md,
  },
  settingsGroupTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[800],
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginVertical: spacing.md,
  },
  
  // Actions Section
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  actionsCard: {
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  actionLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray[800],
    marginLeft: spacing.md,
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: spacing.xs,
  },
  logoutLabel: {
    color: colors.error[600],
    fontWeight: typography.fontWeights.medium,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
});