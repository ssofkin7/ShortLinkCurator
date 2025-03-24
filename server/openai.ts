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

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

interface LinkMetadata {
  title: string;
  platform: PlatformType;
  category: string;
  tags: string[];
  duration?: string;
  thumbnail_url?: string;
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
    
    const prompt = `
      Analyze this ${platform} short-form video content based on the URL, title, and description.
      URL: ${url}
      Title: ${title || defaultTitle}
      Description: ${description}
      
      Return a JSON object with the following fields:
      - title: ${title ? "Use this exact title: " + title : "The most likely title for this content. Be descriptive and concise (15-50 characters)."} 
      - category: A single category that best describes this content (e.g., "Fitness", "Cooking", "Technology", "Fashion", etc.)
      - tags: An array of 3-5 relevant tags for this content
      - duration: If you can detect it, the duration of the video (otherwise null)
      
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
