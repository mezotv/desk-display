import { Schema } from "effect";

const twitterUserMetricsSchema = Schema.Struct({
  followers_count: Schema.optionalKey(Schema.Number),
});

const twitterPostMetricsSchema = Schema.Struct({
  bookmark_count: Schema.optionalKey(Schema.Number),
  impression_count: Schema.optionalKey(Schema.Number),
  like_count: Schema.optionalKey(Schema.Number),
  quote_count: Schema.optionalKey(Schema.Number),
  reply_count: Schema.optionalKey(Schema.Number),
  retweet_count: Schema.optionalKey(Schema.Number),
});

export const twitterUserResponseSchema = Schema.Struct({
  data: Schema.optionalKey(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      profile_image_url: Schema.optionalKey(Schema.String),
      public_metrics: Schema.optionalKey(twitterUserMetricsSchema),
      username: Schema.String,
    }),
  ),
});

export const twitterPostsResponseSchema = Schema.Struct({
  data: Schema.optionalKey(
    Schema.Array(
      Schema.Struct({
        created_at: Schema.optionalKey(Schema.String),
        id: Schema.String,
        public_metrics: Schema.optionalKey(twitterPostMetricsSchema),
        text: Schema.String,
      }),
    ),
  ),
});
