/**
 * Shared utilities for platform detection and URL operations
 */

export type PlatformType = 
  // Video platforms
  'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'vimeo' |
  // Social media
  'twitter' | 'linkedin' | 'reddit' | 
  // Content platforms
  'medium' | 'substack' | 'github' |
  // Generic catch-all
  'article' | 'document' | 'webpage';

/**
 * Detects the platform from a given URL
 */
export function detectPlatform(url: string): PlatformType {
  // Normalize URL for consistent checking
  const normalizedUrl = url.toLowerCase();
  
  // Video platforms
  if (normalizedUrl.includes('tiktok.com')) {
    return 'tiktok';
  } else if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
    return 'youtube';
  } else if (normalizedUrl.includes('instagram.com')) {
    return 'instagram';
  } else if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.watch')) {
    return 'facebook';
  } else if (normalizedUrl.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  // Social media platforms
  else if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
    return 'twitter';
  } else if (normalizedUrl.includes('linkedin.com')) {
    return 'linkedin';
  } else if (normalizedUrl.includes('reddit.com')) {
    return 'reddit';
  }
  
  // Content platforms
  else if (normalizedUrl.includes('medium.com')) {
    return 'medium';
  } else if (normalizedUrl.includes('substack.com')) {
    return 'substack';
  } else if (normalizedUrl.includes('github.com')) {
    return 'github';
  }
  
  // Detect article or document types
  else if (normalizedUrl.includes('.pdf') || 
           normalizedUrl.includes('.doc') || 
           normalizedUrl.includes('.docx') ||
           normalizedUrl.includes('/docs/') ||
           normalizedUrl.includes('papers') ||
           normalizedUrl.includes('research')) {
    return 'document';
  }
  
  // Detect news or articles
  else if (normalizedUrl.includes('news') ||
           normalizedUrl.includes('article') ||
           normalizedUrl.includes('blog') ||
           normalizedUrl.includes('/post/') ||
           normalizedUrl.includes('/posts/') ||
           normalizedUrl.includes('stories')) {
    return 'article';
  }
  
  // Default fallback for any other web link
  return 'webpage';
}

/**
 * Extracts a default title from a URL when no better method is available.
 * Makes the title more user-friendly than a raw video ID.
 */
export function extractDefaultTitleFromUrl(url: string): string {
  try {
    // Normalize URL for consistent checking
    const normalizedUrl = url.toLowerCase();
    
    // Extract video ID based on platform patterns
    let videoId = '';
    
    // YouTube - make sure to properly differentiate Shorts and regular videos
    if (normalizedUrl.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1].split('?')[0].split('&')[0];
      return `YouTube Short #${videoId}`;
    }
    
    if (normalizedUrl.includes('youtu.be/')) {
      // Check if this is a short shared via youtu.be
      videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
      return `YouTube Video #${videoId}`;
    }
    
    if (normalizedUrl.includes('youtube.com/watch?v=')) {
      // This is definitely a regular YouTube video, not a Short
      videoId = new URL(url).searchParams.get('v') || '';
      return `YouTube Video #${videoId}`;
    }
    
    // TikTok
    if (normalizedUrl.includes('tiktok.com')) {
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
    if (normalizedUrl.includes('instagram.com')) {
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
    if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.watch')) {
      // fb.watch links
      if (normalizedUrl.includes('fb.watch/')) {
        const watchMatch = url.match(/fb\.watch\/([^\/]+)/);
        if (watchMatch && watchMatch[1]) {
          return `Facebook Video #${watchMatch[1]}`;
        }
      }
      
      // facebook.com/watch links
      if (normalizedUrl.includes('facebook.com/watch')) {
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
    if (normalizedUrl.includes('vimeo.com')) {
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        return `Vimeo Video #${vimeoMatch[1]}`;
      }
    }
    
    // Twitter/X
    if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
      const tweetMatch = url.match(/\/status\/(\d+)/);
      if (tweetMatch && tweetMatch[1]) {
        return `Tweet #${tweetMatch[1]}`;
      }
      
      const userMatch = url.match(/(?:twitter|x)\.com\/([^\/]+)/);
      if (userMatch && userMatch[1]) {
        return `Twitter Post by @${userMatch[1]}`;
      }
    }
    
    // LinkedIn
    if (normalizedUrl.includes('linkedin.com/')) {
      if (normalizedUrl.includes('/pulse/')) {
        return 'LinkedIn Article';
      } else if (normalizedUrl.includes('/posts/')) {
        const postMatch = url.match(/\/posts\/(\w+)/);
        if (postMatch && postMatch[1]) {
          return `LinkedIn Post #${postMatch[1]}`;
        }
        return 'LinkedIn Post';
      }
    }
    
    // Reddit
    if (normalizedUrl.includes('reddit.com')) {
      if (normalizedUrl.includes('/comments/')) {
        const postMatch = url.match(/\/comments\/([^\/]+)/);
        if (postMatch && postMatch[1]) {
          return `Reddit Post #${postMatch[1]}`;
        }
        return 'Reddit Post';
      } else if (normalizedUrl.includes('/r/')) {
        const subredditMatch = url.match(/\/r\/([^\/]+)/);
        if (subredditMatch && subredditMatch[1]) {
          return `r/${subredditMatch[1]} Reddit Post`;
        }
      }
    }
    
    // Medium
    if (normalizedUrl.includes('medium.com')) {
      // Try to get the article title from the path
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/').filter(Boolean);
      if (path.length > 1) {
        const slugParts = path[path.length - 1].split('-');
        // Convert slug to title case
        if (slugParts.length > 0) {
          return slugParts
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }
      return 'Medium Article';
    }
    
    // GitHub
    if (normalizedUrl.includes('github.com')) {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/').filter(Boolean);
      
      if (path.length >= 2) {
        return `GitHub: ${path[0]}/${path[1]}`;
      }
      return 'GitHub Repository';
    }
    
    // Documents (.pdf, .doc, etc.)
    if (normalizedUrl.match(/\.(pdf|docx?|pptx?|xlsx?|csv|txt)($|\?)/)) {
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split('/').pop() || '';
      if (filename) {
        // Clean up the filename
        return filename.replace(/\.(pdf|docx?|pptx?|xlsx?|csv|txt)($|\?)/, '').replace(/[-_]/g, ' ');
      }
      return 'Document';
    }
    
    // Try to extract a meaningful title from the URL path for articles
    if (detectPlatform(url) === 'article') {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/').filter(Boolean);
      
      if (path.length > 0) {
        const lastPath = path[path.length - 1];
        if (lastPath && !lastPath.includes('.')) {
          // Convert slug to title case
          return lastPath
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }
      return `Article from ${urlObj.hostname}`;
    }
    
    // Fallback - use domain and path
    try {
      const urlObj = new URL(url);
      const platform = detectPlatform(url);
      
      if (platform === 'webpage') {
        return `${urlObj.hostname} - Web Page`;
      }
      
      return `${urlObj.hostname} - ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
    } catch (e) {
      return 'Untitled Content';
    }
  } catch (error) {
    console.error('Default title extraction error:', error);
    return 'Untitled Content';
  }
}