import type { DisplayLanguage } from "@/types/settings";

export type TwitterPostMetrics = {
  bookmarkCount: number;
  impressionCount: number;
  likeCount: number;
  quoteCount: number;
  replyCount: number;
  repostCount: number;
};

export type TwitterAnalyticsPost = {
  createdAt: string | null;
  metrics: TwitterPostMetrics;
};

export type TwitterDailyImpressions = {
  date: string;
  impressionCount: number;
  postCount: number;
};

export type TwitterAnalytics = TwitterPostMetrics & {
  dailyImpressions: TwitterDailyImpressions[];
  engagementCount: number;
  engagementRate: number;
  postCount: number;
};

export type TwitterSnapshot = {
  configured: boolean;
  error: string | null;
  followerCount: number | null;
  name: string | null;
  analytics: TwitterAnalytics;
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
  slideIndex: number;
  twitter: TwitterSnapshot;
};

export type TwitterImpressionsChartProps = {
  dailyImpressions: TwitterDailyImpressions[];
};
