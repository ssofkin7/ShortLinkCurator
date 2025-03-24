/**
 * Shared utilities for platform detection and URL operations
 */

export type PlatformType = 'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'vimeo';

/**
 * Detects the platform from a given URL
 */
export function detectPlatform(url: string): PlatformType | null {
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('instagram.com')) {
    return 'instagram';
  } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return 'facebook';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  return null;
}

/**
 * Extracts a default title from a URL when no better method is available.
 * Makes the title more user-friendly than a raw video ID.
 */
export function extractDefaultTitleFromUrl(url: string): string {
  try {
    // Extract video ID based on platform patterns
    let videoId = '';
    
    // YouTube
    if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1].split('?')[0].split('&')[0];
      return `YouTube Short #${videoId}`;
    }
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
      return `YouTube Video #${videoId}`;
    }
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = new URL(url).searchParams.get('v') || '';
      return `YouTube Video #${videoId}`;
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      const userMatch = url.match(/tiktok\.com\/@([^\/]+)/);
      const idMatch = url.match(/video\/(\d+)/);
      
      if (userMatch && userMatch[1] && idMatch && idMatch[1]) {
        return `TikTok by @${userMatch[1]}`;
      }
      
      if (idMatch && idMatch[1]) {
        return `TikTok #${idMatch[1]}`;
      }
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      const reelMatch = url.match(/reel\/([^\/]+)/);
      
      if (reelMatch && reelMatch[1]) {
        return `Instagram Reel #${reelMatch[1]}`;
      }
      
      // Regular Instagram post
      const postMatch = url.match(/p\/([^\/]+)/);
      if (postMatch && postMatch[1]) {
        return `Instagram Post #${postMatch[1]}`;
      }
    }
    
    // Facebook
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      // fb.watch links
      if (url.includes('fb.watch/')) {
        const watchMatch = url.match(/fb\.watch\/([^\/]+)/);
        if (watchMatch && watchMatch[1]) {
          return `Facebook Video #${watchMatch[1]}`;
        }
      }
      
      // facebook.com/watch links
      if (url.includes('facebook.com/watch')) {
        const videoParam = new URL(url).searchParams.get('v');
        if (videoParam) {
          return `Facebook Video #${videoParam}`;
        }
      }
      
      // Regular facebook links with video ID
      const videoMatch = url.match(/videos\/(\d+)/);
      if (videoMatch && videoMatch[1]) {
        return `Facebook Video #${videoMatch[1]}`;
      }
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        return `Vimeo Video #${vimeoMatch[1]}`;
      }
    }
    
    // Fallback - use domain and path
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname} content`;
    } catch (e) {
      return 'Untitled Content';
    }
  } catch (error) {
    console.error('Default title extraction error:', error);
    return 'Untitled Content';
  }
}