import { TWITTER_ANALYTICS_DAY_COUNT } from "@/constants/twitter";
import type {
  TwitterAnalytics,
  TwitterAnalyticsPost,
  TwitterDailyImpressions,
  TwitterPostMetrics,
} from "@/types/twitter";

function getUtcDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function addMetrics(
  total: TwitterPostMetrics,
  metrics: TwitterPostMetrics,
): TwitterPostMetrics {
  return {
    bookmarkCount: total.bookmarkCount + metrics.bookmarkCount,
    impressionCount: total.impressionCount + metrics.impressionCount,
    likeCount: total.likeCount + metrics.likeCount,
    quoteCount: total.quoteCount + metrics.quoteCount,
    replyCount: total.replyCount + metrics.replyCount,
    repostCount: total.repostCount + metrics.repostCount,
  };
}

export function getTwitterAnalytics(
  posts: ReadonlyArray<TwitterAnalyticsPost>,
  now: number,
): TwitterAnalytics {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const firstDay =
    today.getTime() - (TWITTER_ANALYTICS_DAY_COUNT - 1) * 86_400_000;
  const impressionsByDate = new Map<string, TwitterDailyImpressions>();

  for (let dayIndex = 0; dayIndex < TWITTER_ANALYTICS_DAY_COUNT; dayIndex += 1) {
    const date = getUtcDateKey(firstDay + dayIndex * 86_400_000);
    impressionsByDate.set(date, { date, impressionCount: 0, postCount: 0 });
  }

  let totals: TwitterPostMetrics = {
    bookmarkCount: 0,
    impressionCount: 0,
    likeCount: 0,
    quoteCount: 0,
    replyCount: 0,
    repostCount: 0,
  };

  for (const post of posts) {
    totals = addMetrics(totals, post.metrics);

    if (!post.createdAt) continue;

    const timestamp = Date.parse(post.createdAt);
    if (Number.isNaN(timestamp)) continue;

    const date = getUtcDateKey(timestamp);
    const daily = impressionsByDate.get(date);

    if (daily) {
      impressionsByDate.set(date, {
        date,
        impressionCount: daily.impressionCount + post.metrics.impressionCount,
        postCount: daily.postCount + 1,
      });
    }
  }

  const engagementCount =
    totals.bookmarkCount +
    totals.likeCount +
    totals.quoteCount +
    totals.replyCount +
    totals.repostCount;

  return {
    ...totals,
    dailyImpressions: Array.from(impressionsByDate.values()),
    engagementCount,
    engagementRate:
      totals.impressionCount > 0
        ? (engagementCount / totals.impressionCount) * 100
        : 0,
    postCount: posts.length,
  };
}

export function getTwitterAnalyticsStartTime(now: number) {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  return new Date(
    today.getTime() - (TWITTER_ANALYTICS_DAY_COUNT - 1) * 86_400_000,
  ).toISOString();
}
