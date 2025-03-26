import { Platform, Share, Alert, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * Service for sharing content from the app using native sharing APIs
 */

interface ShareOptions {
  title?: string;
  message?: string;
  url: string;
}

/**
 * Share content using the native share dialog
 */
export const shareContent = async ({ title, message, url }: ShareOptions): Promise<boolean> => {
  try {
    // Use the Share API with appropriate options
    const result = await Share.share(
      {
        title: title || 'Check out this link from LinkOrbit',
        message: message 
          ? `${message}\n${url}` 
          : `Check out this link I found with LinkOrbit: ${url}`,
        url: url, // iOS only, will be ignored on Android
      },
      {
        // Dialog title (Android only)
        dialogTitle: title || 'Share this content',
        // Subject for when sharing to email (iOS only)
        subject: title || 'Check out this link from LinkOrbit',
      }
    );

    if (result.action === Share.sharedAction) {
      // Shared successfully
      return true;
    } else if (result.action === Share.dismissedAction) {
      // Dismissed the dialog
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error sharing content:', error);
    // Fallback to copy to clipboard if sharing fails
    return copyToClipboard(url);
  }
};

/**
 * Copy content to clipboard as a fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied to Clipboard', 'Link has been copied to your clipboard');
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    Alert.alert('Failed to Copy', 'Could not copy the link to clipboard');
    return false;
  }
};

/**
 * Open a URL in the device browser
 */
export const openInBrowser = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert('Cannot Open Link', 'Your device cannot open this type of link');
      return false;
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    Alert.alert('Error', 'Failed to open the link');
    return false;
  }
};

/**
 * Share app invite with friends
 */
export const shareAppInvite = async (referralCode?: string): Promise<boolean> => {
  // App store / Play store links (replace with actual links when published)
  const appStoreLink = 'https://apps.apple.com/app/linkorbit/id0000000000';
  const playStoreLink = 'https://play.google.com/store/apps/details?id=com.linkorbit.app';
  
  // Choose appropriate store link based on platform
  const storeLink = Platform.OS === 'ios' ? appStoreLink : playStoreLink;
  
  // Add referral code if provided
  const linkWithReferral = referralCode ? `${storeLink}?referral=${referralCode}` : storeLink;
  
  return shareContent({
    title: 'Join me on LinkOrbit!',
    message: 'I\'ve been using LinkOrbit to organize content from around the web. Check it out:',
    url: linkWithReferral,
  });
};