export type User = {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
};

export type Link = {
  id: number;
  url: string;
  title: string;
  platform: string;
  category: string;
  created_at: string;
  last_viewed?: string;
  view_count: number;
  thumbnail_url?: string;
  tags: Tag[];
};

export type Tag = {
  id: number;
  name: string;
  created_at: string;
  link_id: number;
};

export type CustomTab = {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  links: Link[];
};

export type ColorScheme = 'light' | 'dark' | 'system';

export type NotificationPreferences = {
  emailNotifications: boolean;
  newContentAlerts: boolean;
  weeklyDigest: boolean;
  platformUpdates: boolean;
};