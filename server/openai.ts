import OpenAI from "openai";
// Import the metadata extractor and shared platform utilities
import { extractVideoMetadata } from './services/titleExtractor';
import { 
  PlatformType, 
  detectPlatform, 
  extractDefaultTitleFromUrl 
} from './utils/platformUtils';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key' 
});

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

// Extract metadata from video title and description
export async function analyzeVideoContent(
  url: string, 
  providedTitle: string = '', 
  description: string = ''
): Promise<LinkMetadata> {
  const platform = detectPlatform(url) || 'unknown';
  let defaultTitle = extractDefaultTitleFromUrl(url);
  let thumbnailUrl: string | undefined = undefined;
  
  try {
    // First try to get metadata from oEmbed or similar
    let title = providedTitle;
    
    if (!title) {
      try {
        // Extract both title and thumbnail from oEmbed
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
      } catch (extractionError) {
        console.error('Error extracting video metadata:', extractionError);
      }
    }
    
    // Use the original title for display, but optimize it for the AI to reduce tokens
    const optimizedTitle = optimizeTitleForAI(title || defaultTitle);
    
    // Shorten the prompt to reduce input tokens
    const prompt = `
      Analyze: ${platform} video
      Title: ${optimizedTitle}
      URL: ${url}
      
      Return JSON with:
      - title: ${title ? "Use exactly: " + title : "Brief descriptive title"} 
      - category: Single best category
      - tags: 3-5 relevant tags
      - duration: If detectable (null if not)
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You categorize short-form videos concisely." },
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
      Suggest 3 short videos based on:
      Categories: ${topCategories.join(', ')}
      Tags: ${topTags.join(', ')}
      
      Return only JSON array with 3 suggestions:
      - title: brief engaging title
      - platform: "tiktok", "youtube", or "instagram"
      - category: main category
      - reason: why it's recommended (brief)
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You provide concise video recommendations." },
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
