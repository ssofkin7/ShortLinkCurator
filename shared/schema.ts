import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  is_premium: boolean("is_premium").default(false).notNull(),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  platform: text("platform").notNull(), // "tiktok", "youtube", "instagram"
  thumbnail_url: text("thumbnail_url"),
  category: text("category").notNull(),
  duration: text("duration"),
  user_id: integer("user_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  link_id: integer("link_id").notNull().references(() => links.id),
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
  metadata: true,
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  link_id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type LinkWithTags = Link & { tags: Tag[] };
