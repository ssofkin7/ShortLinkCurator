import { Share, Platform, Linking } from 'react-native';
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
      message: message || `I found this interesting content: ${url}`,
      url: url, // iOS only
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
  const appURL = Platform.select({
    ios: 'https://apps.apple.com/app/linkorbit/id1234567890',
    android: 'https://play.google.com/store/apps/details?id=com.linkorbit',
    default: 'https://linkorbit.com',
  });

  const message = referralCode 
    ? `Join me on LinkOrbit! Use my referral code ${referralCode} when you sign up. ${appURL}`
    : `Check out LinkOrbit - the best way to organize and discover content! ${appURL}`;

  return shareContent({
    title: 'Join me on LinkOrbit',
    message,
    url: appURL,
  });
};