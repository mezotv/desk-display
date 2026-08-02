import { PixelatedImage } from "@/components/pixelated-image";
import { TWITTER_COPY } from "@/constants/twitter";
import type { TwitterAppProps } from "@/types/twitter";
import { formatCompactNumber } from "@/utils/format-compact-number";

export function TwitterApp({
  language,
  postIndex,
  twitter,
}: TwitterAppProps) {
  const copy = TWITTER_COPY[language];
  const selectedPost = twitter.posts.length
    ? twitter.posts[postIndex % twitter.posts.length]
    : undefined;

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
    <div className="grid w-[min(88vw,1180px)] grid-cols-[clamp(150px,min(19vw,32vh),270px)_minmax(0,1fr)] items-center gap-[clamp(28px,4.5vw,68px)] text-left transition-transform duration-100 group-active:scale-[0.985] max-[620px]:w-[90vw] max-[620px]:grid-cols-1 max-[620px]:gap-4 max-[620px]:text-center">
      <aside className="flex min-w-0 flex-col items-center gap-3.5">
        <PixelatedImage
          alt=""
          className="size-[clamp(130px,min(17vw,28vh),230px)] object-cover max-[620px]:size-[clamp(92px,min(28vw,18vh),140px)]"
          src={twitter.profileImageUrl ?? "/logos/twitter.svg"}
        />
        <div className="min-w-0 max-w-full text-center">
          <strong className="block max-w-full overflow-hidden text-[clamp(24px,min(3vw,5vh),40px)] leading-none text-ellipsis whitespace-nowrap text-[#55acee] max-[620px]:text-[clamp(20px,6vw,28px)]">
            @{twitter.username}
          </strong>
          {twitter.followerCount !== null && (
            <span className="mt-2 block text-[clamp(18px,min(2.2vw,3.6vh),28px)] font-semibold text-[#7d7d89] max-[620px]:text-[17px]">
              {formatCompactNumber(twitter.followerCount)} {copy.followers}
            </span>
          )}
        </div>
      </aside>

      <article className="flex min-w-0 flex-col justify-center overflow-hidden max-[620px]:items-center">
        {selectedPost ? (
          <>
            <p className="m-0 max-h-[4.4em] overflow-hidden text-[clamp(30px,min(4.5vw,7.4vh),60px)] font-bold leading-[1.1] text-display-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] max-[620px]:max-h-[3.6em] max-[620px]:text-[clamp(24px,7vw,34px)] max-[620px]:[-webkit-line-clamp:3]">
              {selectedPost.text}
            </p>
            <div className="mt-[clamp(18px,4vh,34px)] flex flex-wrap items-center gap-x-[clamp(18px,3vw,42px)] gap-y-2 text-[clamp(18px,min(2.5vw,4vh),32px)] font-bold text-[#8b8b98] max-[620px]:justify-center max-[620px]:text-[clamp(16px,5vw,22px)]">
              <span aria-label={`${selectedPost.metrics.replyCount} replies`}>
                ◌ {formatCompactNumber(selectedPost.metrics.replyCount)}
              </span>
              <span aria-label={`${selectedPost.metrics.repostCount} reposts`}>
                ↻ {formatCompactNumber(selectedPost.metrics.repostCount)}
              </span>
              <span
                aria-label={`${selectedPost.metrics.likeCount} likes`}
                className="text-[#f43f5e]"
              >
                ♥ {formatCompactNumber(selectedPost.metrics.likeCount)}
              </span>
              <span aria-label={`${selectedPost.metrics.impressionCount} views`}>
                ◫ {formatCompactNumber(selectedPost.metrics.impressionCount)}
              </span>
            </div>
            <span className="mt-3 text-[clamp(16px,min(1.9vw,3.2vh),24px)] font-semibold tracking-[0.06em] text-[#555561]">
              {postIndex % twitter.posts.length + 1} / {twitter.posts.length}{" "}
              {twitter.posts.length === 1 ? copy.post : copy.posts}
            </span>
          </>
        ) : (
          <strong className="text-[clamp(34px,min(5vw,8vh),68px)] text-[#7d7d89]">
            {copy.noPosts}
          </strong>
        )}
      </article>
    </div>
  );
}
