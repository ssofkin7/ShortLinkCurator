import axios from 'axios';
import { detectPlatform, extractDefaultTitleFromUrl } from '../utils/platformUtils';

interface ContentMetadata {
  title: string;
  thumbnail_url?: string;
}

/**
 * Extracts content metadata (title and thumbnail when available) from a URL
 * using various platform-specific methods
 */
export async function extractVideoMetadata(url: string): Promise<ContentMetadata> {
  try {
    const platform = detectPlatform(url);
    
    if (!platform) {
      return { title: extractDefaultTitleFromUrl(url) };
    }
    
    // Different extraction method based on the platform
    switch (platform) {
      // Video platforms
      case 'youtube':
        return await extractYouTubeMetadata(url);
      case 'tiktok':
        return await extractTikTokMetadata(url);
      case 'instagram':
        return await extractInstagramMetadata(url);
      case 'facebook':
        return await extractFacebookMetadata(url);
      case 'vimeo':
        return await extractVimeoMetadata(url);
        
      // Social media platforms
      case 'twitter':
        return await extractTwitterMetadata(url);
      case 'linkedin':
        return await extractLinkedInMetadata(url);
      case 'reddit':
        return await extractRedditMetadata(url);
        
      // Content platforms
      case 'medium':
        return await extractMediumMetadata(url);
      case 'substack':
        return await extractSubstackMetadata(url);
      case 'github':
        return await extractGitHubMetadata(url);
        
      // Generic types - use default extraction
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
async function extractYouTubeMetadata(url: string): Promise<ContentMetadata> {
  try {
    // For YouTube Shorts, the URL format is different
    let videoId: string | null = null;
    
    // Check if it's a YouTube Shorts URL (contains /shorts/)
    if (url.includes('/shorts/')) {
      // Extract the video ID from shorts URL
      const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch && shortsMatch[1]) {
        videoId = shortsMatch[1];
      }
    } else {
      // Regular YouTube URL, try to get the 'v' parameter
      videoId = new URL(url).searchParams.get('v');
    }
    
    // Try oEmbed API first
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
        } else if (videoId) {
          // Use the high quality thumbnail if oEmbed doesn't provide one
          metadata.thumbnail_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        
        return metadata;
      }
    } catch (oembedError) {
      console.log('YouTube oEmbed failed, falling back to direct thumbnail URL');
    }
    
    // If oEmbed failed but we have a videoId, construct a metadata response
    if (videoId) {
      return {
        title: extractDefaultTitleFromUrl(url),
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
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

/**
 * Attempts to extract metadata from a Facebook video.
 */
async function extractFacebookMetadata(url: string): Promise<VideoMetadata> {
  try {
    // Try Facebook oEmbed (requires access token for production use)
    const oembedUrl = `https://graph.facebook.com/v18.0/oembed_video?url=${encodeURIComponent(url)}&format=json`;
    
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
      console.log('Facebook oEmbed failed, using default metadata extraction');
    }
    
    // Extract video ID for thumbnail if possible
    let videoId = null;
    
    // Handle fb.watch URLs
    if (url.includes('fb.watch')) {
      // Not much we can do without API to resolve the short URL
      return { title: extractDefaultTitleFromUrl(url) };
    }
    
    // Handle regular facebook.com URLs with video ID
    const videoMatch = url.match(/videos\/(\d+)/);
    if (videoMatch && videoMatch[1]) {
      videoId = videoMatch[1];
      
      // Note: Facebook doesn't allow thumbnail access without an access token
      // So we can only return the title
      return { 
        title: `Facebook Video #${videoId}`,
      };
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('Facebook metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from a Vimeo video.
 */
async function extractVimeoMetadata(url: string): Promise<VideoMetadata> {
  try {
    // Vimeo has a reliable oEmbed endpoint
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
    
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
      console.log('Vimeo oEmbed failed, falling back to direct API');
      
      // Try Vimeo's direct API if oEmbed fails
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        const videoId = vimeoMatch[1];
        
        try {
          const apiUrl = `https://api.vimeo.com/videos/${videoId}`;
          const response = await axios.get(apiUrl);
          
          if (response.data) {
            return {
              title: response.data.name || extractDefaultTitleFromUrl(url),
              thumbnail_url: response.data.pictures?.sizes?.[0]?.link
            };
          }
        } catch (apiError) {
          console.log('Vimeo API failed, using default title');
        }
      }
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('Vimeo metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}