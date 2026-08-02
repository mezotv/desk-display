import type { DisplayLanguage } from "@/types/settings";

export type Alarm = {
  enabled: boolean;
  id: string;
  scheduledAt: string;
};

export type AlarmDraft = {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
};

export type AlarmDraftField = keyof AlarmDraft;

export type AlarmCopy = {
  add: string;
  alarm: string;
  alarms: string;
  allSet: string;
  back: string;
  cancel: string;
  day: string;
  delete: string;
  disabled: string;
  dismiss: string;
  empty: string;
  enabled: string;
  futureTime: string;
  hour: string;
  minute: string;
  month: string;
  newAlarm: string;
  ringing: string;
  save: string;
  year: string;
};

export type AlarmAppProps = {
  alarms: Alarm[];
  language: DisplayLanguage;
  now: Date;
  onAdd: (scheduledAt: string) => void;
  onDelete: (alarmId: string) => void;
  onHome: () => void;
  onToggle: (alarmId: string) => void;
};

export type AlarmRingingProps = {
  alarm: Alarm;
  language: DisplayLanguage;
  onDismiss: () => void;
};

export type AlarmStepperProps = {
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  value: string;
};

export type AlarmUpdater = (alarms: Alarm[]) => Alarm[];
