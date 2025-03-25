import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeVideoContent, generateRecommendations, type LinkMetadata } from "./openai";
import { detectPlatform } from "./utils/platformUtils";
import { insertUserSchema, insertLinkSchema, insertTagSchema, insertCustomTabSchema } from "../shared/schema";
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
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || req.session.userId === undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Validation middleware
const validate = (schema: z.ZodType<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors.map(e => ({ 
          path: e.path.join('.'), 
          message: e.message 
        }))
      });
    }
    return res.status(400).json({ message: "Invalid request data", error });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    name: 'sessionId', // Change session cookie name from default 'connect.sid'
    cookie: { 
      maxAge: 86400000, // 1 day
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
    },
    rolling: true // Extend session with every request
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
      // Validate password strength
      if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters and contain a number and uppercase letter" 
        });
      }
      const hashedPassword = await bcrypt.hash(password, 12);

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
      res.status(500).json({ 
        message: "Authentication failed",
        code: "AUTH_ERROR"
      });
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

  // Profile routes
  app.patch("/api/profile", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { username, email, bio, displayName, avatar_url } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if username is changed and already exists
      if (username && username !== user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ 
            message: "Username already taken. Please choose another username.",
            field: "username"
          });
        }
      }

      // Check if email is changed and already exists
      if (email && email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ 
            message: "Email already in use. Please use another email address.",
            field: "email"
          });
        }
      }

      // Update profile
      const updatedUser = await storage.updateUserProfile(userId, {
        username,
        email,
        bio,
        displayName,
        avatar_url
      });

      // Return updated user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Password update route
  app.patch("/api/profile/password", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { currentPassword, newPassword } = req.body;

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await storage.updateUserPassword(userId, hashedPassword);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Error updating password" });
    }
  });

  // Notification preferences route
  app.patch("/api/profile/notifications", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const preferences = req.body; // notification preferences object

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update notification preferences
      await storage.updateUserNotificationPreferences(userId, preferences);

      res.status(200).json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).json({ message: "Error updating notification preferences" });
    }
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

      // AI Caching: Check if this URL has been processed before by any user
      // We can reuse the metadata to avoid redundant AI API calls
      const existingLink = await storage.getLinkByUrl(url);
      let metadata;

      if (existingLink && existingLink.metadata) {
        // Use the cached metadata - this saves an OpenAI API call
        console.log("Using cached metadata for URL:", url);
        metadata = existingLink.metadata as unknown as LinkMetadata;

        // Add the thumbnail from the existing link if available
        if (existingLink.thumbnail_url) {
          metadata.thumbnail_url = existingLink.thumbnail_url;
        }
      } else {
        // No cache hit, analyze link using OpenAI
        console.log("No cache found, analyzing content for URL:", url);
        metadata = await analyzeVideoContent(url);
      }

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
        metadata.tags.map((tagName: string) => 
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
      const type = req.query.type as string;

      let links;
      if (type === 'recent') {
        // For recent links, get all links but limit to most recent 5
        links = await storage.getLinksByUserId(userId);
        links = links.slice(0, 5); // Already sorted by created_at desc in storage
      } else if (platform && ['tiktok', 'youtube', 'instagram', 'facebook', 'vimeo', 'twitter', 'linkedin', 'reddit', 'medium', 'substack', 'github', 'article', 'document', 'webpage'].includes(platform)) {
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

  // Recommendations based on AI analysis of categories and tags
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

  // Route to get not recently viewed links
  app.get("/api/recommendations/not-viewed", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;

      // Get links that haven't been viewed in a while (oldest last_viewed first)
      const notViewedLinks = await storage.getRecommendedLinks(userId, 5);

      if (notViewedLinks.length === 0) {
        return res.status(200).json([]);
      }

      res.status(200).json(notViewedLinks);
    } catch (error) {
      console.error("Get not-viewed recommendations error:", error);
      res.status(500).json({ message: "Error retrieving not viewed links" });
    }
  });

  // Route to update last_viewed timestamp when a link is viewed
  app.post("/api/links/:id/view", authenticate, async (req: Request, res: Response) => {
    try {
      const linkId = parseInt(req.params.id);

      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }

      // Verify the link exists and belongs to the user
      const userId = req.session.userId as number;
      const link = await storage.getLinkById(linkId);

      if (!link || link.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this link" });
      }

      await storage.updateLastViewed(linkId);
      res.status(200).json({ message: "Link view timestamp updated" });
    } catch (error) {
      console.error("Update last viewed error:", error);
      res.status(500).json({ message: "Error updating link view timestamp" });
    }
  });

  // Title editing route
  app.patch("/api/links/:id/title", authenticate, async (req: Request, res: Response) => {
    try {
      const linkId = parseInt(req.params.id);
      const { title } = req.body;
      const userId = req.session.userId as number;

      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }

      // Validate that we have a title
      if (!title || title.trim() === '') {
        return res.status(400).json({ message: "Title cannot be empty" });
      }

      // Verify link belongs to user
      const link = await storage.getLinkById(linkId);
      if (!link || link.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this link" });
      }

      await storage.updateLinkTitle(linkId, userId, title);
      res.status(200).json({ message: "Title updated successfully" });
    } catch (error) {
      console.error("Update title error:", error);
      res.status(500).json({ message: "Error updating title" });
    }
  });

  // Custom Tab routes
  app.post("/api/custom-tabs", authenticate, async (req: Request, res: Response) => {
    try {
      const { name, icon, description } = req.body;
      const userId = req.session.userId as number;

      // Validate the complete object with user_id included
      try {
        insertCustomTabSchema.parse({
          name,
          icon: icon || "folder",
          description: description || "",
          user_id: userId
        });
      } catch (error) {
        console.error("Custom tab validation error:", error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Invalid custom tab data", 
            errors: error.errors.map(e => ({ 
              path: e.path.join('.'), 
              message: e.message 
            }))
          });
        }
        throw error;
      }

      const customTab = await storage.createCustomTab({
        name,
        icon: icon || "folder",
        description: description || "",
        user_id: userId
      });

      res.status(201).json(customTab);
    } catch (error) {
      console.error("Create custom tab error:", error);
      res.status(500).json({ message: "Error creating custom tab" });
    }
  });

  app.get("/api/custom-tabs", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const customTabs = await storage.getCustomTabsByUserId(userId);
      res.status(200).json(customTabs);
    } catch (error) {
      console.error("Get custom tabs error:", error);
      res.status(500).json({ message: "Error fetching custom tabs" });
    }
  });

  app.get("/api/custom-tabs/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const tabId = parseInt(req.params.id);
      const userId = req.session.userId as number;

      if (isNaN(tabId)) {
        return res.status(400).json({ message: "Invalid tab ID" });
      }

      const customTab = await storage.getCustomTabById(tabId);

      if (!customTab) {
        return res.status(404).json({ message: "Custom tab not found" });
      }

      // Verify tab belongs to user
      if (customTab.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this tab" });
      }

      res.status(200).json(customTab);
    } catch (error) {
      console.error("Get custom tab error:", error);
      res.status(500).json({ message: "Error fetching custom tab" });
    }
  });

  app.delete("/api/custom-tabs/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const tabId = parseInt(req.params.id);
      const userId = req.session.userId as number;

      if (isNaN(tabId)) {
        return res.status(400).json({ message: "Invalid tab ID" });
      }

      await storage.deleteCustomTab(tabId, userId);
      res.status(200).json({ message: "Custom tab deleted successfully" });
    } catch (error) {
      console.error("Delete custom tab error:", error);
      res.status(500).json({ message: "Error deleting custom tab" });
    }
  });

  app.post("/api/custom-tabs/:tabId/links/:linkId", authenticate, async (req: Request, res: Response) => {
    try {
      console.log(`Received request to add link to tab. Params:`, req.params);

      const tabId = parseInt(req.params.tabId);
      const linkId = parseInt(req.params.linkId);
      const userId = req.session.userId as number;

      console.log(`Parsed IDs: tabId=${tabId}, linkId=${linkId}, userId=${userId}`);

      if (isNaN(tabId) || isNaN(linkId)) {
        console.error(`Invalid IDs: tabId=${tabId}, linkId=${linkId}`);
        return res.status(400).json({ message: "Invalid tab or link ID" });
      }

      // Verify tab belongs to user
      console.log(`Fetching custom tab with ID ${tabId}`);
      const customTab = await storage.getCustomTabById(tabId);
      console.log(`Custom tab lookup result:`, customTab);

      if (!customTab) {
        console.error(`Tab with ID ${tabId} not found`);
        return res.status(404).json({ message: "Tab not found" });
      }

      if (customTab.user_id !== userId) {
        console.error(`Tab belongs to user ${customTab.user_id}, not requester ${userId}`);
        return res.status(403).json({ message: "Unauthorized access to this tab" });
      }

      // Verify link belongs to user
      console.log(`Fetching link with ID ${linkId}`);
      const link = await storage.getLinkById(linkId);
      console.log(`Link lookup result:`, link ? { ...link, tags: link.tags?.length || 0 } : null);

      if (!link) {
        console.error(`Link with ID ${linkId} not found`);
        return res.status(404).json({ message: "Link not found" });
      }

      if (link.user_id !== userId) {
        console.error(`Link belongs to user ${link.user_id}, not requester ${userId}`);
        return res.status(403).json({ message: "Unauthorized access to this link" });
      }

      // All validations passed, add link to tab
      console.log(`Adding link ${linkId} to tab ${tabId}`);
      await storage.addLinkToTab(linkId, tabId);
      console.log(`Successfully added link ${linkId} to tab ${tabId}`);

      res.status(200).json({ message: "Link added to tab successfully" });
    } catch (error) {
      console.error("Add link to tab error:", error);
      let errorMessage = "Error adding link to tab";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      res.status(500).json({ message: errorMessage });
    }
  });

  app.delete("/api/custom-tabs/:tabId/links/:linkId", authenticate, async (req: Request, res: Response) => {
    try {
      const tabId = parseInt(req.params.tabId);
      const linkId = parseInt(req.params.linkId);
      const userId = req.session.userId as number;

      if (isNaN(tabId) || isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid tab or link ID" });
      }

      // Verify tab belongs to user
      const customTab = await storage.getCustomTabById(tabId);
      if (!customTab || customTab.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this tab" });
      }

      // Verify link belongs to user
      const link = await storage.getLinkById(linkId);
      if (!link || link.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this link" });
      }

      await storage.removeLinkFromTab(linkId, tabId);
      res.status(200).json({ message: "Link removed from tab successfully" });
    } catch (error) {
      console.error("Remove link from tab error:", error);
      res.status(500).json({ message: "Error removing link from tab" });
    }
  });

  app.get("/api/custom-tabs/:id/links", authenticate, async (req: Request, res: Response) => {
    try {
      const tabId = parseInt(req.params.id);
      const userId = req.session.userId as number;

      if (isNaN(tabId)) {
        return res.status(400).json({ message: "Invalid tab ID" });
      }

      // Verify tab belongs to user
      const customTab = await storage.getCustomTabById(tabId);
      if (!customTab || customTab.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this tab" });
      }

      const links = await storage.getLinksByTabId(tabId);
      res.status(200).json(links);
    } catch (error) {
      console.error("Get links by tab error:", error);
      res.status(500).json({ message: "Error fetching links for tab" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}