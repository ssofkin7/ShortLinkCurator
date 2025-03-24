import axios from 'axios';
import { detectPlatform, extractDefaultTitleFromUrl } from '../utils/platformUtils';

interface VideoMetadata {
  title: string;
  thumbnail_url?: string;
}

/**
 * Extracts video metadata (title and thumbnail) from a URL using oEmbed when available,
 * with fallbacks for platforms that don't support it.
 */
export async function extractVideoMetadata(url: string): Promise<VideoMetadata> {
  try {
    const platform = detectPlatform(url);
    
    if (!platform) {
      return { title: extractDefaultTitleFromUrl(url) };
    }
    
    // Different extraction method based on the platform
    switch (platform) {
      case 'youtube':
        return await extractYouTubeMetadata(url);
      case 'tiktok':
        return await extractTikTokMetadata(url);
      case 'instagram':
        return await extractInstagramMetadata(url);
      default:
        return { title: extractDefaultTitleFromUrl(url) };
    }
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function extractVideoTitle(url: string): Promise<string> {
  const metadata = await extractVideoMetadata(url);
  return metadata.title;
}

/**
 * Extracts metadata from a YouTube video using the oEmbed API.
 */
async function extractYouTubeMetadata(url: string): Promise<VideoMetadata> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oembedUrl);
    
    if (response.data) {
      let metadata: VideoMetadata = { title: extractDefaultTitleFromUrl(url) };
      
      if (response.data.title) {
        metadata.title = response.data.title;
      }
      
      if (response.data.thumbnail_url) {
        metadata.thumbnail_url = response.data.thumbnail_url;
      } else {
        // Try to extract video ID for thumbnail fallback
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) {
          metadata.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      return metadata;
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('YouTube metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from a TikTok video.
 * TikTok doesn't have a reliable oEmbed endpoint,
 * so we extract from the URL or use a default.
 */
async function extractTikTokMetadata(url: string): Promise<VideoMetadata> {
  try {
    // Try TikTok oEmbed first (it exists but is not always reliable)
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data) {
        let metadata: VideoMetadata = { title: extractDefaultTitleFromUrl(url) };
        
        if (response.data.title) {
          metadata.title = response.data.title;
        }
        
        if (response.data.thumbnail_url) {
          metadata.thumbnail_url = response.data.thumbnail_url;
        }
        
        return metadata;
      }
    } catch (oembedError) {
      console.log('TikTok oEmbed failed, using default metadata extraction');
    }
    
    // Extract username from URL as a partial title
    const matches = url.match(/tiktok\.com\/@([^\/]+)/);
    if (matches && matches[1]) {
      return { 
        title: `TikTok video by @${matches[1]}`,
        // No reliable thumbnail extraction without the API
      };
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('TikTok metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from an Instagram Reel.
 */
async function extractInstagramMetadata(url: string): Promise<VideoMetadata> {
  try {
    // Try Instagram oEmbed
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data) {
        let metadata: VideoMetadata = { title: extractDefaultTitleFromUrl(url) };
        
        if (response.data.title) {
          metadata.title = response.data.title;
        }
        
        if (response.data.thumbnail_url) {
          metadata.thumbnail_url = response.data.thumbnail_url;
        }
        
        return metadata;
      }
    } catch (oembedError) {
      console.log('Instagram oEmbed failed, using default metadata extraction');
    }
    
    // Extract username if possible
    const matches = url.match(/instagram\.com\/([^\/]+)/);
    if (matches && matches[1]) {
      return { 
        title: `Instagram Reel by @${matches[1]}`,
        // No reliable thumbnail extraction without the API
      };
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('Instagram metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}