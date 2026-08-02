import type { DisplayLanguage } from "@/types/settings";

export type CountdownTimer = {
  durationMs: number;
  endsAt: string | null;
  remainingMs: number;
  running: boolean;
};

export type DisplayStopwatch = {
  elapsedMs: number;
  running: boolean;
  startedAt: string | null;
};

export type DisplayTask = {
  completed: boolean;
  id: string;
  title: string;
};

export type ProductivityState = {
  note: string;
  stopwatch: DisplayStopwatch;
  tasks: DisplayTask[];
  timer: CountdownTimer;
};

export type ProductivityUpdater = (
  state: ProductivityState,
) => ProductivityState;

export type UseProductivityResult = {
  addTask: (title: string) => void;
  changeTimerDuration: (durationMs: number) => void;
  clearCompletedTasks: () => void;
  deleteTask: (taskId: string) => void;
  dismissTimerFinished: () => void;
  pauseTimer: () => void;
  ready: boolean;
  resetStopwatch: () => void;
  resetTimer: () => void;
  startTimer: () => void;
  state: ProductivityState;
  timerFinished: boolean;
  toggleStopwatch: () => void;
  toggleTask: (taskId: string) => void;
  updateNote: (note: string) => void;
};

export type ProductivityCopy = {
  addTask: string;
  back: string;
  clearDone: string;
  completed: string;
  dismiss: string;
  edit: string;
  emptyNote: string;
  emptyTasks: string;
  finished: string;
  minutes: string;
  note: string;
  pause: string;
  reset: string;
  resume: string;
  save: string;
  start: string;
  stopwatch: string;
  tasks: string;
  timer: string;
};

export type TimerAppProps = {
  language: DisplayLanguage;
  now: Date;
  onChangeDuration: (durationMs: number) => void;
  onHome: () => void;
  onPause: () => void;
  onReset: () => void;
  onStart: () => void;
  timer: CountdownTimer;
};

export type TimerFinishedProps = {
  language: DisplayLanguage;
  onDismiss: () => void;
};

export type StopwatchAppProps = {
  language: DisplayLanguage;
  now: Date;
  onHome: () => void;
  onReset: () => void;
  onToggle: () => void;
  stopwatch: DisplayStopwatch;
};

export type TasksAppProps = {
  language: DisplayLanguage;
  onAdd: (title: string) => void;
  onClearCompleted: () => void;
  onDelete: (taskId: string) => void;
  onHome: () => void;
  onToggle: (taskId: string) => void;
  tasks: DisplayTask[];
};

export type NotesAppProps = {
  language: DisplayLanguage;
  note: string;
  onChange: (note: string) => void;
  onHome: () => void;
};
