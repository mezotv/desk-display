import type { DisplayLanguage } from "@/types/settings";

export type TwitterPostMetrics = {
  bookmarkCount: number;
  impressionCount: number;
  likeCount: number;
  quoteCount: number;
  replyCount: number;
  repostCount: number;
};

export type TwitterPost = {
  createdAt: string | null;
  id: string;
  metrics: TwitterPostMetrics;
  text: string;
};

export type TwitterSnapshot = {
  configured: boolean;
  error: string | null;
  followerCount: number | null;
  name: string | null;
  posts: TwitterPost[];
  profileImageUrl: string | null;
  updatedAt: string;
  username: string | null;
};

export type TwitterCacheEntry = {
  expiresAt: number;
  snapshot: TwitterSnapshot;
};

export type TwitterAppProps = {
  language: DisplayLanguage;
  postIndex: number;
  twitter: TwitterSnapshot;
};
