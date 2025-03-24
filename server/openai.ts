import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key' 
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

type PlatformType = 'tiktok' | 'youtube' | 'instagram';

interface LinkMetadata {
  title: string;
  platform: PlatformType;
  category: string;
  tags: string[];
  duration?: string;
  thumbnail_url?: string;
}

// Extracts platform from URL
export function detectPlatform(url: string): PlatformType | null {
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  } else if (url.includes('youtube.com/shorts') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('instagram.com/reel')) {
    return 'instagram';
  }
  return null;
}

// Helper function to extract default title from URL
function extractDefaultTitleFromUrl(url: string): string {
  try {
    // Try to extract title from URL patterns
    if (url.includes('youtube.com/shorts/')) {
      // YouTube shorts format: https://www.youtube.com/shorts/VIDEO_ID
      const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
      // For YouTube, use a more user-friendly title format
      return videoId ? `How to Watch This YouTube Short` : "YouTube Short";
    } else if (url.includes('youtu.be/')) {
      // YouTube short link format
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `How to Watch This YouTube Video` : "YouTube Video";
    } else if (url.includes('tiktok.com/')) {
      // TikTok format: https://www.tiktok.com/@username/video/VIDEO_ID
      let tiktokTitle = "TikTok Video";
      if (url.includes('@')) {
        const username = url.split('@')[1]?.split('/')[0];
        if (username) {
          tiktokTitle = `TikTok by @${username}`;
        }
      }
      return tiktokTitle;
    } else if (url.includes('instagram.com/reel/')) {
      // Instagram reels format: https://www.instagram.com/reel/CODE/
      const code = url.split('instagram.com/reel/')[1]?.split('/')[0];
      return code ? `Instagram Reel Content` : "Instagram Reel";
    }
  } catch (e) {
    console.log('Error extracting title from URL:', e);
  }
  
  // Fallback
  return 'Short-form video';
}

// Extract metadata from video title and description
export async function analyzeVideoContent(
  url: string, 
  title: string = '', 
  description: string = ''
): Promise<LinkMetadata> {
  const platform = detectPlatform(url) || 'unknown';
  const defaultTitle = extractDefaultTitleFromUrl(url);
  
  try {
    const prompt = `
      Analyze this ${platform} short-form video content based on the URL, title, and description.
      URL: ${url}
      Title: ${title}
      Description: ${description}
      
      Return a JSON object with the following fields:
      - title: The most likely title for this content. Be descriptive and concise (15-50 characters).
      - category: A single category that best describes this content (e.g., "Fitness", "Cooking", "Technology", "Fashion", etc.)
      - tags: An array of 3-5 relevant tags for this content
      - duration: If you can detect it, the duration of the video (otherwise null)
      - thumbnail_url: Leave as null (we'll handle thumbnails separately)
      
      Return ONLY the JSON object, no additional text.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a content analysis assistant that categorizes short-form video content." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
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
        thumbnail_url: undefined // We'll set this separately
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return {
        title: defaultTitle,
        platform: platform as PlatformType,
        category: 'Uncategorized',
        tags: [],
        duration: undefined,
        thumbnail_url: undefined
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
      thumbnail_url: undefined
    };
  }
}

// Generate personalized recommendations based on user's saved links
export async function generateRecommendations(
  savedCategories: string[],
  savedTags: string[]
): Promise<{ title: string; platform: PlatformType; category: string; reason: string }[]> {
  try {
    const prompt = `
      Based on a user's saved video preferences, suggest 3 short-form videos they might enjoy.
      
      User's preferred categories: ${savedCategories.join(', ')}
      User's preferred tags: ${savedTags.join(', ')}
      
      Return a JSON array with 3 video suggestions, each with:
      - title: An engaging, realistic title
      - platform: Either "tiktok", "youtube", or "instagram"
      - category: The main category
      - reason: Why this is recommended based on their preferences
      
      Make the suggestions varied but relevant. Return ONLY the JSON array, no additional text.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a content recommendation system that provides personalized video suggestions." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
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
