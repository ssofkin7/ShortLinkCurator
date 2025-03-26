import { Share, Linking, Platform } from 'react-native';
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
    // Construct share content
    const shareOptions = {
      title: title || 'Check out this content',
      message: message || 'I found this interesting content in LinkOrbit',
      url: url
    };

    // Use native share API
    const result = await Share.share(shareOptions);
    
    if (result.action === Share.sharedAction) {
      return true;
    } else if (result.action === Share.dismissedAction) {
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error sharing content:', error);
    // Fall back to clipboard copy
    return await copyToClipboard(url);
  }
};

/**
 * Copy content to clipboard as a fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Open a URL in the device browser
 */
export const openInBrowser = async (url: string): Promise<boolean> => {
  try {
    // Validate the URL
    const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
    const urlToOpen = isValidUrl ? url : `https://${url}`;
    
    // Check if can open URL
    const canOpen = await Linking.canOpenURL(urlToOpen);
    
    if (canOpen) {
      await Linking.openURL(urlToOpen);
      return true;
    } else {
      console.warn('Cannot open URL:', urlToOpen);
      return false;
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    return false;
  }
};

/**
 * Share app invite with friends
 */
export const shareAppInvite = async (referralCode?: string): Promise<boolean> => {
  try {
    // Build the invite message with optional referral code
    const appName = 'LinkOrbit';
    const appStoreUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/linkorbit/id1234567890'
      : 'https://play.google.com/store/apps/details?id=com.linkorbit.app';
    
    let inviteMessage = `Check out ${appName}, an app to organize links to your favorite short-form content!`;
    
    if (referralCode) {
      inviteMessage += ` Use my referral code: ${referralCode}`;
    }
    
    // Share the invite
    const result = await Share.share({
      title: `Join me on ${appName}!`,
      message: `${inviteMessage} ${appStoreUrl}`
    });
    
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing app invite:', error);
    return false;
  }
};