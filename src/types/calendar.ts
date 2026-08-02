import type { DisplayLanguage } from "@/types/settings";

export type CalendarEvent = {
  allDay: boolean;
  end: string;
  hasVideoMeeting: boolean;
  id: string;
  location: string | null;
  start: string;
  title: string | null;
};

export type CalendarSnapshot = {
  clientConfigured: boolean;
  configured: boolean;
  error: string | null;
  events: CalendarEvent[];
  updatedAt: string;
};

export type CalendarCopy = {
  addKeys: string;
  allDay: string;
  connect: string;
  connecting: string;
  googleMeet: string;
  inProgress: string;
  locationUnknown: string;
  next: string;
  noMeetings: string;
  startsIn: string;
  untitled: string;
};

export type CalendarAppProps = {
  calendar: CalendarSnapshot;
  language: DisplayLanguage;
  now: Date;
};
