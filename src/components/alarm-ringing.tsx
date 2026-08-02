import { useEffect } from "react";

import { ALARM_COPY } from "@/constants/alarm";
import type { AlarmRingingProps } from "@/types/alarm";
import { formatAlarmDate } from "@/utils/alarm-date";
import { formatClockTime } from "@/utils/format-clock";

export function AlarmRinging({
  alarm,
  language,
  onDismiss,
}: AlarmRingingProps) {
  const scheduledDate = new Date(alarm.scheduledAt);
  const copy = ALARM_COPY[language];

  useEffect(() => {
    const AudioContextClass = window.AudioContext;
    const audioContext = new AudioContextClass();
    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.18;
    masterGain.connect(audioContext.destination);

    const beep = () => {
      const oscillator = audioContext.createOscillator();
      const beepGain = audioContext.createGain();
      const start = audioContext.currentTime;

      oscillator.type = "square";
      oscillator.frequency.value = 880;
      beepGain.gain.setValueAtTime(0.001, start);
      beepGain.gain.exponentialRampToValueAtTime(1, start + 0.015);
      beepGain.gain.setValueAtTime(1, start + 0.16);
      beepGain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      oscillator.connect(beepGain);
      beepGain.connect(masterGain);
      oscillator.start(start);
      oscillator.stop(start + 0.25);
    };

    void audioContext.resume().then(beep).catch(() => undefined);
    const beepInterval = window.setInterval(beep, 800);

    return () => {
      window.clearInterval(beepInterval);
      void audioContext.close();
    };
  }, []);

  return (
    <main
      className="relative flex h-dvh min-h-0 w-full animate-[alarm-background-pulse_900ms_steps(2,end)_infinite] flex-col items-center justify-center overflow-hidden bg-[#110608] p-6"
      aria-live="assertive"
    >
      <div
        className="grid size-[58px] place-items-center border-[6px] border-red-500 font-mono text-[37px] font-black leading-none text-red-500"
        aria-hidden="true"
      >
        !
      </div>
      <strong className="mt-2.5 text-[27px] font-extrabold tracking-[0.11em] text-red-500">
        {copy.ringing}
      </strong>
      <time className="mt-0.5 text-[clamp(92px,18vw,140px)] font-black leading-[0.88] tracking-[-0.065em] text-display-text">
        {formatClockTime(scheduledDate, language)}
      </time>
      <span className="mt-3 text-xl font-bold tracking-[0.05em] text-[#bcaeb2]">
        {formatAlarmDate(scheduledDate, new Date(), language)}
      </span>
      <button
        autoFocus
        className="mt-5 min-h-[68px] w-[min(420px,70vw)] rounded-[10px] border-[3px] border-red-500 bg-red-500 text-[26px] font-black tracking-[0.07em] text-display-text outline-none touch-manipulation focus-visible:shadow-[inset_0_0_0_3px_rgba(175,92,246,0.82)]"
        onClick={onDismiss}
        type="button"
      >
        {copy.dismiss}
      </button>
    </main>
  );
}
