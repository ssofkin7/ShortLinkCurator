import { Share, Platform, Alert, Linking } from 'react-native';
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
    const result = await Share.share(
      {
        title: title || 'Check out this content',
        message: message || `Check out this awesome content I found: ${url}`,
        url: Platform.OS === 'ios' ? url : undefined,
      },
      {
        dialogTitle: title || 'Share this content',
      }
    );

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
      Alert.alert('Error', `Cannot open URL: ${url}`);
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
  const appUrl = Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/linkorbit/id123456789'
    : 'https://play.google.com/store/apps/details?id=com.linkorbit.app';
    
  const message = referralCode
    ? `Join me on LinkOrbit to organize your content universe! Use my referral code: ${referralCode}. Download here: ${appUrl}`
    : `Join me on LinkOrbit to organize your content universe! Download here: ${appUrl}`;
    
  return shareContent({
    title: 'Join LinkOrbit',
    message,
    url: appUrl
  });
};