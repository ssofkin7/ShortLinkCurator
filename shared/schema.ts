import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  notification_preferences: json("notification_preferences").$type<Record<string, boolean>>(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  is_premium: boolean("is_premium").default(false).notNull(),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  platform: text("platform").notNull(), // "tiktok", "youtube", "instagram", etc.
  thumbnail_url: text("thumbnail_url"),
  category: text("category").notNull(),
  duration: text("duration"),
  user_id: integer("user_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  last_viewed: timestamp("last_viewed").defaultNow(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  link_id: integer("link_id").notNull().references(() => links.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// New table for custom tabs
export const customTabs = pgTable("custom_tabs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").default("folder"),
  description: text("description"),
  user_id: integer("user_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Junction table for links and custom tabs (many-to-many)
export const linkTabs = pgTable("link_tabs", {
  id: serial("id").primaryKey(),
  link_id: integer("link_id").notNull().references(() => links.id),
  tab_id: integer("tab_id").notNull().references(() => customTabs.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertLinkSchema = createInsertSchema(links).pick({
  url: true,
  title: true,
  platform: true,
  thumbnail_url: true,
  category: true,
  duration: true,
  user_id: true,
  last_viewed: true,
  metadata: true,
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  link_id: true,
});

export const insertCustomTabSchema = createInsertSchema(customTabs).pick({
  name: true,
  icon: true,
  description: true,
  user_id: true,
});

export const insertLinkTabSchema = createInsertSchema(linkTabs).pick({
  link_id: true,
  tab_id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type InsertCustomTab = z.infer<typeof insertCustomTabSchema>;
export type CustomTab = typeof customTabs.$inferSelect;

export type InsertLinkTab = z.infer<typeof insertLinkTabSchema>;
export type LinkTab = typeof linkTabs.$inferSelect;

export type LinkWithTags = Link & { tags: Tag[] };
export type CustomTabWithLinks = CustomTab & { links: Link[] };
