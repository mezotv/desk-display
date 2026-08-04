import { useState } from "react";

import { PixelIcon } from "@/components/pixel-icon";
import { ALARM_COPY, MAX_ALARMS } from "@/constants/alarm";
import type {
  AlarmAppProps,
  AlarmDraft,
  AlarmDraftField,
  AlarmStepperProps,
} from "@/types/alarm";
import {
  adjustAlarmDraft,
  alarmDraftToDate,
  createAlarmDraft,
  formatAlarmDate,
  formatAlarmDraftValue,
} from "@/utils/alarm-date";
import { formatClockTime } from "@/utils/format-clock";

function AlarmStepper({
  label,
  onDecrease,
  onIncrease,
  value,
}: AlarmStepperProps) {
  return (
    <div className="grid min-w-0 content-center grid-rows-[22px_58px_42px_58px] gap-[5px]">
      <span className="overflow-hidden text-center text-[15px] font-bold tracking-[0.045em] text-ellipsis whitespace-nowrap text-[#72727e] max-[620px]:text-[11px]">
        {label}
      </span>
      <button
        aria-label={`${label} +`}
        className="touch-manipulation rounded-[9px] border-0 bg-[#17171d] font-mono text-[33px] font-bold leading-none text-red-500 outline-none"
        onClick={onIncrease}
        type="button"
      >
        <PixelIcon className="mx-auto size-7" name="plus" />
      </button>
      <strong className="grid min-w-0 place-items-center overflow-hidden text-center text-[26px] font-extrabold leading-none text-ellipsis whitespace-nowrap text-display-text max-[620px]:text-xl">
        {value}
      </strong>
      <button
        aria-label={`${label} −`}
        className="touch-manipulation rounded-[9px] border-0 bg-[#17171d] font-mono text-[33px] font-bold leading-none text-red-500 outline-none"
        onClick={onDecrease}
        type="button"
      >
        <PixelIcon className="mx-auto size-7" name="minus" />
      </button>
    </div>
  );
}

export function AlarmApp({
  alarms,
  language,
  now,
  onAdd,
  onDelete,
  onHome,
  onToggle,
}: AlarmAppProps) {
  const [draft, setDraft] = useState<AlarmDraft | null>(null);
  const copy = ALARM_COPY[language];
  const sortedAlarms = [...alarms].sort(
    (left, right) =>
      Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt),
  );

  if (draft) {
    const scheduledDate = alarmDraftToDate(draft);
    const isFuture = scheduledDate.getTime() > now.getTime();
    const fields: Array<{ field: AlarmDraftField; label: string }> = [
      { field: "day", label: copy.day },
      { field: "month", label: copy.month },
      { field: "year", label: copy.year },
      { field: "hour", label: copy.hour },
      { field: "minute", label: copy.minute },
    ];

    const adjust = (field: AlarmDraftField, direction: -1 | 1) => {
      setDraft((current) =>
        current ? adjustAlarmDraft(current, field, direction) : current,
      );
    };

    return (
      <main className="relative grid h-dvh min-h-0 w-full grid-rows-[60px_76px_minmax(0,1fr)] gap-2 overflow-hidden bg-display-bg px-[clamp(20px,3.25vw,52px)] pt-[clamp(12px,2.5vh,24px)] pb-[clamp(16px,3vh,30px)] [@media(min-width:1100px)_and_(min-height:650px)]:mx-auto [@media(min-width:1100px)_and_(min-height:650px)]:w-[min(100%,1500px)] max-[620px]:px-2.5 max-[620px]:pt-2 max-[620px]:pb-2.5">
        <header className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <button
            className="min-h-[50px] justify-self-start touch-manipulation rounded-[10px] border-0 bg-[#17171d] px-[15px] text-lg font-bold text-[#a0a0ac] outline-none disabled:cursor-default disabled:text-[#50505b] disabled:opacity-60 [@media(min-width:1100px)_and_(min-height:650px)]:min-h-[60px] [@media(min-width:1100px)_and_(min-height:650px)]:text-2xl max-[620px]:min-h-11 max-[620px]:px-2.5 max-[620px]:text-base"
            onClick={() => setDraft(null)}
            type="button"
          >
            {copy.cancel}
          </button>
          <h1 className="m-0 whitespace-nowrap text-[27px] font-extrabold tracking-[0.06em] text-red-500 [@media(min-width:1100px)_and_(min-height:650px)]:text-4xl max-[620px]:text-[clamp(20px,6.5vw,27px)]">
            {copy.newAlarm}
          </h1>
          <button
            className="min-h-[50px] justify-self-end touch-manipulation rounded-[10px] border-0 bg-[#17171d] px-[15px] text-lg font-bold text-red-500 outline-none disabled:cursor-default disabled:text-[#50505b] disabled:opacity-60 [@media(min-width:1100px)_and_(min-height:650px)]:min-h-[60px] [@media(min-width:1100px)_and_(min-height:650px)]:text-2xl max-[620px]:min-h-11 max-[620px]:px-2.5 max-[620px]:text-base"
            disabled={!isFuture}
            onClick={() => {
              onAdd(scheduledDate.toISOString());
              setDraft(null);
            }}
            type="button"
          >
            {copy.save}
          </button>
        </header>

        <section
          className="relative flex min-w-0 items-baseline justify-center gap-[22px]"
          aria-live="polite"
        >
          <time className="text-[56px] font-extrabold leading-none tracking-[-0.055em] text-display-text">
            {formatClockTime(scheduledDate, language)}
          </time>
          <span className="max-w-[360px] overflow-hidden text-xl font-bold tracking-[0.04em] text-ellipsis whitespace-nowrap text-red-500">
            {formatAlarmDate(scheduledDate, now, language)}
          </span>
          {!isFuture && (
            <em className="absolute right-0 bottom-px text-xs font-bold not-italic text-red-500">
              {copy.futureTime}
            </em>
          )}
        </section>

        <section className="grid min-h-0 grid-cols-5 gap-2.5 max-[620px]:gap-[5px]">
          {fields.map(({ field, label }) => (
            <AlarmStepper
              key={field}
              label={label}
              onDecrease={() => adjust(field, -1)}
              onIncrease={() => adjust(field, 1)}
              value={formatAlarmDraftValue(draft, field, language)}
            />
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="relative grid h-dvh min-h-0 w-full grid-rows-[60px_minmax(0,1fr)] gap-2.5 overflow-hidden bg-display-bg px-[clamp(20px,3.25vw,52px)] pt-[clamp(12px,2.5vh,24px)] pb-[clamp(16px,3vh,30px)] [@media(min-width:1100px)_and_(min-height:650px)]:mx-auto [@media(min-width:1100px)_and_(min-height:650px)]:w-[min(100%,1500px)] max-[620px]:px-2.5 max-[620px]:pt-2 max-[620px]:pb-2.5">
      <header className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-3.5">
        <button
          className="min-h-[50px] justify-self-start touch-manipulation rounded-[10px] border-0 bg-[#17171d] px-[15px] text-lg font-bold text-[#a0a0ac] outline-none disabled:cursor-default disabled:text-[#50505b] disabled:opacity-60 [@media(min-width:1100px)_and_(min-height:650px)]:min-h-[60px] [@media(min-width:1100px)_and_(min-height:650px)]:text-2xl max-[620px]:min-h-11 max-[620px]:px-2.5 max-[620px]:text-base"
          onClick={onHome}
          type="button"
        >
          <span className="flex items-center gap-2">
            <PixelIcon className="size-5" name="back" />
            {copy.back}
          </span>
        </button>
        <h1 className="m-0 whitespace-nowrap text-[27px] font-extrabold tracking-[0.06em] text-red-500 [@media(min-width:1100px)_and_(min-height:650px)]:text-4xl max-[620px]:text-[clamp(20px,6.5vw,27px)]">
          {copy.alarms}
        </h1>
        <button
          className="min-h-[50px] justify-self-end touch-manipulation rounded-[10px] border-0 bg-[#17171d] px-[15px] text-lg font-bold text-red-500 outline-none disabled:cursor-default disabled:text-[#50505b] disabled:opacity-60 [@media(min-width:1100px)_and_(min-height:650px)]:min-h-[60px] [@media(min-width:1100px)_and_(min-height:650px)]:text-2xl max-[620px]:min-h-11 max-[620px]:px-2.5 max-[620px]:text-base"
          disabled={alarms.length >= MAX_ALARMS}
          onClick={() => setDraft(createAlarmDraft(now))}
          type="button"
        >
          {copy.add}
        </button>
      </header>

      {sortedAlarms.length === 0 ? (
        <section className="flex min-h-0 flex-col items-center justify-center gap-[15px]">
          <img
            alt=""
            className="size-28 [image-rendering:pixelated]"
            src="/logos/alarm-pixel.svg"
          />
          <strong className="text-[23px] font-bold tracking-[0.055em] text-[#7d7d89]">
            {copy.empty}
          </strong>
          <button
            className="h-[58px] min-w-[230px] touch-manipulation rounded-[10px] border-0 bg-[#17171d] text-xl font-bold text-red-500 outline-none"
            onClick={() => setDraft(createAlarmDraft(now))}
            type="button"
          >
            {copy.newAlarm}
          </button>
        </section>
      ) : (
        <section className="grid min-h-0 touch-pan-y auto-rows-[88px] content-start gap-2.5 overflow-x-hidden overflow-y-auto pr-1 pb-1 [overscroll-behavior:contain] [scrollbar-color:#ef4444_#17171d] [scrollbar-width:thin] [@media(min-width:1100px)_and_(min-height:650px)]:auto-rows-[clamp(100px,13vh,132px)]">
          {sortedAlarms.map((alarm) => {
            const scheduledDate = new Date(alarm.scheduledAt);
            const isPast = scheduledDate.getTime() <= now.getTime();

            return (
              <article
                className={`grid min-w-0 grid-cols-[minmax(0,1fr)_96px_58px] items-center gap-3 rounded-[13px] border bg-display-panel py-2.5 pr-3 pl-5 [@media(min-width:1100px)_and_(min-height:650px)]:grid-cols-[minmax(0,1fr)_130px_72px] max-[620px]:grid-cols-[minmax(0,1fr)_74px_48px] max-[620px]:gap-[7px] max-[620px]:p-2 ${
                  alarm.enabled && !isPast
                    ? "border-red-500/60"
                    : "border-[#24242c]"
                }`}
                key={alarm.id}
              >
                <div className="grid min-w-0 grid-cols-[clamp(160px,20vw,250px)_minmax(0,1fr)] items-center gap-[18px] max-[620px]:grid-cols-1 max-[620px]:gap-[3px]">
                  <time className="whitespace-nowrap text-[clamp(43px,min(5.4vw,9vh),66px)] font-extrabold leading-none tracking-[-0.045em] text-display-text max-[620px]:text-[clamp(33px,10vw,42px)]">
                    {formatClockTime(scheduledDate, language)}
                  </time>
                  <span className="overflow-hidden text-lg font-semibold tracking-[0.035em] text-ellipsis whitespace-nowrap text-[#777783] [@media(min-width:1100px)_and_(min-height:650px)]:text-2xl max-[620px]:text-[13px]">
                    {formatAlarmDate(scheduledDate, now, language)}
                  </span>
                </div>
                <button
                  aria-label={`${copy.alarm}: ${alarm.enabled ? copy.enabled : copy.disabled}`}
                  className={`grid h-[54px] touch-manipulation grid-cols-[24px_1fr] items-center gap-[7px] rounded-[9px] border-0 px-2 py-1.5 text-[13px] font-bold outline-none disabled:cursor-default disabled:opacity-60 [@media(min-width:1100px)_and_(min-height:650px)]:h-[68px] max-[620px]:h-12 max-[620px]:grid-cols-[18px_1fr] max-[620px]:gap-1 max-[620px]:p-1 max-[620px]:text-[10px] ${
                    alarm.enabled && !isPast
                      ? "bg-red-500/10 text-red-500"
                      : "bg-[#17171d] text-[#777783]"
                  }`}
                  disabled={isPast}
                  onClick={() => onToggle(alarm.id)}
                  type="button"
                >
                  <span
                    className={`block size-5 border-4 bg-display-panel max-[620px]:size-4 max-[620px]:border-[3px] ${
                      alarm.enabled && !isPast
                        ? "border-red-500 bg-red-500"
                        : "border-[#555560]"
                    }`}
                  />
                  {alarm.enabled && !isPast ? copy.enabled : copy.disabled}
                </button>
                <button
                  aria-label={copy.delete}
                  className="size-[54px] touch-manipulation rounded-[9px] border-0 bg-[#17171d] font-mono text-4xl leading-none text-[#9b6670] outline-none [@media(min-width:1100px)_and_(min-height:650px)]:size-[68px] max-[620px]:h-12 max-[620px]:w-[46px]"
                  onClick={() => onDelete(alarm.id)}
                  type="button"
                >
                  <PixelIcon className="mx-auto size-7" name="trash" />
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
