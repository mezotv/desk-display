import type { DisplayLanguage } from "@/types/settings";

export const TWITTER_API_URL = "https://api.x.com/2";
export const TWITTER_POST_LIMIT = 5;
export const TWITTER_REFRESH_INTERVAL_MS = 2 * 60 * 60_000;
export const TWITTER_CACHE_TTL_MS = TWITTER_REFRESH_INTERVAL_MS;

export const TWITTER_COPY = {
  de: {
    addCredentials: "X-ZUGANGSDATEN HINZUFÜGEN",
    followers: "FOLLOWER",
    noPosts: "NOCH KEINE POSTS",
    post: "POST",
    posts: "POSTS",
  },
  en: {
    addCredentials: "ADD X CREDENTIALS",
    followers: "FOLLOWERS",
    noPosts: "NO POSTS YET",
    post: "POST",
    posts: "POSTS",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;
