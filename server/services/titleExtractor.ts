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
        let metadata: ContentMetadata = { title: extractDefaultTitleFromUrl(url) };
        
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
async function extractTikTokMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Try TikTok oEmbed first (it exists but is not always reliable)
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data) {
        let metadata: ContentMetadata = { title: extractDefaultTitleFromUrl(url) };
        
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
async function extractInstagramMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Try Instagram oEmbed
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data) {
        let metadata: ContentMetadata = { title: extractDefaultTitleFromUrl(url) };
        
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
async function extractFacebookMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Try Facebook oEmbed (requires access token for production use)
    const oembedUrl = `https://graph.facebook.com/v18.0/oembed_video?url=${encodeURIComponent(url)}&format=json`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data) {
        let metadata: ContentMetadata = { title: extractDefaultTitleFromUrl(url) };
        
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
async function extractVimeoMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Vimeo has a reliable oEmbed endpoint
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data) {
        let metadata: ContentMetadata = { title: extractDefaultTitleFromUrl(url) };
        
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

/**
 * Attempts to extract metadata from a Twitter/X post.
 */
async function extractTwitterMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Twitter/X doesn't have a reliable public oEmbed endpoint without auth
    
    // Extract username and tweet ID if possible
    const tweetMatch = url.match(/\/status\/(\d+)/);
    const userMatch = url.match(/(?:twitter|x)\.com\/([^\/]+)/);
    
    if (tweetMatch && tweetMatch[1] && userMatch && userMatch[1]) {
      return { 
        title: `Tweet by @${userMatch[1]}`,
        // No reliable thumbnail extraction without API access
      };
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('Twitter metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from a LinkedIn post or article.
 */
async function extractLinkedInMetadata(url: string): Promise<ContentMetadata> {
  try {
    // LinkedIn doesn't have a public oEmbed endpoint without auth
    
    // Extract post type and other info if possible
    if (url.includes('/pulse/')) {
      // This is a LinkedIn article
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length > 1) {
        const slug = pathParts[pathParts.length - 1];
        const title = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        return { title: title || 'LinkedIn Article' };
      }
      
      return { title: 'LinkedIn Article' };
    } else if (url.includes('/posts/')) {
      // This is a LinkedIn post
      const userMatch = url.match(/linkedin\.com\/in\/([^\/]+)/);
      
      if (userMatch && userMatch[1]) {
        return { title: `LinkedIn Post by ${userMatch[1]}` };
      }
      
      return { title: 'LinkedIn Post' };
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('LinkedIn metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from a Reddit post.
 */
async function extractRedditMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Try to extract post info
    const subredditMatch = url.match(/\/r\/([^\/]+)/);
    const postMatch = url.match(/\/comments\/([^\/]+)/);
    
    if (subredditMatch && subredditMatch[1] && postMatch && postMatch[1]) {
      return { 
        title: `r/${subredditMatch[1]} Reddit Post`,
        // No reliable thumbnail extraction without API access
      };
    } else if (subredditMatch && subredditMatch[1]) {
      return { title: `r/${subredditMatch[1]} Subreddit Link` };
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('Reddit metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from a Medium article.
 */
async function extractMediumMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Try Medium oEmbed API
    const oembedUrl = `https://medium.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    
    try {
      const response = await axios.get(oembedUrl);
      if (response.data && response.data.title) {
        return { 
          title: response.data.title,
          thumbnail_url: response.data.thumbnail_url
        };
      }
    } catch (oembedError) {
      console.log('Medium oEmbed failed, using default extraction');
    }
    
    // Try to extract a title from the path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length > 0) {
      const slug = pathParts[pathParts.length - 1];
      if (slug && !slug.includes('.')) {
        const title = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        return { title: title || 'Medium Article' };
      }
    }
    
    return { title: 'Medium Article' };
  } catch (error) {
    console.error('Medium metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from a Substack article.
 */
async function extractSubstackMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Extract publication and post slug
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (hostname.includes('substack.com') && pathParts.length > 0) {
      // This is likely a post
      if (pathParts[0] === 'p' && pathParts.length > 1) {
        const slug = pathParts[1];
        const title = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        const publication = hostname.replace('.substack.com', '');
        return { 
          title: `${title} | ${publication} on Substack`,
          // No reliable thumbnail extraction without scraping
        };
      }
    }
    
    return { title: extractDefaultTitleFromUrl(url) };
  } catch (error) {
    console.error('Substack metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}

/**
 * Attempts to extract metadata from a GitHub repository.
 */
async function extractGitHubMetadata(url: string): Promise<ContentMetadata> {
  try {
    // Extract user/org and repo name
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      const owner = pathParts[0];
      const repo = pathParts[1];
      
      // Try GitHub API if possible
      try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.name) {
          let title = `${response.data.name}`;
          if (response.data.description) {
            title += `: ${response.data.description}`;
          }
          
          return { 
            title: title,
            thumbnail_url: response.data.owner?.avatar_url
          };
        }
      } catch (apiError) {
        console.log('GitHub API failed, using default title');
      }
      
      return { title: `${owner}/${repo} on GitHub` };
    }
    
    return { title: 'GitHub Repository' };
  } catch (error) {
    console.error('GitHub metadata extraction error:', error);
    return { title: extractDefaultTitleFromUrl(url) };
  }
}