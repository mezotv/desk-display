import { OverflowMarquee } from "@/components/overflow-marquee";
import { PixelatedImage } from "@/components/pixelated-image";
import { CALENDAR_COPY } from "@/constants/calendar";
import type { CalendarAppProps } from "@/types/calendar";
import {
  formatCalendarCountdown,
  formatCalendarEventStart,
} from "@/utils/format-calendar-event";

export function CalendarApp({ calendar, language, now }: CalendarAppProps) {
  const copy = CALENDAR_COPY[language];

  if (!calendar.configured) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center transition-transform duration-100 group-active:scale-[0.985]">
        <PixelatedImage
          alt="Google Calendar"
          className="size-[clamp(150px,min(18.75vw,31vh),260px)]"
          src="/logos/google-calendar.svg"
        />
        <strong className="mt-5 text-[clamp(31px,min(3.9vw,6.5vh),50px)] font-extrabold text-[#4285f4]">
          {calendar.clientConfigured ? copy.connecting : copy.addKeys}
        </strong>
        <span className="mt-[7px] text-[clamp(18px,min(2.25vw,3.75vh),28px)] font-semibold text-[#74747f]">
          {calendar.clientConfigured ? copy.connect : "GOOGLE CALENDAR"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-[min(83vh,720px)] w-[min(90vw,1200px)] flex-col gap-[clamp(10px,1.5vh,16px)] transition-transform duration-100 group-active:scale-[0.985] max-[620px]:h-[calc(100%_-_24px)] max-[620px]:w-[calc(100%_-_24px)]">
      <header className="flex h-[clamp(46px,7vh,64px)] shrink-0 basis-[clamp(46px,7vh,64px)] items-center gap-[13px] text-[clamp(25px,min(3.1vw,4.8vh),38px)] font-extrabold tracking-[0.06em] text-[#4285f4]">
        <PixelatedImage
          alt=""
          className="size-[clamp(38px,min(4.75vw,7.5vh),58px)]"
          src="/logos/google-calendar.svg"
        />
        <span>{copy.next}</span>
      </header>
      {calendar.events.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-[clamp(34px,min(4.25vw,7vh),52px)] font-bold text-[#6f6f7a]">
          {copy.noMeetings}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-rows-3 gap-[clamp(9px,1.4vh,15px)]">
          {calendar.events.slice(0, 3).map((event, index) => {
            const countdown = formatCalendarCountdown(
              event.start,
              event.end,
              now,
              language,
            );
            const destination =
              event.location ??
              (event.hasVideoMeeting ? copy.googleMeet : copy.locationUnknown);

            return (
              <article
                className={`grid min-w-0 grid-cols-[clamp(210px,26vw,330px)_minmax(0,1fr)] items-center gap-[clamp(18px,2.5vw,34px)] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] border bg-display-panel px-[clamp(17px,2.2vw,30px)] py-[clamp(11px,1.6vh,20px)] text-left max-[620px]:grid-cols-[minmax(88px,31vw)_minmax(0,1fr)] max-[620px]:gap-2.5 max-[620px]:px-2.5 max-[620px]:py-[9px] ${
                  index === 0
                    ? "border-[#4285f4]/75 bg-[#111722]"
                    : "border-[#24242c]"
                }`}
                key={event.id}
              >
                <div className="flex min-w-0 flex-col overflow-hidden">
                  <time className="overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(23px,min(2.9vw,4.6vh),36px)] font-extrabold text-display-text max-[620px]:text-[clamp(17px,5.2vw,22px)]">
                    {formatCalendarEventStart(
                      event.start,
                      now,
                      language,
                      event.allDay,
                    )}
                  </time>
                  <span className="mt-[5px] overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(15px,min(1.9vw,3vh),23px)] font-bold tracking-[0.05em] text-[#4285f4] max-[620px]:text-[clamp(12px,3.7vw,16px)]">
                    {event.allDay
                      ? copy.allDay
                      : countdown
                      ? `${copy.startsIn} ${countdown}`
                      : copy.inProgress}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col overflow-hidden">
                  <OverflowMarquee className="block w-full text-left text-[clamp(26px,min(3.25vw,5.2vh),42px)] font-bold leading-[1.05] text-display-text max-[620px]:text-[clamp(19px,5.8vw,25px)]">
                    {event.title ?? copy.untitled}
                  </OverflowMarquee>
                  <OverflowMarquee className="mt-[7px] block w-full text-left text-[clamp(17px,min(2.1vw,3.4vh),27px)] font-semibold tracking-[0.035em] text-[#8b8b98] max-[620px]:text-[clamp(14px,4.2vw,18px)]">
                    {destination}
                  </OverflowMarquee>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
