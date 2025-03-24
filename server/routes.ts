import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeVideoContent, generateRecommendations } from "./openai";
import { detectPlatform } from "./utils/platformUtils";
import { insertUserSchema, insertLinkSchema, insertTagSchema } from "../shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Create session store
const SessionStore = MemoryStore(session);

// Authentication middleware
const authenticate = (req: Request, res: Response, next: Function) => {
  if (!req.session || req.session.userId === undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Validation middleware
const validate = (schema: z.ZodType<any, any>) => (req: Request, res: Response, next: Function) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid request data", error });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    cookie: { maxAge: 86400000 }, // 1 day
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'linkOrbitSecretKey'
  }));

  // User routes
  app.post("/api/register", validate(insertUserSchema), async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword
      });
      
      // Set user in session
      req.session.userId = user.id;
      
      // Return user (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      // Return user (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });

  app.get("/api/user", authenticate, async (req: Request, res: Response) => {
    try {
      // The authenticate middleware already checks if userId exists
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Link routes
  app.post("/api/links", authenticate, async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      const userId = req.session.userId as number;
      
      // Check if user is on free tier and has reached the limit
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.is_premium) {
        const linkCount = await storage.getLinkCount(userId);
        if (linkCount >= 50) {
          return res.status(403).json({ 
            message: "Free tier limit reached (50 links). Please upgrade to premium."
          });
        }
      }
      
      // Validate platform
      const platform = detectPlatform(url);
      if (!platform) {
        return res.status(400).json({ 
          message: "Unsupported link. Only TikTok, YouTube Shorts, and Instagram Reels are supported."
        });
      }
      
      // Analyze link using OpenAI
      const metadata = await analyzeVideoContent(url);
      
      // Create the link
      const link = await storage.createLink({
        url,
        title: metadata.title,
        platform,
        thumbnail_url: metadata.thumbnail_url ?? null,
        category: metadata.category,
        duration: metadata.duration ?? null,
        user_id: userId,
        metadata: metadata as unknown as Record<string, any>
      });
      
      // Create tags
      const tags = await Promise.all(
        metadata.tags.map(tagName => 
          storage.createTag({
            name: tagName,
            link_id: link.id
          })
        )
      );
      
      res.status(201).json({ ...link, tags });
    } catch (error) {
      console.error("Create link error:", error);
      res.status(500).json({ message: "Error saving link" });
    }
  });

  app.get("/api/links", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const platform = req.query.platform as string;
      
      let links;
      if (platform && ['tiktok', 'youtube', 'instagram'].includes(platform)) {
        links = await storage.getLinksByPlatform(userId, platform);
      } else {
        links = await storage.getLinksByUserId(userId);
      }
      
      res.status(200).json(links);
    } catch (error) {
      console.error("Get links error:", error);
      res.status(500).json({ message: "Error fetching links" });
    }
  });

  app.get("/api/links/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const linkId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      const link = await storage.getLinkById(linkId);
      
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      // Verify link belongs to user
      if (link.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this link" });
      }
      
      res.status(200).json(link);
    } catch (error) {
      console.error("Get link error:", error);
      res.status(500).json({ message: "Error fetching link" });
    }
  });

  app.delete("/api/links/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const linkId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      await storage.deleteLink(linkId, userId);
      res.status(200).json({ message: "Link deleted successfully" });
    } catch (error) {
      console.error("Delete link error:", error);
      res.status(500).json({ message: "Error deleting link" });
    }
  });

  // Tag routes
  app.post("/api/tags", authenticate, validate(insertTagSchema), async (req: Request, res: Response) => {
    try {
      const { name, link_id } = req.body;
      const userId = req.session.userId as number;
      
      // Verify link belongs to user
      const link = await storage.getLinkById(link_id);
      if (!link || link.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this link" });
      }
      
      const tag = await storage.createTag({ name, link_id });
      res.status(201).json(tag);
    } catch (error) {
      console.error("Create tag error:", error);
      res.status(500).json({ message: "Error creating tag" });
    }
  });

  app.delete("/api/tags/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const tagId = parseInt(req.params.id);
      
      // Would need to verify ownership in a real implementation
      await storage.deleteTag(tagId);
      res.status(200).json({ message: "Tag deleted successfully" });
    } catch (error) {
      console.error("Delete tag error:", error);
      res.status(500).json({ message: "Error deleting tag" });
    }
  });

  // Category update
  app.patch("/api/links/:id/category", authenticate, async (req: Request, res: Response) => {
    try {
      const linkId = parseInt(req.params.id);
      const { category } = req.body;
      const userId = req.session.userId as number;
      
      // Verify link belongs to user
      const link = await storage.getLinkById(linkId);
      if (!link || link.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this link" });
      }
      
      await storage.updateLinkCategory(linkId, category);
      res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ message: "Error updating category" });
    }
  });

  // Recommendations
  app.get("/api/recommendations", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const links = await storage.getLinksByUserId(userId);
      
      // Default recommendations for new users or when there's an error
      const defaultRecommendations = [
        {
          title: "5-Minute Morning Yoga Routine for Energy",
          platform: "youtube" as const,
          category: "Fitness",
          reason: "Popular short workout for quick energy boost"
        },
        {
          title: "Easy 15-Minute Pasta Recipe Anyone Can Make",
          platform: "tiktok" as const,
          category: "Cooking",
          reason: "Quick and simple recipe perfect for beginners"
        },
        {
          title: "3 Productivity Hacks That Changed My Life",
          platform: "instagram" as const,
          category: "Productivity",
          reason: "Trending time management tips for busy people"
        },
        {
          title: "Learn Basic Coding in 60 Seconds",
          platform: "youtube" as const,
          category: "Education",
          reason: "Bite-sized learning for tech beginners"
        },
        {
          title: "DIY Home Organization Ideas",
          platform: "tiktok" as const,
          category: "Lifestyle",
          reason: "Creative storage solutions for small spaces"
        }
      ];
      
      // If user has no links or very few, return default recommendations
      if (links.length < 2) {
        return res.status(200).json(defaultRecommendations);
      }
      
      try {
        // Extract unique categories and tags using a more compatible approach
        const categoriesMap: {[key: string]: boolean} = {};
        const tagsMap: {[key: string]: boolean} = {};
        
        // Track unique values
        links.forEach(link => {
          categoriesMap[link.category] = true;
          link.tags.forEach(tag => {
            tagsMap[tag.name] = true;
          });
        });
        
        // Convert to arrays
        const categories = Object.keys(categoriesMap);
        const tags = Object.keys(tagsMap);
        
        // Generate recommendations using OpenAI
        const recommendations = await generateRecommendations(categories, tags);
        
        res.status(200).json(recommendations);
      } catch (openAiError) {
        console.error("OpenAI recommendation error:", openAiError);
        // Fall back to default recommendations if OpenAI fails
        res.status(200).json(defaultRecommendations);
      }
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ message: "Error generating recommendations" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
