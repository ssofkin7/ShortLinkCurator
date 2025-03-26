import { Linking, Share, Platform } from 'react-native';
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
    const result = await Share.share({
      title: title || 'Check out this content from LinkOrbit',
      message: message || `Check out this link I found: ${url}`,
      url, // iOS only
    });

    if (result.action === Share.sharedAction) {
      return true;
    } else if (result.action === Share.dismissedAction) {
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error sharing content:', error);
    return false;
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
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      console.error(`Cannot open URL: ${url}`);
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
  const message = referralCode
    ? `Join me on LinkOrbit, the best way to organize your online content! Use my referral code: ${referralCode}`
    : 'Join me on LinkOrbit, the best way to organize your online content!';
    
  const url = 'https://linkorbit.app'; // Replace with actual app website/store link
  
  try {
    const result = await Share.share({
      title: 'Invite friends to LinkOrbit',
      message,
      url, // iOS only
    });
    
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing app invite:', error);
    return false;
  }
};