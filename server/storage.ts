import { 
  users, type User, type InsertUser,
  links, type Link, type InsertLink,
  tags, type Tag, type InsertTag,
  type LinkWithTags
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Link operations
  createLink(link: InsertLink): Promise<Link>;
  getLinksByUserId(userId: number): Promise<LinkWithTags[]>;
  getLinkById(id: number): Promise<LinkWithTags | undefined>;
  getLinksByPlatform(userId: number, platform: string): Promise<LinkWithTags[]>;
  getLinkCount(userId: number): Promise<number>;
  deleteLink(id: number, userId: number): Promise<void>;
  
  // Tag operations
  createTag(tag: InsertTag): Promise<Tag>;
  getTagsByLinkId(linkId: number): Promise<Tag[]>;
  deleteTag(id: number): Promise<void>;
  updateLinkCategory(linkId: number, category: string): Promise<void>;
}

// In-memory implementation for development/testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private links: Map<number, Link>;
  private tags: Map<number, Tag>;
  currentUserId: number;
  currentLinkId: number;
  currentTagId: number;

  constructor() {
    this.users = new Map();
    this.links = new Map();
    this.tags = new Map();
    this.currentUserId = 1;
    this.currentLinkId = 1;
    this.currentTagId = 1;
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
    const user: User = { ...insertUser, id, created_at, is_premium };
    this.users.set(id, user);
    return user;
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = this.currentLinkId++;
    const created_at = new Date();
    const link: Link = { ...insertLink, id, created_at };
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
}

// Database implementation using Supabase
export class DatabaseStorage implements IStorage {
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

  async createLink(insertLink: InsertLink): Promise<Link> {
    const [link] = await db.insert(links).values(insertLink).returning();
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
}

// Use memory storage for development, database for production
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
