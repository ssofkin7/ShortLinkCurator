import axios from 'axios';
import { detectPlatform, extractDefaultTitleFromUrl } from '../utils/platformUtils';

/**
 * Extracts a video title from a URL using oEmbed when available,
 * with fallbacks for platforms that don't support it.
 */
export async function extractVideoTitle(url: string): Promise<string> {
  try {
    const platform = detectPlatform(url);
    
    if (!platform) {
      return extractDefaultTitleFromUrl(url);
    }
    
    // Different extraction method based on the platform
    switch (platform) {
      case 'youtube':
        return await extractYouTubeTitle(url);
      case 'tiktok':
        return await extractTikTokTitle(url);
      case 'instagram':
        return await extractInstagramTitle(url);
      default:
        return extractDefaultTitleFromUrl(url);
    }
  } catch (error) {
    console.error('Title extraction error:', error);
    return extractDefaultTitleFromUrl(url);
  }
}

/**
 * Extracts a title from a YouTube video using the oEmbed API.
 */
async function extractYouTubeTitle(url: string): Promise<string> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oembedUrl);
    
    if (response.data && response.data.title) {
      return response.data.title;
    }
    
    return extractDefaultTitleFromUrl(url);
  } catch (error) {
    console.error('YouTube title extraction error:', error);
    return extractDefaultTitleFromUrl(url);
  }
}

/**
 * Attempts to extract a title from a TikTok video.
 * TikTok doesn't have a reliable oEmbed endpoint,
 * so we extract from the URL or use a default.
 */
async function extractTikTokTitle(url: string): Promise<string> {
  try {
    // Try TikTok oEmbed first (it exists but is not always reliable)
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data && response.data.title) {
        return response.data.title;
      }
    } catch (oembedError) {
      console.log('TikTok oEmbed failed, using default title extraction');
    }
    
    // Extract username from URL as a partial title
    const matches = url.match(/tiktok\.com\/@([^\/]+)/);
    if (matches && matches[1]) {
      return `TikTok video by @${matches[1]}`;
    }
    
    return extractDefaultTitleFromUrl(url);
  } catch (error) {
    console.error('TikTok title extraction error:', error);
    return extractDefaultTitleFromUrl(url);
  }
}

/**
 * Attempts to extract a title from an Instagram Reel.
 */
async function extractInstagramTitle(url: string): Promise<string> {
  try {
    // Try Instagram oEmbed
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data && response.data.title) {
        return response.data.title;
      }
    } catch (oembedError) {
      console.log('Instagram oEmbed failed, using default title extraction');
    }
    
    // Extract username if possible
    const matches = url.match(/instagram\.com\/([^\/]+)/);
    if (matches && matches[1]) {
      return `Instagram Reel by @${matches[1]}`;
    }
    
    return extractDefaultTitleFromUrl(url);
  } catch (error) {
    console.error('Instagram title extraction error:', error);
    return extractDefaultTitleFromUrl(url);
  }
}

// We're now using the extractDefaultTitleFromUrl function from ../utils/platformUtils