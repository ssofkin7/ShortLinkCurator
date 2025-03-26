import { 
  users, type User, type InsertUser,
  links, type Link, type InsertLink,
  tags, type Tag, type InsertTag,
  customTabs, type CustomTab, type InsertCustomTab,
  linkTabs, type LinkTab, type InsertLinkTab,
  type LinkWithTags,
  type CustomTabWithLinks
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";
import session from "express-session";
// Interface for storage operations
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, profileData: { 
    username?: string; 
    email?: string; 
    bio?: string; 
    displayName?: string;
    avatar_url?: string;
  }): Promise<User>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  updateUserNotificationPreferences(userId: number, preferences: {
    emailNotifications?: boolean;
    newContentAlerts?: boolean;
    weeklyDigest?: boolean;
    platformUpdates?: boolean;
  }): Promise<void>;
  
  // Link operations
  createLink(link: InsertLink): Promise<Link>;
  getLinksByUserId(userId: number): Promise<LinkWithTags[]>;
  getLinkById(id: number): Promise<LinkWithTags | undefined>;
  getLinksByPlatform(userId: number, platform: string): Promise<LinkWithTags[]>;
  getLinkCount(userId: number): Promise<number>;
  deleteLink(id: number, userId: number): Promise<void>;
  updateLastViewed(linkId: number): Promise<void>;
  updateLinkTitle(linkId: number, userId: number, title: string): Promise<void>;
  getRecommendedLinks(userId: number, limit?: number): Promise<LinkWithTags[]>;
  
  // Tag operations
  createTag(tag: InsertTag): Promise<Tag>;
  getTagsByLinkId(linkId: number): Promise<Tag[]>;
  deleteTag(id: number): Promise<void>;
  updateLinkCategory(linkId: number, category: string): Promise<void>;
  
  // Custom Tab operations
  createCustomTab(tab: InsertCustomTab): Promise<CustomTab>;
  getCustomTabsByUserId(userId: number): Promise<CustomTabWithLinks[]>;
  getCustomTabById(id: number): Promise<CustomTabWithLinks | undefined>;
  deleteCustomTab(id: number, userId: number): Promise<void>;
  addLinkToTab(linkId: number, tabId: number): Promise<void>;
  removeLinkFromTab(linkId: number, tabId: number): Promise<void>;
  getLinksByTabId(tabId: number): Promise<LinkWithTags[]>;
  
  // AI Cache operations
  getLinkByUrl(url: string): Promise<Link | undefined>;
}

import createMemoryStore from "memorystore";
import pg from "pg";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PgSessionStore = connectPg(session);

// Create a PostgreSQL pool for session storage
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// In-memory implementation for development/testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private links: Map<number, Link>;
  private tags: Map<number, Tag>;
  private customTabs: Map<number, CustomTab>;
  private linkTabs: Map<number, LinkTab>;
  currentUserId: number;
  currentLinkId: number;
  currentTagId: number;
  currentTabId: number;
  currentLinkTabId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.links = new Map();
    this.tags = new Map();
    this.customTabs = new Map();
    this.linkTabs = new Map();
    this.currentUserId = 1;
    this.currentLinkId = 1;
    this.currentTagId = 1;
    this.currentTabId = 1;
    this.currentLinkTabId = 1;
    // Create in-memory session store for development
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const created_at = new Date();
    const is_premium = false;
    const user: User = { 
      ...insertUser, 
      id, 
      created_at, 
      is_premium,
      bio: null,
      display_name: null,
      avatar_url: null,
      notification_preferences: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserProfile(userId: number, profileData: {
    username?: string;
    email?: string;
    bio?: string;
    displayName?: string;
    avatar_url?: string;
  }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update user properties that are provided
    if (profileData.username) user.username = profileData.username;
    if (profileData.email) user.email = profileData.email;
    if (profileData.bio) user.bio = profileData.bio;
    if (profileData.displayName) user.display_name = profileData.displayName;
    if (profileData.avatar_url) user.avatar_url = profileData.avatar_url;
    
    this.users.set(userId, user);
    return user;
  }
  
  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.password = newPassword;
    this.users.set(userId, user);
  }
  
  async updateUserNotificationPreferences(userId: number, preferences: {
    emailNotifications?: boolean;
    newContentAlerts?: boolean;
    weeklyDigest?: boolean;
    platformUpdates?: boolean;
  }): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Initialize notification preferences object if it doesn't exist
    if (!user.notification_preferences) {
      user.notification_preferences = {};
    }
    
    // Update preferences that are provided
    if (preferences.emailNotifications !== undefined) {
      user.notification_preferences.email_notifications = preferences.emailNotifications;
    }
    if (preferences.newContentAlerts !== undefined) {
      user.notification_preferences.new_content_alerts = preferences.newContentAlerts;
    }
    if (preferences.weeklyDigest !== undefined) {
      user.notification_preferences.weekly_digest = preferences.weeklyDigest;
    }
    if (preferences.platformUpdates !== undefined) {
      user.notification_preferences.platform_updates = preferences.platformUpdates;
    }
    
    this.users.set(userId, user);
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = this.currentLinkId++;
    const created_at = new Date();
    const last_viewed = new Date();
    
    // Ensure null values for optional fields
    const sanitizedLink = {
      ...insertLink,
      thumbnail_url: insertLink.thumbnail_url ?? null,
      duration: insertLink.duration ?? null,
      metadata: insertLink.metadata ?? null,
      last_viewed: insertLink.last_viewed ?? last_viewed
    };
    
    const link: Link = { ...sanitizedLink, id, created_at };
    this.links.set(id, link);
    return link;
  }

  async getLinksByUserId(userId: number): Promise<LinkWithTags[]> {
    const userLinks = Array.from(this.links.values())
      .filter(link => link.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return Promise.all(userLinks.map(async link => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }

  async getLinkById(id: number): Promise<LinkWithTags | undefined> {
    const link = this.links.get(id);
    if (!link) return undefined;
    
    const linkTags = await this.getTagsByLinkId(id);
    return { ...link, tags: linkTags };
  }

  async getLinksByPlatform(userId: number, platform: string): Promise<LinkWithTags[]> {
    const userLinks = Array.from(this.links.values())
      .filter(link => link.user_id === userId && link.platform === platform)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return Promise.all(userLinks.map(async link => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }

  async getLinkCount(userId: number): Promise<number> {
    return Array.from(this.links.values()).filter(link => link.user_id === userId).length;
  }

  async deleteLink(id: number, userId: number): Promise<void> {
    const link = this.links.get(id);
    if (link && link.user_id === userId) {
      this.links.delete(id);
      
      // Delete associated tags
      const allTags = Array.from(this.tags.values());
      for (const tag of allTags) {
        if (tag.link_id === id) {
          this.tags.delete(tag.id);
        }
      }
    }
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentTagId++;
    const created_at = new Date();
    const tag: Tag = { ...insertTag, id, created_at };
    this.tags.set(id, tag);
    return tag;
  }

  async getTagsByLinkId(linkId: number): Promise<Tag[]> {
    return Array.from(this.tags.values())
      .filter(tag => tag.link_id === linkId);
  }

  async deleteTag(id: number): Promise<void> {
    this.tags.delete(id);
  }

  async updateLinkCategory(linkId: number, category: string): Promise<void> {
    const link = this.links.get(linkId);
    if (link) {
      link.category = category;
      this.links.set(linkId, link);
    }
  }

  async updateLastViewed(linkId: number): Promise<void> {
    const link = this.links.get(linkId);
    if (link) {
      link.last_viewed = new Date();
      this.links.set(linkId, link);
    }
  }
  
  async updateLinkTitle(linkId: number, userId: number, title: string): Promise<void> {
    const link = this.links.get(linkId);
    if (link && link.user_id === userId) {
      link.title = title;
      this.links.set(linkId, link);
    } else {
      throw new Error("Link not found or not owned by user");
    }
  }

  async getRecommendedLinks(userId: number, limit: number = 5): Promise<LinkWithTags[]> {
    const userLinks = Array.from(this.links.values())
      .filter(link => link.user_id === userId)
      .sort((a, b) => {
        // Sort by last_viewed (oldest first)
        const aLastViewed = a.last_viewed ? a.last_viewed.getTime() : 0;
        const bLastViewed = b.last_viewed ? b.last_viewed.getTime() : 0;
        return aLastViewed - bLastViewed;
      })
      .slice(0, limit);
    
    return Promise.all(userLinks.map(async link => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }
  
  async getLinkByUrl(url: string): Promise<Link | undefined> {
    return Array.from(this.links.values()).find(link => link.url === url);
  }

  // Custom Tab operations
  async createCustomTab(tab: InsertCustomTab): Promise<CustomTab> {
    const id = this.currentTabId++;
    const created_at = new Date();
    
    // Create the custom tab with properly typed fields
    const customTab: CustomTab = { 
      id,
      name: tab.name, 
      user_id: tab.user_id,
      created_at,
      // Ensure icon is never undefined by defaulting to null
      icon: tab.icon ?? null,
      // Ensure description is never undefined by defaulting to null
      description: tab.description ?? null
    };
    
    console.log("[MemStorage] Creating custom tab:", customTab);
    this.customTabs.set(id, customTab);
    return customTab;
  }

  async getCustomTabsByUserId(userId: number): Promise<CustomTabWithLinks[]> {
    const userTabs = Array.from(this.customTabs.values())
      .filter(tab => tab.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return Promise.all(userTabs.map(async tab => {
      const tabLinks = await this.getLinksByTabId(tab.id);
      return { ...tab, links: tabLinks };
    }));
  }

  async getCustomTabById(id: number): Promise<CustomTabWithLinks | undefined> {
    const tab = this.customTabs.get(id);
    if (!tab) return undefined;
    
    const tabLinks = await this.getLinksByTabId(id);
    return { ...tab, links: tabLinks };
  }

  async deleteCustomTab(id: number, userId: number): Promise<void> {
    const tab = this.customTabs.get(id);
    if (tab && tab.user_id === userId) {
      this.customTabs.delete(id);
      
      // Delete all link-tab associations for this tab
      const allLinkTabs = Array.from(this.linkTabs.values());
      for (const linkTab of allLinkTabs) {
        if (linkTab.tab_id === id) {
          this.linkTabs.delete(linkTab.id);
        }
      }
    }
  }

  async addLinkToTab(linkId: number, tabId: number): Promise<void> {
    // Check if the link and tab exist
    const link = this.links.get(linkId);
    const tab = this.customTabs.get(tabId);
    if (!link || !tab) {
      throw new Error("Link or tab not found");
    }
    
    // Check if association already exists
    const existingAssociation = Array.from(this.linkTabs.values())
      .find(lt => lt.link_id === linkId && lt.tab_id === tabId);
    
    if (!existingAssociation) {
      const id = this.currentLinkTabId++;
      const created_at = new Date();
      const linkTab: LinkTab = {
        id,
        link_id: linkId,
        tab_id: tabId,
        created_at
      };
      this.linkTabs.set(id, linkTab);
    }
  }

  async removeLinkFromTab(linkId: number, tabId: number): Promise<void> {
    const association = Array.from(this.linkTabs.values())
      .find(lt => lt.link_id === linkId && lt.tab_id === tabId);
    
    if (association) {
      this.linkTabs.delete(association.id);
    }
  }

  async getLinksByTabId(tabId: number): Promise<LinkWithTags[]> {
    // Find all link-tab associations for this tab
    const tabLinkIds = Array.from(this.linkTabs.values())
      .filter(lt => lt.tab_id === tabId)
      .map(lt => lt.link_id);
    
    // Get all links that are in this tab
    const tabLinks = Array.from(this.links.values())
      .filter(link => tabLinkIds.includes(link.id))
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return Promise.all(tabLinks.map(async link => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }
}

// Database implementation using Supabase
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Import and setup PostgreSQL session store
    const connectPg = require('connect-pg-simple');
    const PostgresStore = connectPg(session);
    
    // Create a PostgreSQL pool for session storage
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Create PostgreSQL session store
    this.sessionStore = new PostgresStore({
      pool: pool, 
      createTableIfMissing: true,
      tableName: 'session' // Default table name
    });
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserProfile(userId: number, profileData: {
    username?: string;
    email?: string;
    bio?: string;
    displayName?: string;
    avatar_url?: string;
  }): Promise<User> {
    const updateData: any = {};
    
    // Only add fields that are provided to the update object
    if (profileData.username) updateData.username = profileData.username;
    if (profileData.email) updateData.email = profileData.email;
    if (profileData.bio) updateData.bio = profileData.bio;
    if (profileData.displayName) updateData.display_name = profileData.displayName;
    if (profileData.avatar_url) updateData.avatar_url = profileData.avatar_url;
    
    // Update user in database
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));
  }
  
  async updateUserNotificationPreferences(userId: number, preferences: {
    emailNotifications?: boolean;
    newContentAlerts?: boolean;
    weeklyDigest?: boolean;
    platformUpdates?: boolean;
  }): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Create notification preferences object to update
    const notificationPreferences: any = user.notification_preferences || {};
    
    // Update only the provided preferences
    if (preferences.emailNotifications !== undefined) {
      notificationPreferences.email_notifications = preferences.emailNotifications;
    }
    if (preferences.newContentAlerts !== undefined) {
      notificationPreferences.new_content_alerts = preferences.newContentAlerts;
    }
    if (preferences.weeklyDigest !== undefined) {
      notificationPreferences.weekly_digest = preferences.weeklyDigest;
    }
    if (preferences.platformUpdates !== undefined) {
      notificationPreferences.platform_updates = preferences.platformUpdates;
    }
    
    // Update user notification preferences in database
    await db.update(users)
      .set({ notification_preferences: notificationPreferences })
      .where(eq(users.id, userId));
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const last_viewed = new Date();
    // Ensure null values for optional fields
    const sanitizedLink = {
      ...insertLink,
      thumbnail_url: insertLink.thumbnail_url ?? null,
      duration: insertLink.duration ?? null,
      metadata: insertLink.metadata ?? null,
      last_viewed: insertLink.last_viewed ?? last_viewed
    };
    
    const [link] = await db.insert(links).values(sanitizedLink).returning();
    return link;
  }

  async getLinksByUserId(userId: number): Promise<LinkWithTags[]> {
    const userLinks = await db.select().from(links)
      .where(eq(links.user_id, userId))
      .orderBy(desc(links.created_at));
    
    return Promise.all(userLinks.map(async (link) => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }

  async getLinkById(id: number): Promise<LinkWithTags | undefined> {
    const [link] = await db.select().from(links).where(eq(links.id, id));
    if (!link) return undefined;
    
    const linkTags = await this.getTagsByLinkId(id);
    return { ...link, tags: linkTags };
  }

  async getLinksByPlatform(userId: number, platform: string): Promise<LinkWithTags[]> {
    const filteredLinks = await db.select().from(links)
      .where(and(
        eq(links.user_id, userId),
        eq(links.platform, platform)
      ))
      .orderBy(desc(links.created_at));
    
    return Promise.all(filteredLinks.map(async (link) => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }

  async getLinkCount(userId: number): Promise<number> {
    const result = await db.select({ count: links.id }).from(links)
      .where(eq(links.user_id, userId));
    return result.length;
  }

  async deleteLink(id: number, userId: number): Promise<void> {
    // First delete all associated tags
    await db.delete(tags).where(eq(tags.link_id, id));
    
    // Then delete the link
    await db.delete(links).where(
      and(
        eq(links.id, id),
        eq(links.user_id, userId)
      )
    );
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(insertTag).returning();
    return tag;
  }

  async getTagsByLinkId(linkId: number): Promise<Tag[]> {
    return db.select().from(tags).where(eq(tags.link_id, linkId));
  }

  async deleteTag(id: number): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }

  async updateLinkCategory(linkId: number, category: string): Promise<void> {
    await db.update(links)
      .set({ category })
      .where(eq(links.id, linkId));
  }
  
  async updateLastViewed(linkId: number): Promise<void> {
    await db.update(links)
      .set({ last_viewed: new Date() })
      .where(eq(links.id, linkId));
  }
  
  async updateLinkTitle(linkId: number, userId: number, title: string): Promise<void> {
    await db.update(links)
      .set({ title })
      .where(
        and(
          eq(links.id, linkId),
          eq(links.user_id, userId)
        )
      );
  }
  
  async getRecommendedLinks(userId: number, limit: number = 5): Promise<LinkWithTags[]> {
    // Get links sorted by last_viewed (oldest first)
    const recommendedLinks = await db.select().from(links)
      .where(eq(links.user_id, userId))
      .orderBy(links.last_viewed)
      .limit(limit);
    
    return Promise.all(recommendedLinks.map(async (link) => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }
  
  async getLinkByUrl(url: string): Promise<Link | undefined> {
    // This method is used for AI caching to check if we've already processed this URL
    const [link] = await db.select().from(links).where(eq(links.url, url));
    return link;
  }
  
  // Custom Tab operations
  async createCustomTab(tab: InsertCustomTab): Promise<CustomTab> {
    const [customTab] = await db.insert(customTabs).values(tab).returning();
    return customTab;
  }

  async getCustomTabsByUserId(userId: number): Promise<CustomTabWithLinks[]> {
    const userTabs = await db.select().from(customTabs)
      .where(eq(customTabs.user_id, userId))
      .orderBy(desc(customTabs.created_at));
    
    return Promise.all(userTabs.map(async (tab) => {
      const tabLinks = await this.getLinksByTabId(tab.id);
      return { ...tab, links: tabLinks };
    }));
  }

  async getCustomTabById(id: number): Promise<CustomTabWithLinks | undefined> {
    const [tab] = await db.select().from(customTabs).where(eq(customTabs.id, id));
    if (!tab) return undefined;
    
    const tabLinks = await this.getLinksByTabId(id);
    return { ...tab, links: tabLinks };
  }

  async deleteCustomTab(id: number, userId: number): Promise<void> {
    // First delete all link-tab associations for this tab
    await db.delete(linkTabs).where(eq(linkTabs.tab_id, id));
    
    // Then delete the tab
    await db.delete(customTabs).where(
      and(
        eq(customTabs.id, id),
        eq(customTabs.user_id, userId)
      )
    );
  }

  async addLinkToTab(linkId: number, tabId: number): Promise<void> {
    console.log(`[Storage] Adding link ${linkId} to tab ${tabId}`);
    
    try {
      // Check if link and tab exist first
      console.log(`[Storage] Checking if link ${linkId} exists`);
      const [link] = await db.select().from(links).where(eq(links.id, linkId));
      console.log(`[Storage] Link check result:`, link ? `Found (user_id: ${link.user_id})` : 'Not found');
      
      console.log(`[Storage] Checking if tab ${tabId} exists`);
      const [tab] = await db.select().from(customTabs).where(eq(customTabs.id, tabId));
      console.log(`[Storage] Tab check result:`, tab ? `Found (user_id: ${tab.user_id})` : 'Not found');
      
      if (!link || !tab) {
        const error = new Error(`Link or tab not found (link: ${!!link}, tab: ${!!tab})`);
        console.error(`[Storage] Error:`, error);
        throw error;
      }
      
      // Check if association already exists
      console.log(`[Storage] Checking if link-tab association already exists`);
      const [existingAssociation] = await db.select()
        .from(linkTabs)
        .where(
          and(
            eq(linkTabs.link_id, linkId),
            eq(linkTabs.tab_id, tabId)
          )
        );
      
      console.log(`[Storage] Association check result:`, existingAssociation ? 'Already exists' : 'Does not exist');
      
      if (!existingAssociation) {
        console.log(`[Storage] Creating new association between link ${linkId} and tab ${tabId}`);
        await db.insert(linkTabs).values({
          link_id: linkId,
          tab_id: tabId
        });
        console.log(`[Storage] Successfully created link-tab association`);
      } else {
        console.log(`[Storage] Skipping insert as association already exists`);
      }
    } catch (error) {
      console.error(`[Storage] Error in addLinkToTab:`, error);
      throw error;
    }
  }

  async removeLinkFromTab(linkId: number, tabId: number): Promise<void> {
    console.log(`[Storage] Removing link ${linkId} from tab ${tabId}`);
    
    try {
      // Verify the association exists before trying to delete
      console.log(`[Storage] Checking if link-tab association exists`);
      const [existingAssociation] = await db.select()
        .from(linkTabs)
        .where(
          and(
            eq(linkTabs.link_id, linkId),
            eq(linkTabs.tab_id, tabId)
          )
        );
      
      if (!existingAssociation) {
        console.log(`[Storage] Warning: Attempted to remove non-existent association between link ${linkId} and tab ${tabId}`);
        return; // No error, just a no-op if it doesn't exist
      }
      
      console.log(`[Storage] Deleting association between link ${linkId} and tab ${tabId}`);
      await db.delete(linkTabs).where(
        and(
          eq(linkTabs.link_id, linkId),
          eq(linkTabs.tab_id, tabId)
        )
      );
      console.log(`[Storage] Successfully removed link ${linkId} from tab ${tabId}`);
    } catch (error) {
      console.error(`[Storage] Error in removeLinkFromTab:`, error);
      throw error;
    }
  }

  async getLinksByTabId(tabId: number): Promise<LinkWithTags[]> {
    // First, get all link IDs from the tab
    const linkTabAssociations = await db
      .select()
      .from(linkTabs)
      .where(eq(linkTabs.tab_id, tabId));
    
    if (linkTabAssociations.length === 0) {
      return [];
    }
    
    // Get the links one by one - not the most efficient but simplest to implement
    const tabLinks: Link[] = [];
    for (const assoc of linkTabAssociations) {
      const [link] = await db
        .select()
        .from(links)
        .where(eq(links.id, assoc.link_id));
      
      if (link) {
        tabLinks.push(link);
      }
    }
    
    // Sort by creation date, newest first
    tabLinks.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    // Add tags to each link
    return Promise.all(tabLinks.map(async (link) => {
      const linkTags = await this.getTagsByLinkId(link.id);
      return { ...link, tags: linkTags };
    }));
  }
}

// Use database storage for all environments since we've set up the database tables
export const storage = new DatabaseStorage();
