import "@tanstack/react-start/server-only";

import { Clock, DateTime, Effect, Option, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import {
  TWITTER_API_URL,
  TWITTER_CACHE_TTL_MS,
  TWITTER_POST_LIMIT,
} from "@/constants/twitter";
import { decodeTwitterEnvironment } from "@/schemas/environment";
import { ExternalServiceError } from "@/schemas/service-error";
import {
  twitterPostsResponseSchema,
  twitterUserResponseSchema,
} from "@/schemas/twitter";
import { serverRuntime } from "@/runtime/server-runtime";
import type {
  TwitterAnalyticsPost,
  TwitterCacheEntry,
  TwitterSnapshot,
} from "@/types/twitter";
import {
  getTwitterAnalytics,
  getTwitterAnalyticsStartTime,
} from "@/utils/get-twitter-analytics";
import { requestExternalJson } from "@/utils/request-external-api.server";

let twitterCache: TwitterCacheEntry | null = null;

function emptyTwitterSnapshot(
  configured: boolean,
  username: string | null,
  error: string | null = null,
): TwitterSnapshot {
  return {
    configured,
    error,
    followerCount: null,
    name: null,
    analytics: getTwitterAnalytics([], Date.now()),
    profileImageUrl: null,
    updatedAt: new Date().toISOString(),
    username,
  };
}

function getTwitterEnvironment() {
  return decodeTwitterEnvironment({
    X_BEARER_TOKEN: process.env.X_BEARER_TOKEN,
    X_USERNAME: process.env.X_USERNAME,
  });
}

const getTwitterSnapshotEffect = Effect.fn("Twitter.getSnapshot")(
  function*() {
    const environment = getTwitterEnvironment();

    if (Option.isNone(environment)) {
      return emptyTwitterSnapshot(false, null);
    }

    const now = yield* Clock.currentTimeMillis;

    if (twitterCache && now < twitterCache.expiresAt) {
      return twitterCache.snapshot;
    }

    const { X_BEARER_TOKEN: bearerToken, X_USERNAME: username } =
      environment.value;
    const userUrl = new URL(
      `${TWITTER_API_URL}/users/by/username/${encodeURIComponent(username)}`,
    );
    userUrl.searchParams.set(
      "user.fields",
      "name,profile_image_url,public_metrics,username",
    );
    const userRequest = HttpClientRequest.get(userUrl).pipe(
      HttpClientRequest.setHeader("authorization", `Bearer ${bearerToken}`),
      HttpClientRequest.acceptJson,
    );
    const userPayload = yield* requestExternalJson(
      "X",
      "profile lookup",
      userRequest,
    ).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(twitterUserResponseSchema)),
      Effect.mapError((cause) =>
        cause instanceof ExternalServiceError
          ? cause
          : new ExternalServiceError({
              cause,
              message: "X returned invalid profile data",
              operation: "decode profile",
              service: "X",
            }),
      ),
    );
    const user = userPayload.data;

    if (!user) {
      return yield* new ExternalServiceError({
        cause: new Error(`X user @${username} was not found`),
        message: "X response did not contain a user",
        operation: "profile lookup",
        service: "X",
      });
    }

    const postsUrl = new URL(`${TWITTER_API_URL}/users/${user.id}/tweets`);
    postsUrl.searchParams.set("exclude", "replies,retweets");
    postsUrl.searchParams.set("max_results", String(TWITTER_POST_LIMIT));
    postsUrl.searchParams.set("start_time", getTwitterAnalyticsStartTime(now));
    postsUrl.searchParams.set("tweet.fields", "created_at,public_metrics");
    const postsRequest = HttpClientRequest.get(postsUrl).pipe(
      HttpClientRequest.setHeader("authorization", `Bearer ${bearerToken}`),
      HttpClientRequest.acceptJson,
    );
    const postsPayload = yield* requestExternalJson(
      "X",
      "recent posts",
      postsRequest,
    ).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(twitterPostsResponseSchema)),
      Effect.mapError((cause) =>
        cause instanceof ExternalServiceError
          ? cause
          : new ExternalServiceError({
              cause,
              message: "X returned invalid post data",
              operation: "decode recent posts",
              service: "X",
            }),
      ),
    );
    const posts = (postsPayload.data ?? []).map(
      (post): TwitterAnalyticsPost => ({
        createdAt: post.created_at ?? null,
        metrics: {
          bookmarkCount: post.public_metrics?.bookmark_count ?? 0,
          impressionCount: post.public_metrics?.impression_count ?? 0,
          likeCount: post.public_metrics?.like_count ?? 0,
          quoteCount: post.public_metrics?.quote_count ?? 0,
          replyCount: post.public_metrics?.reply_count ?? 0,
          repostCount: post.public_metrics?.retweet_count ?? 0,
        },
      }),
    );
    const snapshot = {
      analytics: getTwitterAnalytics(posts, now),
      configured: true,
      error: null,
      followerCount: user.public_metrics?.followers_count ?? null,
      name: user.name,
      profileImageUrl:
        user.profile_image_url?.replace("_normal.", "_400x400.") ?? null,
      updatedAt: DateTime.formatIso(yield* DateTime.now),
      username: user.username,
    } satisfies TwitterSnapshot;

    twitterCache = {
      expiresAt: now + TWITTER_CACHE_TTL_MS,
      snapshot,
    };

    return snapshot;
  },
);

export function getTwitterSnapshot(): Promise<TwitterSnapshot> {
  const environment = getTwitterEnvironment();
  const configured = Option.isSome(environment);
  const username = configured ? environment.value.X_USERNAME : null;

  return serverRuntime.runPromise(
    getTwitterSnapshotEffect().pipe(
      Effect.tapError(Effect.logError),
      Effect.catch(() =>
        Effect.gen(function*() {
          const snapshot = twitterCache?.snapshot
            ? { ...twitterCache.snapshot, error: "Unable to update X" }
            : emptyTwitterSnapshot(configured, username, "Unable to update X");
          twitterCache = {
            expiresAt:
              (yield* Clock.currentTimeMillis) + TWITTER_CACHE_TTL_MS,
            snapshot,
          };
          return snapshot;
        }),
      ),
    ),
  );
}
