import { memo } from "react";

import { CalendarApp } from "@/components/calendar-app";
import { DaylightApp } from "@/components/daylight-app";
import { MarqueeCard } from "@/components/marquee-card";
import { MoonApp } from "@/components/moon-app";
import { OverflowMarquee } from "@/components/overflow-marquee";
import { PixelatedImage } from "@/components/pixelated-image";
import { ProgressApp } from "@/components/progress-app";
import { SystemApp } from "@/components/system-app";
import { TwitterApp } from "@/components/twitter-app";
import { WorldClockApp } from "@/components/world-clock-app";
import { CALENDAR_COPY } from "@/constants/calendar";
import { AMBIENT_COPY } from "@/constants/ambient";
import { PRODUCTIVITY_COPY } from "@/constants/productivity";
import { SPOTIFY_COPY } from "@/constants/spotify";
import { SYSTEM_COPY } from "@/constants/system";
import { TWITTER_COPY } from "@/constants/twitter";
import type { ActiveAppProps } from "@/types/apps";
import { areActiveAppPropsEqual } from "@/utils/are-active-app-props-equal";
import { formatClockDate, formatClockTime } from "@/utils/format-clock";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { formatCurrency } from "@/utils/format-currency";
import { formatDuration } from "@/utils/format-duration";
import { formatPlaybackTime } from "@/utils/format-playback-time";
import { getDaylightProgress } from "@/utils/get-daylight-progress";
import { getMoonPhase } from "@/utils/get-moon-phase";
import { getTimeProgress } from "@/utils/get-time-progress";

function ActiveAppView({
  activeApp,
  calendar,
  isAnnual,
  language,
  mrr,
  now,
  onTap,
  productivity,
  spotify,
  system,
  twitter,
  twitterSlideIndex,
  weather,
  weatherIcon,
}: ActiveAppProps) {
  const formattedRevenue = formatCurrency(
    mrr.amountMinor * (isAnnual ? 12 : 1),
    mrr.currency,
  );
  const formattedMrr = formatCurrency(mrr.amountMinor, mrr.currency);
  const storedSpotifyProgress = spotify.progressMs ?? 0;
  const spotifyUpdatedAt = Date.parse(spotify.updatedAt);
  const spotifyElapsed =
    spotify.isPlaying && !Number.isNaN(spotifyUpdatedAt)
      ? Math.max(0, now.getTime() - spotifyUpdatedAt)
      : 0;
  const spotifyProgressMs = Math.min(
    storedSpotifyProgress + spotifyElapsed,
    spotify.durationMs ?? Number.POSITIVE_INFINITY,
  );
  const spotifyProgressPercent = spotify.durationMs
    ? Math.min(100, (spotifyProgressMs / spotify.durationMs) * 100)
    : 0;
  const spotifyCopy = SPOTIFY_COPY[language];
  const calendarCopy = CALENDAR_COPY[language];
  const ambientCopy = AMBIENT_COPY[language];
  const productivityCopy = PRODUCTIVITY_COPY[language];
  const systemCopy = SYSTEM_COPY[language];
  const twitterCopy = TWITTER_COPY[language];
  const marqueeCalendarEvent = calendar.configured
    ? calendar.events[0]
    : undefined;
  const showMarqueeSpotify = spotify.configured && Boolean(spotify.track);
  const showMarqueeWeather = weather.temperatureCelsius !== null;
  const showMarqueeTwitter =
    twitter.configured && twitter.followerCount !== null;
  const daylight = getDaylightProgress(now, weather.sunrise, weather.sunset);
  const moon = getMoonPhase(now);
  const yearProgress = getTimeProgress(now).find(
    (metric) => metric.id === "year",
  );
  const timerRemainingMs =
    productivity.timer.running && productivity.timer.endsAt
      ? Math.max(0, Date.parse(productivity.timer.endsAt) - now.getTime())
      : 0;
  const stopwatchElapsedMs =
    productivity.stopwatch.running && productivity.stopwatch.startedAt
      ? productivity.stopwatch.elapsedMs +
        Math.max(0, now.getTime() - Date.parse(productivity.stopwatch.startedAt))
      : productivity.stopwatch.elapsedMs;
  const marqueeCardCount =
    5 +
    Number(showMarqueeWeather) +
    Number(Boolean(marqueeCalendarEvent)) +
    Number(showMarqueeSpotify) +
    Number(showMarqueeTwitter) +
    Number(Boolean(daylight)) +
    Number(productivity.timer.running) +
    Number(productivity.stopwatch.running);

  return (
    <main className="relative grid h-dvh min-h-0 w-full overflow-hidden bg-display-bg">
      <button
        aria-label={`${activeApp} app. Double tap to open the app launcher.`}
        className="group grid h-full w-full min-w-0 touch-manipulation cursor-pointer place-items-center overflow-hidden border-0 bg-display-bg p-0 text-inherit outline-none [-webkit-tap-highlight-color:transparent] focus-visible:shadow-[inset_0_0_0_3px_rgba(175,92,246,0.82)]"
        onClick={onTap}
        type="button"
      >
        {activeApp === "stripe" && (
          <div className="inline-flex max-w-full items-center justify-center gap-[clamp(20px,min(3.5vw,6vh),54px)] p-[clamp(20px,min(3.5vw,6vh),54px)] transition-transform duration-100 group-active:scale-[0.985] max-[620px]:w-full max-[620px]:gap-[clamp(10px,3vw,18px)] max-[620px]:px-3">
            <PixelatedImage
              className="block size-[clamp(62px,min(9vw,16vh),150px)] shrink-0 object-contain max-[620px]:size-[clamp(44px,14vw,60px)]"
              src="/logos/stripe-icon-logo.svg?v=5"
              alt="Stripe"
            />
            <span
              className="block whitespace-nowrap text-[clamp(64px,min(14vw,24vh),220px)] font-extrabold leading-[0.9] tracking-[-0.07em] text-brand-purple max-[620px]:min-w-0 max-[620px]:overflow-hidden max-[620px]:text-[clamp(38px,12vw,64px)] max-[620px]:tracking-[-0.08em]"
              aria-live="polite"
            >
              {formattedRevenue}
            </span>
          </div>
        )}

        {activeApp === "weather" && (
          <div className="flex items-center justify-center gap-[clamp(38px,min(5.75vw,9vh),86px)] transition-transform duration-100 group-active:scale-[0.985] [@media(max-height:410px)]:flex-row max-[620px]:flex-col max-[620px]:gap-[clamp(18px,4vh,34px)]">
            <PixelatedImage
              className="size-[clamp(145px,min(22vw,38vh),320px)] object-contain [@media(max-height:410px)]:size-[clamp(112px,35vh,145px)] max-[620px]:size-[clamp(120px,min(42vw,28vh),190px)]"
              src={weatherIcon}
              alt=""
            />
            <div className="flex flex-col items-start max-[620px]:items-center max-[620px]:text-center">
              <span className="text-[clamp(104px,min(15.75vw,26.25vh),230px)] font-extrabold leading-[0.78] tracking-[-0.09em] text-slate-50 max-[620px]:text-[clamp(82px,min(28vw,19vh),128px)]">
                {weather.temperatureCelsius === null
                  ? "--°"
                  : `${Math.round(weather.temperatureCelsius)}°`}
              </span>
              <span className="mt-[clamp(18px,5vh,40px)] text-[clamp(26px,min(3.5vw,5.8vh),46px)] font-bold tracking-[0.08em] text-blue-400 max-[620px]:mt-[18px] max-[620px]:text-[clamp(22px,7vw,30px)]">
                {weather.description}
              </span>
              <span className="mt-1 text-[clamp(20px,min(2.75vw,4.6vh),34px)] font-semibold tracking-[0.08em] text-[#8b8b98] max-[620px]:max-w-[86vw] max-[620px]:overflow-hidden max-[620px]:text-[clamp(18px,5.5vw,24px)] max-[620px]:text-ellipsis max-[620px]:whitespace-nowrap">
                {weather.location}
              </span>
            </div>
          </div>
        )}

        {activeApp === "spotify" && (
          <div className="grid w-[min(82vw,1180px)] grid-cols-[clamp(196px,min(24.5vw,41vh),360px)_minmax(0,1fr)] place-items-center gap-[clamp(34px,min(4.25vw,7vh),64px)] transition-transform duration-100 group-active:scale-[0.985] max-[620px]:w-[min(86vw,440px)] max-[620px]:grid-cols-1 max-[620px]:gap-[clamp(18px,4vh,30px)]">
            {spotify.albumArtUrl ? (
              <PixelatedImage
                className="size-[clamp(196px,min(24.5vw,41vh),360px)] shrink-0 object-cover max-[620px]:size-[clamp(138px,min(46vw,28vh),210px)]"
                src={spotify.albumArtUrl}
                alt={spotifyCopy.albumArtwork}
              />
            ) : (
              <PixelatedImage
                className="size-[clamp(196px,min(24.5vw,41vh),360px)] shrink-0 object-contain max-[620px]:size-[clamp(138px,min(46vw,28vh),210px)]"
                src="/logos/spotify.svg"
                alt="Spotify"
              />
            )}
            <div className="flex w-full min-w-0 flex-col items-center overflow-hidden text-center">
              <span className="w-full self-start text-left text-[clamp(22px,min(2.75vw,4.6vh),34px)] font-bold tracking-[0.08em] text-[#1ed760] max-[620px]:text-[clamp(18px,5.5vw,24px)]">
                {!spotify.configured
                  ? spotify.clientConfigured
                    ? spotifyCopy.tapToConnect
                    : spotifyCopy.connect
                  : spotify.track
                    ? spotify.isPlaying
                      ? spotifyCopy.nowPlaying
                      : spotifyCopy.paused
                    : spotifyCopy.notPlaying}
              </span>
              <OverflowMarquee className="mt-3 block w-full max-w-full text-[clamp(40px,min(5vw,8.3vh),68px)] font-extrabold leading-[1.05] text-display-text max-[620px]:text-[clamp(29px,9vw,42px)]">
                {spotify.track ??
                  (spotify.configured
                    ? spotifyCopy.playSomething
                    : spotify.clientConfigured
                      ? spotifyCopy.authorize
                      : spotifyCopy.addKeys)}
              </OverflowMarquee>
              {spotify.artist && (
                <OverflowMarquee className="mt-2.5 block w-full max-w-full text-[clamp(24px,min(3vw,5vh),40px)] font-semibold text-[#8b8b98] max-[620px]:text-[clamp(20px,6vw,28px)]">
                  {spotify.artist}
                </OverflowMarquee>
              )}
              {spotify.durationMs !== null && (
                <div className="mt-[18px] flex w-full max-w-full flex-col">
                  <span
                    className="block h-[5px] w-full overflow-hidden rounded-full bg-[#303039]"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-[inherit] bg-[#1ed760] transition-[width] duration-[250ms] ease-linear"
                      style={{ width: `${spotifyProgressPercent}%` }}
                    />
                  </span>
                  <span className="mt-[7px] flex justify-between text-[clamp(16px,min(2vw,3.3vh),24px)] font-semibold tracking-[0.03em] text-[#777782]">
                    <span>{formatPlaybackTime(spotifyProgressMs)}</span>
                    <span>{formatPlaybackTime(spotify.durationMs)}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeApp === "calendar" && (
          <CalendarApp calendar={calendar} language={language} now={now} />
        )}

        {activeApp === "twitter" && (
          <TwitterApp
            language={language}
            slideIndex={twitterSlideIndex}
            twitter={twitter}
          />
        )}

        {activeApp === "clock" && (
          <div className="flex flex-col items-center justify-center transition-transform duration-100 group-active:scale-[0.985]">
            <time className="whitespace-nowrap text-[clamp(94px,min(16.5vw,28vh),240px)] font-extrabold leading-[0.82] tracking-[-0.07em] text-slate-50">
              {formatClockTime(now, language, true)}
            </time>
            <time className="mt-[clamp(24px,6.5vh,52px)] text-[clamp(22px,min(3vw,5vh),38px)] font-semibold tracking-[0.04em] text-brand-purple uppercase">
              {formatClockDate(now, language)}
            </time>
          </div>
        )}

        {activeApp === "system" && (
          <SystemApp language={language} system={system} />
        )}

        {activeApp === "world" && (
          <WorldClockApp language={language} now={now} />
        )}

        {activeApp === "daylight" && (
          <DaylightApp language={language} now={now} weather={weather} />
        )}

        {activeApp === "moon" && <MoonApp language={language} now={now} />}

        {activeApp === "progress" && (
          <ProgressApp language={language} now={now} />
        )}

        {activeApp === "marquee" && (
          <div className="h-dvh w-full overflow-hidden">
            <div
              className="flex h-full w-max animate-[marquee-scroll_linear_infinite] will-change-transform"
              style={{ animationDuration: `${marqueeCardCount * 7}s` }}
            >
              {[0, 1].map((copy) => (
                <div
                  className="flex h-full"
                  key={copy}
                  aria-hidden={copy === 1}
                >
                  <section className="flex h-dvh w-screen shrink-0 items-center justify-center gap-[clamp(24px,5vw,42px)] bg-display-bg p-[clamp(20px,4vw,36px)] max-[620px]:flex-col max-[620px]:gap-[clamp(18px,4vh,30px)] max-[620px]:p-5">
                    <PixelatedImage
                      alt=""
                      className="size-[clamp(110px,min(18vw,31vh),260px)] shrink-0 object-contain max-[620px]:size-[clamp(108px,min(38vw,25vh),180px)]"
                      src="/logos/stripe-icon-logo.svg"
                    />
                    <div className="flex min-w-0 max-w-[min(58vw,760px)] flex-auto flex-col items-center justify-center gap-3.5 text-center max-[620px]:max-w-[88vw] max-[620px]:flex-[0_1_auto]">
                      <strong className="block w-full overflow-hidden text-center text-[clamp(52px,min(9vw,15vh),120px)] font-extrabold leading-none text-ellipsis whitespace-nowrap text-brand-purple max-[620px]:text-[clamp(44px,14vw,72px)]">
                        {formattedMrr}
                      </strong>
                    </div>
                  </section>
                  {weather.temperatureCelsius !== null && (
                    <section className="flex h-dvh w-screen shrink-0 items-center justify-center gap-[clamp(24px,5vw,42px)] bg-display-bg p-[clamp(20px,4vw,36px)] max-[620px]:flex-col max-[620px]:gap-[clamp(18px,4vh,30px)] max-[620px]:p-5">
                      <PixelatedImage
                        alt=""
                        className="size-[clamp(110px,min(18vw,31vh),260px)] shrink-0 object-contain max-[620px]:size-[clamp(108px,min(38vw,25vh),180px)]"
                        src={weatherIcon}
                      />
                      <div className="flex min-w-0 max-w-[min(58vw,760px)] flex-auto flex-col items-center justify-center gap-3.5 text-center max-[620px]:max-w-[88vw] max-[620px]:flex-[0_1_auto]">
                        <strong className="block w-full overflow-hidden text-center text-[clamp(52px,min(9vw,15vh),120px)] font-extrabold leading-none text-ellipsis whitespace-nowrap text-blue-400 max-[620px]:text-[clamp(44px,14vw,72px)]">
                          {`${Math.round(weather.temperatureCelsius)}°`}
                        </strong>
                        <span className="block w-full overflow-hidden text-center text-[clamp(19px,min(3vw,5vh),40px)] font-semibold leading-[1.15] text-ellipsis whitespace-nowrap text-[#7d7d89]">
                          {weather.location}
                        </span>
                      </div>
                    </section>
                  )}
                  <section className="flex h-dvh w-screen shrink-0 items-center justify-center gap-[clamp(24px,5vw,42px)] bg-display-bg p-[clamp(20px,4vw,36px)] max-[620px]:flex-col max-[620px]:gap-[clamp(18px,4vh,30px)] max-[620px]:p-5">
                    <PixelatedImage
                      alt=""
                      className="size-[clamp(110px,min(18vw,31vh),260px)] shrink-0 object-contain max-[620px]:size-[clamp(108px,min(38vw,25vh),180px)]"
                      src="/logos/clock-pixel.svg"
                    />
                    <div className="flex min-w-0 max-w-[min(58vw,760px)] flex-auto flex-col items-center justify-center gap-3.5 text-center max-[620px]:max-w-[88vw] max-[620px]:flex-[0_1_auto]">
                      <strong className="block w-full overflow-hidden text-center text-[clamp(52px,min(9vw,15vh),120px)] font-extrabold leading-none text-ellipsis whitespace-nowrap text-slate-50 tabular-nums max-[620px]:text-[clamp(44px,14vw,72px)]">
                        {formatClockTime(now, language)}
                      </strong>
                      <span className="block w-full overflow-hidden text-center text-[clamp(19px,min(3vw,5vh),40px)] font-semibold leading-[1.15] text-ellipsis whitespace-nowrap text-[#a3a3ad]">
                        {formatClockDate(now, language)}
                      </span>
                    </div>
                  </section>
                  {marqueeCalendarEvent && (
                    <section className="flex h-dvh w-screen shrink-0 items-center justify-center gap-[clamp(24px,5vw,42px)] bg-display-bg p-[clamp(20px,4vw,36px)] max-[620px]:flex-col max-[620px]:gap-[clamp(18px,4vh,30px)] max-[620px]:p-5">
                      <PixelatedImage
                        alt=""
                        className="size-[clamp(110px,min(18vw,31vh),260px)] shrink-0 object-contain max-[620px]:size-[clamp(108px,min(38vw,25vh),180px)]"
                        src="/logos/google-calendar.svg"
                      />
                      <div className="flex min-w-0 max-w-[min(58vw,760px)] flex-auto flex-col items-center justify-center gap-3.5 text-center max-[620px]:max-w-[88vw] max-[620px]:flex-[0_1_auto]">
                        <strong className="block w-full overflow-hidden text-center text-[clamp(34px,min(6vw,10vh),80px)] font-extrabold leading-none text-ellipsis whitespace-nowrap text-[#4285f4] max-[620px]:text-[clamp(30px,9.5vw,48px)]">
                          {marqueeCalendarEvent.title ?? calendarCopy.untitled}
                        </strong>
                        <span className="block w-full overflow-hidden text-center text-[clamp(19px,min(3vw,5vh),40px)] font-semibold leading-[1.15] text-ellipsis whitespace-nowrap text-[#7d7d89]">
                          {marqueeCalendarEvent.allDay
                            ? calendarCopy.allDay
                            : formatClockTime(
                                new Date(marqueeCalendarEvent.start),
                                language,
                              )}
                        </span>
                      </div>
                    </section>
                  )}
                  {showMarqueeSpotify && (
                    <section className="flex h-dvh w-screen shrink-0 items-center justify-center gap-[clamp(24px,5vw,42px)] bg-display-bg p-[clamp(20px,4vw,36px)] max-[620px]:flex-col max-[620px]:gap-[clamp(18px,4vh,30px)] max-[620px]:p-5">
                      {spotify.albumArtUrl ? (
                        <PixelatedImage
                          alt=""
                          className="size-[clamp(110px,min(18vw,31vh),260px)] shrink-0 object-contain max-[620px]:size-[clamp(108px,min(38vw,25vh),180px)]"
                          src={spotify.albumArtUrl}
                        />
                      ) : (
                        <PixelatedImage
                          alt=""
                          className="size-[clamp(110px,min(18vw,31vh),260px)] shrink-0 object-contain max-[620px]:size-[clamp(108px,min(38vw,25vh),180px)]"
                          src="/logos/spotify.svg"
                        />
                      )}
                      <div className="flex min-w-0 max-w-[min(58vw,760px)] flex-auto flex-col items-center justify-center gap-3.5 text-center max-[620px]:max-w-[88vw] max-[620px]:flex-[0_1_auto]">
                        <strong className="block w-full overflow-hidden text-center text-[clamp(34px,min(6vw,10vh),80px)] font-extrabold leading-none text-ellipsis whitespace-nowrap text-[#1ed760] max-[620px]:text-[clamp(30px,9.5vw,48px)]">
                          {spotify.track}
                        </strong>
                        {spotify.artist && (
                          <span className="block w-full overflow-hidden text-center text-[clamp(19px,min(3vw,5vh),40px)] font-semibold leading-[1.15] text-ellipsis whitespace-nowrap text-[#7d7d89]">
                            {spotify.artist}
                          </span>
                        )}
                      </div>
                    </section>
                  )}
                  {showMarqueeTwitter && (
                    <MarqueeCard
                      accent="#55acee"
                      icon={twitter.profileImageUrl ?? "/logos/twitter.svg"}
                      primary={formatCompactNumber(twitter.followerCount ?? 0)}
                      secondary={twitterCopy.followers}
                    />
                  )}
                  {daylight && (
                    <MarqueeCard
                      accent="#fb923c"
                      icon="/logos/daylight-pixel.svg"
                      primary={`${daylight.daylightHours.toFixed(1)}H`}
                      secondary={ambientCopy.daylight}
                    />
                  )}
                  {productivity.timer.running && (
                    <MarqueeCard
                      accent="#f97316"
                      icon="/logos/timer-pixel.svg"
                      primary={formatDuration(timerRemainingMs)}
                      secondary={productivityCopy.timer}
                    />
                  )}
                  {productivity.stopwatch.running && (
                    <MarqueeCard
                      accent="#22d3ee"
                      icon="/logos/stopwatch-pixel.svg"
                      primary={formatDuration(stopwatchElapsedMs)}
                      secondary={productivityCopy.stopwatch}
                    />
                  )}
                  <MarqueeCard
                    accent="#22d3ee"
                    icon="/logos/system-pixel.svg"
                    primary={
                      system.cpuTemperatureCelsius === null
                        ? systemCopy.networkTypes[system.networkType]
                        : `${Math.round(system.cpuTemperatureCelsius)}°`
                    }
                    secondary={systemCopy.system}
                  />
                  <MarqueeCard
                    accent="#c4b5fd"
                    icon="/logos/moon-pixel.svg"
                    primary={`${moon.illuminationPercent}%`}
                    secondary={ambientCopy.moonPhases[moon.name]}
                  />
                  <MarqueeCard
                    accent="#a3e635"
                    icon="/logos/progress-pixel.svg"
                    primary={`${(yearProgress?.percent ?? 0).toFixed(1)}%`}
                    secondary={ambientCopy.progressLabels.year}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </button>
    </main>
  );
}

export const ActiveApp = memo(ActiveAppView, areActiveAppPropsEqual);
