import { PixelatedImage } from "@/components/pixelated-image";
import { TwitterImpressionsChart } from "@/components/twitter-impressions-chart";
import { TWITTER_ANALYTICS_SLIDE_COUNT, TWITTER_COPY } from "@/constants/twitter";
import type { TwitterAppProps } from "@/types/twitter";
import { formatCompactNumber } from "@/utils/format-compact-number";

export function TwitterApp({
  language,
  slideIndex,
  twitter,
}: TwitterAppProps) {
  const copy = TWITTER_COPY[language];
  const activeSlide = slideIndex % TWITTER_ANALYTICS_SLIDE_COUNT;
  const analytics = twitter.analytics;
  const engagementMetrics = [
    { label: copy.likes, value: analytics.likeCount },
    {
      label: copy.reposts,
      value: analytics.repostCount + analytics.quoteCount,
    },
    { label: copy.replies, value: analytics.replyCount },
    { label: copy.bookmarks, value: analytics.bookmarkCount },
  ];

  if (!twitter.configured) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 text-center">
        <PixelatedImage
          alt="X"
          className="size-[clamp(150px,min(21vw,35vh),280px)] object-contain"
          src="/logos/twitter.svg"
        />
        <strong className="text-[clamp(30px,min(4vw,6.5vh),54px)] text-[#55acee]">
          {copy.addCredentials}
        </strong>
      </div>
    );
  }

  return (
    <div className="flex w-[min(90vw,1320px)] flex-col items-center justify-center gap-[clamp(20px,4vh,42px)] text-center transition-transform duration-100 group-active:scale-[0.985]">
      <header className="flex w-full items-center justify-center gap-[clamp(12px,2vw,24px)]">
        <PixelatedImage
          alt=""
          className="size-[clamp(60px,min(8vw,13vh),110px)] shrink-0 object-cover"
          src={twitter.profileImageUrl ?? "/logos/twitter.svg"}
        />
        <div className="min-w-0 text-left">
          <strong className="block max-w-[min(62vw,760px)] overflow-hidden text-[clamp(24px,min(3vw,5vh),42px)] leading-none text-ellipsis whitespace-nowrap text-[#55acee]">
            @{twitter.username}
          </strong>
          <span className="mt-2 block text-[clamp(14px,min(1.6vw,2.6vh),22px)] font-bold tracking-[0.12em] text-[#555561]">
            {activeSlide + 1} / {TWITTER_ANALYTICS_SLIDE_COUNT}
          </span>
        </div>
      </header>

      {activeSlide === 0 && (
        <section>
          <strong className="block text-[clamp(100px,min(20vw,34vh),290px)] font-extrabold leading-[0.78] tracking-[-0.08em] text-slate-50">
            {formatCompactNumber(twitter.followerCount ?? 0)}
          </strong>
          <span className="mt-[clamp(20px,4vh,34px)] block text-[clamp(24px,min(3.5vw,5.8vh),48px)] font-bold tracking-[0.08em] text-[#55acee]">
            {copy.followers}
          </span>
        </section>
      )}

      {activeSlide === 1 && (
        <section>
          <strong className="block text-[clamp(86px,min(18vw,30vh),250px)] font-extrabold leading-[0.8] tracking-[-0.08em] text-slate-50">
            {formatCompactNumber(analytics.impressionCount)}
          </strong>
          <span className="mt-[clamp(20px,4vh,34px)] block text-[clamp(20px,min(3vw,5vh),42px)] font-bold tracking-[0.05em] text-[#55acee]">
            {copy.impressions}
          </span>
          <span className="mt-3 block text-[clamp(16px,min(2vw,3.3vh),26px)] font-semibold text-[#666672]">
            {analytics.postCount} {copy.posts}
          </span>
        </section>
      )}

      {activeSlide === 2 && (
        <section className="w-full">
          <strong className="block text-[clamp(78px,min(15vw,26vh),210px)] font-extrabold leading-[0.8] tracking-[-0.07em] text-slate-50">
            {analytics.engagementRate.toFixed(1)}%
          </strong>
          <span className="mt-[clamp(18px,3vh,28px)] block text-[clamp(22px,min(3vw,5vh),42px)] font-bold tracking-[0.06em] text-[#55acee]">
            {copy.engagementRate}
          </span>
          <div className="mx-auto mt-[clamp(20px,4vh,38px)] grid max-w-[920px] grid-cols-4 gap-[clamp(10px,2vw,28px)] max-[620px]:grid-cols-2">
            {engagementMetrics.map(({ label, value }) => (
              <span className="flex flex-col" key={label}>
                <strong className="text-[clamp(26px,min(3.5vw,5.8vh),48px)] text-slate-100">
                  {formatCompactNumber(value)}
                </strong>
                <span className="text-[clamp(12px,min(1.5vw,2.5vh),20px)] font-bold tracking-[0.08em] text-[#666672]">
                  {label}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {activeSlide === 3 && (
        <section className="w-full max-w-[1180px]">
          <div className="mb-[clamp(16px,3vh,28px)] flex items-end justify-between gap-4 text-left">
            <div>
              <strong className="block text-[clamp(34px,min(5vw,8vh),68px)] leading-none text-slate-50">
                {formatCompactNumber(analytics.impressionCount)}
              </strong>
              <span className="mt-2 block text-[clamp(14px,min(1.7vw,2.8vh),22px)] font-bold tracking-[0.08em] text-[#55acee]">
                {copy.impressions}
              </span>
              <span className="mt-1 block text-[clamp(11px,min(1.3vw,2.1vh),17px)] font-bold tracking-[0.08em] text-[#555561]">
                {copy.byPublishDate}
              </span>
            </div>
            <span className="text-[clamp(14px,min(1.7vw,2.8vh),22px)] font-semibold text-[#666672]">
              {analytics.postCount} {copy.posts}
            </span>
          </div>
          {analytics.postCount > 0 ? (
            <>
              <TwitterImpressionsChart
                dailyImpressions={analytics.dailyImpressions}
              />
              <div className="mt-3 flex justify-between text-[clamp(12px,min(1.5vw,2.5vh),18px)] font-bold tracking-[0.08em] text-[#555561]">
                <span>{copy.windowStart}</span>
                <span>{copy.today}</span>
              </div>
            </>
          ) : (
            <strong className="block py-16 text-[clamp(28px,min(4vw,6.5vh),52px)] text-[#7d7d89]">
              {copy.noPosts}
            </strong>
          )}
        </section>
      )}
    </div>
  );
}
