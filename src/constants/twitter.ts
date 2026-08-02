import type { DisplayLanguage } from "@/types/settings";

export const TWITTER_API_URL = "https://api.x.com/2";
export const TWITTER_ANALYTICS_DAY_COUNT = 30;
export const TWITTER_ANALYTICS_SLIDE_COUNT = 4;
export const TWITTER_POST_LIMIT = 100;
export const TWITTER_REFRESH_INTERVAL_MS = 6 * 60 * 60_000;
export const TWITTER_CACHE_TTL_MS = TWITTER_REFRESH_INTERVAL_MS;

export const TWITTER_COPY = {
  de: {
    addCredentials: "X-ZUGANGSDATEN HINZUFÜGEN",
    bookmarks: "LESEZEICHEN",
    byPublishDate: "NACH VERÖFFENTLICHUNGSTAG",
    engagementRate: "ÖFFENTLICHE INTERAKTIONSRATE",
    followers: "FOLLOWER",
    impressions: "30-TAGE-POST-IMPRESSIONEN",
    likes: "LIKES",
    noPosts: "KEINE POSTS IN DEN LETZTEN 30 TAGEN",
    posts: "POSTS",
    replies: "ANTWORTEN",
    reposts: "REPOSTS",
    today: "HEUTE",
    windowStart: "VOR 30 TAGEN",
  },
  en: {
    addCredentials: "ADD X CREDENTIALS",
    bookmarks: "BOOKMARKS",
    byPublishDate: "BY PUBLISH DATE",
    engagementRate: "PUBLIC ENGAGEMENT RATE",
    followers: "FOLLOWERS",
    impressions: "30-DAY POST IMPRESSIONS",
    likes: "LIKES",
    noPosts: "NO POSTS IN THE LAST 30 DAYS",
    posts: "POSTS",
    replies: "REPLIES",
    reposts: "REPOSTS",
    today: "TODAY",
    windowStart: "30 DAYS AGO",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;
