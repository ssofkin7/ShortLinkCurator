import OpenAI from "openai";
// Import the metadata extractor and shared platform utilities
import { extractVideoMetadata } from './services/titleExtractor';
import { 
  PlatformType, 
  detectPlatform, 
  extractDefaultTitleFromUrl 
} from './utils/platformUtils';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key must be configured in environment variables');
}

// Switched to GPT-3.5-turbo for cost optimization as requested by the user
const MODEL = "gpt-3.5-turbo";

export interface LinkMetadata {
  title: string;
  platform: PlatformType;
  category: string;
  tags: string[];
  duration?: string;
  thumbnail_url?: string;
}

/**
 * Optimize title for AI processing to reduce token usage
 */
function optimizeTitleForAI(title: string): string {
  return title
    .replace(/[😍🔥🎤👀💯]/g, '') // Remove common emojis
    .replace(/\b(how|her|opens|this|that|with|the|and|or|for|is|are|was|were|have|has|had|a|an|of|in|on|at|to|by|it|its)\b/gi, '') // Remove filler words
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Extract metadata from content title and description
export async function analyzeVideoContent(
  url: string, 
  providedTitle: string = '', 
  description: string = ''
): Promise<LinkMetadata> {
  const platform = detectPlatform(url);
  let defaultTitle = extractDefaultTitleFromUrl(url);
  let thumbnailUrl: string | undefined = undefined;
  
  try {
    // First try to get metadata from oEmbed or similar
    let title = providedTitle;
    
    if (!title) {
      try {
        // For video platforms, try to extract both title and thumbnail from oEmbed
        if (['youtube', 'vimeo', 'facebook', 'instagram', 'tiktok'].includes(platform)) {
          const videoMetadata = await extractVideoMetadata(url);
          title = videoMetadata.title;
          thumbnailUrl = videoMetadata.thumbnail_url;
          
          console.log(`Metadata extracted from ${platform}:`, { 
            title, 
            hasThumbnail: !!thumbnailUrl 
          });
          
          // If title extraction returned a real title, use it as the default
          if (title && title !== 'Untitled Content') {
            defaultTitle = title;
          }
        }
      } catch (extractionError) {
        console.error('Error extracting content metadata:', extractionError);
      }
    }
    
    // Use the original title for display, but optimize it for the AI to reduce tokens
    const optimizedTitle = optimizeTitleForAI(title || defaultTitle);
    
    // Determine content type based on platform
    let contentType: string;
    
    switch (platform) {
      // Video platforms
      case 'youtube':
        contentType = url.includes('/shorts/') ? 'short-form video' : 'video';
        break;
      case 'tiktok':
        contentType = 'short-form video';
        break;
      case 'instagram':
        contentType = url.includes('/reel/') ? 'short-form video' : 'post';
        break;
      case 'facebook':
      case 'vimeo':
        contentType = 'video';
        break;
        
      // Social media platforms
      case 'twitter':
        contentType = 'tweet';
        break;
      case 'linkedin':
        contentType = 'post';
        break;
      case 'reddit':
        contentType = 'post';
        break;
        
      // Content platforms
      case 'medium':
      case 'substack':
        contentType = 'article';
        break;
      case 'github':
        contentType = 'repository';
        break;
        
      // Generic types
      case 'article':
        contentType = 'article';
        break;
      case 'document':
        contentType = 'document';
        break;
      default:
        contentType = 'webpage';
    }
                        
    // Shorten the prompt to reduce input tokens
    const prompt = `
      Analyze: ${platform} ${contentType}
      Title: ${optimizedTitle}
      URL: ${url}
      
      Return JSON with:
      - title: ${title ? "Use exactly: " + title : "Brief descriptive title"} 
      - category: Single best category
      - tags: 3-5 relevant tags
      - duration: Include only for video content (null if not applicable)
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You categorize content concisely. Provide appropriate categories and tags for various types of content including videos, articles, social media posts, documents, and webpages." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150 // Limit output tokens
    });

    try {
      const content = response.choices[0].message.content || '{}';
      const result = JSON.parse(content);
      
      // Ensure proper typing and defaults
      return {
        title: result?.title || defaultTitle,
        platform: platform as PlatformType,
        category: result?.category || 'Uncategorized',
        tags: Array.isArray(result?.tags) ? result.tags : [],
        duration: result?.duration || undefined,
        thumbnail_url: thumbnailUrl // Use the thumbnail from oEmbed
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return {
        title: defaultTitle,
        platform: platform as PlatformType,
        category: 'Uncategorized',
        tags: [],
        duration: undefined,
        thumbnail_url: thumbnailUrl
      };
    }
  } catch (error) {
    console.error('Error analyzing video content:', error);
    
    // Return basic metadata if AI analysis fails
    return {
      title: defaultTitle,
      platform: platform as PlatformType,
      category: 'Uncategorized',
      tags: [],
      duration: undefined,
      thumbnail_url: thumbnailUrl
    };
  }
}

// Generate personalized recommendations based on user's saved links
export async function generateRecommendations(
  savedCategories: string[],
  savedTags: string[]
): Promise<{ title: string; platform: PlatformType; category: string; reason: string }[]> {
  try {
    // Limit input tokens by taking only the most used categories and tags
    const topCategories = savedCategories.slice(0, 3);
    const topTags = savedTags.slice(0, 5);
    
    // Create a shorter, more concise prompt
    const prompt = `
      Suggest 3 content items based on:
      Categories: ${topCategories.join(', ')}
      Tags: ${topTags.join(', ')}
      
      Return only JSON array with 3 suggestions including a mix of videos, articles, social media posts, and more:
      - title: brief engaging title
      - platform: Choose from "tiktok", "youtube", "instagram", "facebook", "vimeo", "twitter", "linkedin", "reddit", "medium", "substack", "github", "article", "document", or "webpage"
      - category: main category
      - reason: why it's recommended (brief)
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You provide concise content recommendations based on user interests. Include a variety of content types such as videos (both short-form and regular), articles, social media posts, documents, and other web content."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200 // Limit output tokens
    });

    try {
      const content = response.choices[0].message.content || '{}';
      const result = JSON.parse(content);
      
      if (Array.isArray(result)) {
        return result.slice(0, 3);
      } else if (result.recommendations && Array.isArray(result.recommendations)) {
        return result.recommendations.slice(0, 3);
      }
      
      return [];
    } catch (parseError) {
      console.error('Error parsing OpenAI recommendations response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}
