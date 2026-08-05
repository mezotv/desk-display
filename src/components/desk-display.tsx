import { useServerFn } from "@tanstack/react-start";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ActiveApp } from "@/components/active-app";
import { AlarmRinging } from "@/components/alarm-ringing";
import { BootLoader } from "@/components/boot-loader";
import { DisplaySleepOverlay } from "@/components/display-sleep-overlay";
import { ScreenProtection } from "@/components/screen-protection";
import { TimerFinished } from "@/components/timer-finished";
import {
  AGENT_USAGE_ACTIVE_REFRESH_INTERVAL_MS,
  AGENT_USAGE_BACKGROUND_REFRESH_INTERVAL_MS,
} from "@/constants/agent-usage";
import { AGENT_COST_SLIDE_COUNT } from "@/constants/agent-cost";
import { BOOT_LOADER_MINIMUM_MS } from "@/constants/boot";
import {
  SPOTIFY_ACTIVE_REFRESH_INTERVAL_MS,
  SPOTIFY_BACKGROUND_REFRESH_INTERVAL_MS,
  WEATHER_REFRESH_INTERVAL_MS,
} from "@/constants/apps";
import {
  ALARM_TRIGGER_GRACE_MS,
  MAX_ALARMS,
} from "@/constants/alarm";
import {
  CALENDAR_ACTIVE_REFRESH_INTERVAL_MS,
  CALENDAR_BACKGROUND_REFRESH_INTERVAL_MS,
} from "@/constants/calendar";
import {
  DASHBOARD_ACTIVE_REFRESH_INTERVAL_MS,
  DASHBOARD_BACKGROUND_REFRESH_INTERVAL_MS,
} from "@/constants/dashboard";
import {
  SYSTEM_ACTIVE_REFRESH_INTERVAL_MS,
  SYSTEM_BACKGROUND_REFRESH_INTERVAL_MS,
} from "@/constants/system";
import {
  TWITTER_ANALYTICS_SLIDE_COUNT,
  TWITTER_REFRESH_INTERVAL_MS,
} from "@/constants/twitter";
import type { Alarm, AlarmUpdater } from "@/types/alarm";
import type { AppId, DeskDisplayProps } from "@/types/apps";
import type { DisplaySettings } from "@/types/settings";
import { getAgentUsage } from "@/utils/agent-usage.functions";
import {
  loadAlarms,
  loadDisplaySettings,
  loadNavigation,
  saveAlarms,
  saveDisplaySettings,
  saveNavigation,
} from "@/utils/display-storage";
import { getCalendar } from "@/utils/google-calendar.functions";
import { getAgentUsageSlides } from "@/utils/get-agent-usage-slides";
import { getMrr } from "@/utils/mrr.functions";
import { getSpotify, setSpotifyPlayback } from "@/utils/spotify.functions";
import { getSystem } from "@/utils/system.functions";
import { getTwitter } from "@/utils/twitter.functions";
import { useCurrentTime } from "@/utils/use-current-time";
import { useTapGesture } from "@/utils/use-tap-gesture";
import { useRecurringRefresh } from "@/utils/use-recurring-refresh";
import { getWeatherIcon } from "@/utils/get-weather-icon";
import { getWeather } from "@/utils/weather.functions";
import { isNightModeActive } from "@/utils/night-mode-time";
import { useDisplayPower } from "@/utils/use-display-power";
import { useProductivity } from "@/utils/use-productivity";
import { usePomodoro } from "@/utils/use-pomodoro";

const AppLauncher = lazy(() =>
  import("@/components/app-launcher").then(({ AppLauncher: Component }) => ({
    default: Component,
  })),
);
const AlarmApp = lazy(() =>
  import("@/components/alarm-app").then(({ AlarmApp: Component }) => ({
    default: Component,
  })),
);
const BrickBreakerApp = lazy(() =>
  import("@/components/brick-breaker-app").then(
    ({ BrickBreakerApp: Component }) => ({ default: Component }),
  ),
);
const DisplayPowerApp = lazy(() =>
  import("@/components/display-power-app").then(
    ({ DisplayPowerApp: Component }) => ({ default: Component }),
  ),
);
const PomodoroApp = lazy(() =>
  import("@/components/pomodoro-app").then(({ PomodoroApp: Component }) => ({
    default: Component,
  })),
);
const PongApp = lazy(() =>
  import("@/components/pong-app").then(({ PongApp: Component }) => ({
    default: Component,
  })),
);
const SettingsApp = lazy(() =>
  import("@/components/settings-app").then(({ SettingsApp: Component }) => ({
    default: Component,
  })),
);
const StopwatchApp = lazy(() =>
  import("@/components/stopwatch-app").then(
    ({ StopwatchApp: Component }) => ({ default: Component }),
  ),
);
const TicTacToeApp = lazy(() =>
  import("@/components/tic-tac-toe-app").then(
    ({ TicTacToeApp: Component }) => ({ default: Component }),
  ),
);
const TimerApp = lazy(() =>
  import("@/components/timer-app").then(({ TimerApp: Component }) => ({
    default: Component,
  })),
);

export function DeskDisplay({
  initialAgentUsage,
  initialCalendar,
  initialMrr,
  initialSettings,
  initialSpotify,
  initialSystem,
  initialTwitter,
  initialWeather,
}: DeskDisplayProps) {
  const [activeApp, setActiveApp] = useState<AppId>("stripe");
  const [agentUsage, setAgentUsage] = useState(initialAgentUsage);
  const [agentCostSlideIndex, setAgentCostSlideIndex] = useState(0);
  const [claudeUsageSlideIndex, setClaudeUsageSlideIndex] = useState(0);
  const [codexUsageSlideIndex, setCodexUsageSlideIndex] = useState(0);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmsReady, setAlarmsReady] = useState(false);
  const [bootDelayElapsed, setBootDelayElapsed] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);
  const [metricPeriod, setMetricPeriod] = useState<"mrr" | "arr">("mrr");
  const [calendar, setCalendar] = useState(initialCalendar);
  const [mrr, setMrr] = useState(initialMrr);
  const [settings, setSettings] = useState(initialSettings);
  const [spotify, setSpotify] = useState(initialSpotify);
  const [system, setSystem] = useState(initialSystem);
  const [twitter, setTwitter] = useState(initialTwitter);
  const [twitterSlideIndex, setTwitterSlideIndex] = useState(0);
  const [weather, setWeather] = useState(initialWeather);
  const automaticWakeAttempted = useRef<string | null>(null);
  const {
    changeTimerDuration,
    dismissTimerFinished,
    pauseTimer,
    ready: productivityReady,
    resetStopwatch,
    resetTimer,
    startTimer,
    state: productivity,
    timerFinished,
    toggleStopwatch,
  } = useProductivity();
  const {
    changeMode: changePomodoroMode,
    changePlanDuration: changePomodoroPlanDuration,
    ready: pomodoroReady,
    reset: resetPomodoro,
    state: pomodoro,
    toggle: togglePomodoro,
  } = usePomodoro();
  const {
    changing: displayPowerChanging,
    error: displayPowerError,
    ready: displayPowerReady,
    sleep: sleepDisplay,
    sleeping: displaySleeping,
    wake: wakeDisplay,
  } = useDisplayPower();
  const nextAlarmAt = alarms.reduce<string | null>((earliest, alarm) => {
    if (!alarm.enabled) return earliest;

    const scheduledTimestamp = Date.parse(alarm.scheduledAt);
    if (
      Number.isNaN(scheduledTimestamp) ||
      scheduledTimestamp < Date.now() - ALARM_TRIGGER_GRACE_MS
    ) {
      return earliest;
    }

    return !earliest || scheduledTimestamp < Date.parse(earliest)
      ? alarm.scheduledAt
      : earliest;
  }, null);
  const usesSecondPrecision =
    !launcherOpen &&
    (activeApp === "clock" ||
      activeApp === "codex-usage" ||
      activeApp === "claude-usage" ||
      (activeApp === "spotify" && spotify.isPlaying) ||
      (activeApp === "timer" && productivity.timer.running) ||
      (activeApp === "pomodoro" && pomodoro.running) ||
      (activeApp === "stopwatch" && productivity.stopwatch.running) ||
      (activeApp === "marquee" &&
        (spotify.isPlaying ||
          productivity.timer.running ||
          productivity.stopwatch.running)));
  const now = useCurrentTime({
    paused: displaySleeping,
    precision: usesSecondPrecision ? "second" : "minute",
    wakeAt: nextAlarmAt,
  });
  const refreshMrr = useServerFn(getMrr);
  const refreshAgentUsage = useServerFn(getAgentUsage);
  const refreshCalendar = useServerFn(getCalendar);
  const refreshSpotify = useServerFn(getSpotify);
  const controlSpotify = useServerFn(setSpotifyPlayback);
  const refreshSystem = useServerFn(getSystem);
  const refreshTwitter = useServerFn(getTwitter);
  const refreshWeather = useServerFn(getWeather);

  useEffect(() => {
    const bootTimer = window.setTimeout(
      () => setBootDelayElapsed(true),
      BOOT_LOADER_MINIMUM_MS,
    );

    return () => window.clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    const storedAlarms = loadAlarms();
    const staleAlarmCutoff = Date.now() - ALARM_TRIGGER_GRACE_MS;
    const alarmsWithExpiredEntriesDisabled = storedAlarms.map((alarm) =>
      alarm.enabled && Date.parse(alarm.scheduledAt) < staleAlarmCutoff
        ? { ...alarm, enabled: false }
        : alarm,
    );

    if (
      alarmsWithExpiredEntriesDisabled.some(
        (alarm, index) => alarm !== storedAlarms[index],
      )
    ) {
      saveAlarms(alarmsWithExpiredEntriesDisabled);
    }

    setAlarms(alarmsWithExpiredEntriesDisabled);
    setAlarmsReady(true);
  }, []);

  useEffect(() => {
    setSettings(loadDisplaySettings(initialSettings));
  }, [initialSettings]);

  useEffect(() => {
    const storedNavigation = loadNavigation();

    if (storedNavigation) {
      setActiveApp(storedNavigation.activeApp);
      setLauncherOpen(storedNavigation.launcherOpen);
    }

    setNavigationReady(true);
  }, []);

  const updateSettings = useCallback((nextSettings: DisplaySettings) => {
    setSettings(nextSettings);
    saveDisplaySettings(nextSettings);
  }, []);

  const updateAlarms = useCallback((updater: AlarmUpdater) => {
    setAlarms((currentAlarms) => {
      const nextAlarms = updater(currentAlarms);
      saveAlarms(nextAlarms);
      return nextAlarms;
    });
  }, []);

  const nowTimestamp = now.getTime();
  const ringingAlarm = alarms.reduce<Alarm | undefined>(
    (earliestDueAlarm, alarm) => {
      const scheduledTimestamp = Date.parse(alarm.scheduledAt);
      const isDue =
        alarm.enabled &&
        scheduledTimestamp <= nowTimestamp &&
        scheduledTimestamp >= nowTimestamp - ALARM_TRIGGER_GRACE_MS;

      if (!isDue) return earliestDueAlarm;
      if (!earliestDueAlarm) return alarm;

      return scheduledTimestamp < Date.parse(earliestDueAlarm.scheduledAt)
        ? alarm
        : earliestDueAlarm;
    },
    undefined,
  );

  useEffect(() => {
    const wakeReason = ringingAlarm?.id ?? (timerFinished ? "timer" : null);
    if (!wakeReason) {
      automaticWakeAttempted.current = null;
      return;
    }
    if (
      !displaySleeping ||
      automaticWakeAttempted.current === wakeReason
    ) {
      return;
    }

    automaticWakeAttempted.current = wakeReason;
    void wakeDisplay();
  }, [displaySleeping, ringingAlarm, timerFinished, wakeDisplay]);

  const addAlarm = useCallback(
    (scheduledAt: string) => {
      updateAlarms((currentAlarms) => {
        if (currentAlarms.length >= MAX_ALARMS) return currentAlarms;

        return [
          ...currentAlarms,
          {
            enabled: true,
            id: window.crypto.randomUUID(),
            scheduledAt,
          },
        ];
      });
    },
    [updateAlarms],
  );

  const deleteAlarm = useCallback(
    (alarmId: string) => {
      updateAlarms((currentAlarms) =>
        currentAlarms.filter((alarm) => alarm.id !== alarmId),
      );
    },
    [updateAlarms],
  );

  const toggleAlarm = useCallback(
    (alarmId: string) => {
      updateAlarms((currentAlarms) =>
        currentAlarms.map((alarm) => {
          if (alarm.id !== alarmId) return alarm;
          const canEnable = Date.parse(alarm.scheduledAt) > Date.now();
          return { ...alarm, enabled: alarm.enabled ? false : canEnable };
        }),
      );
    },
    [updateAlarms],
  );

  const dismissAlarm = useCallback(() => {
    if (!ringingAlarm) return;

    updateAlarms((currentAlarms) =>
      currentAlarms.map((alarm) =>
        alarm.id === ringingAlarm.id ? { ...alarm, enabled: false } : alarm,
      ),
    );
  }, [ringingAlarm, updateAlarms]);

  const openLauncher = useCallback(() => {
    setLauncherOpen(true);
    saveNavigation({ activeApp, launcherOpen: true });
  }, [activeApp]);

  const launchApp = useCallback((appId: AppId) => {
    setActiveApp(appId);
    setLauncherOpen(false);
    saveNavigation({ activeApp: appId, launcherOpen: false });
  }, []);

  const updateMrr = useCallback(async () => {
    try {
      const nextMrr = await refreshMrr();
      if (nextMrr.source === "stripe") setMrr(nextMrr);
    } catch (error) {
      console.error("Unable to refresh Stripe", error);
    }
  }, [refreshMrr]);

  const updateAgentUsage = useCallback(async () => {
    try {
      const nextUsage = await refreshAgentUsage();
      setAgentUsage((previous) => ({
        ...nextUsage,
        claude:
          !nextUsage.claude.available && previous.claude.available
            ? { ...previous.claude, error: nextUsage.claude.error, stale: true }
            : nextUsage.claude,
        codex:
          !nextUsage.codex.available && previous.codex.available
            ? { ...previous.codex, error: nextUsage.codex.error, stale: true }
            : nextUsage.codex,
      }));
    } catch (error) {
      console.error("Unable to refresh AI usage", error);
    }
  }, [refreshAgentUsage]);

  const updateCalendar = useCallback(async () => {
    try {
      setCalendar(await refreshCalendar());
    } catch (error) {
      console.error("Unable to refresh Google Calendar", error);
    }
  }, [refreshCalendar]);

  const updateSpotify = useCallback(async () => {
    try {
      setSpotify(await refreshSpotify());
    } catch (error) {
      console.error("Unable to refresh Spotify", error);
    }
  }, [refreshSpotify]);

  const toggleSpotify = useCallback(async () => {
    const previousSpotify = spotify;
    const shouldPlay = !spotify.isPlaying;

    setSpotify((snapshot) => ({
      ...snapshot,
      error: null,
      isPlaying: shouldPlay,
      updatedAt: new Date().toISOString(),
    }));

    try {
      await controlSpotify({ data: { shouldPlay } });
      await updateSpotify();
    } catch (error) {
      console.error("Unable to control Spotify playback", error);
      setSpotify(previousSpotify);
    }
  }, [controlSpotify, spotify, updateSpotify]);

  const updateWeather = useCallback(async () => {
    try {
      const nextWeather = await refreshWeather();
      if (nextWeather.temperatureCelsius !== null) setWeather(nextWeather);
    } catch (error) {
      console.error("Unable to refresh weather", error);
    }
  }, [refreshWeather]);

  const updateSystem = useCallback(async () => {
    try {
      setSystem(await refreshSystem());
    } catch (error) {
      console.error("Unable to refresh system status", error);
    }
  }, [refreshSystem]);

  const updateTwitter = useCallback(async () => {
    try {
      const nextTwitter = await refreshTwitter();
      if (nextTwitter.configured) setTwitter(nextTwitter);
    } catch (error) {
      console.error("Unable to refresh X", error);
    }
  }, [refreshTwitter]);

  const isMrrVisible =
    (activeApp === "stripe" || activeApp === "marquee") && !launcherOpen;
  useRecurringRefresh(
    updateMrr,
    isMrrVisible
      ? DASHBOARD_ACTIVE_REFRESH_INTERVAL_MS
      : DASHBOARD_BACKGROUND_REFRESH_INTERVAL_MS,
    false,
    mrr.configured && !displaySleeping,
  );

  const isAgentUsageVisible =
    (activeApp === "codex-usage" ||
      activeApp === "claude-usage" ||
      activeApp === "agent-cost") &&
    !launcherOpen;
  useRecurringRefresh(
    updateAgentUsage,
    isAgentUsageVisible
      ? AGENT_USAGE_ACTIVE_REFRESH_INTERVAL_MS
      : AGENT_USAGE_BACKGROUND_REFRESH_INTERVAL_MS,
    isAgentUsageVisible,
    agentUsage.configured && !displaySleeping,
  );

  useRecurringRefresh(
    updateWeather,
    WEATHER_REFRESH_INTERVAL_MS,
    false,
    !displaySleeping,
  );

  const isSpotifyVisible = activeApp === "spotify" && !launcherOpen;
  useRecurringRefresh(
    updateSpotify,
    isSpotifyVisible
      ? SPOTIFY_ACTIVE_REFRESH_INTERVAL_MS
      : SPOTIFY_BACKGROUND_REFRESH_INTERVAL_MS,
    isSpotifyVisible,
    spotify.configured && !displaySleeping,
  );

  const isCalendarVisible = activeApp === "calendar" && !launcherOpen;
  useRecurringRefresh(
    updateCalendar,
    isCalendarVisible
      ? CALENDAR_ACTIVE_REFRESH_INTERVAL_MS
      : CALENDAR_BACKGROUND_REFRESH_INTERVAL_MS,
    isCalendarVisible,
    calendar.configured && !displaySleeping,
  );

  const isSystemVisible = activeApp === "system" && !launcherOpen;
  useRecurringRefresh(
    updateSystem,
    isSystemVisible
      ? SYSTEM_ACTIVE_REFRESH_INTERVAL_MS
      : SYSTEM_BACKGROUND_REFRESH_INTERVAL_MS,
    isSystemVisible,
    !displaySleeping,
  );

  const isTwitterVisible = activeApp === "twitter" && !launcherOpen;
  useRecurringRefresh(
    updateTwitter,
    TWITTER_REFRESH_INTERVAL_MS,
    isTwitterVisible,
    twitter.configured && !displaySleeping,
  );

  const isAnnual = metricPeriod === "arr";
  const nightModeActive = isNightModeActive(
    now,
    settings.nightModeEnabled,
    settings.nightModeStart,
    settings.nightModeEnd,
  );
  const weatherIcon = getWeatherIcon(weather.weatherCode, weather.isDay);
  const onAppTap = useTapGesture(
    () => {
      if (activeApp === "stripe") {
        setMetricPeriod((period) => (period === "mrr" ? "arr" : "mrr"));
      }

      if (
        activeApp === "spotify" &&
        spotify.clientConfigured &&
        !spotify.configured
      ) {
        window.location.assign("/api/spotify/login");
        return;
      }

      if (activeApp === "spotify" && spotify.configured) {
        void toggleSpotify();
      }

      if (activeApp === "twitter") {
        setTwitterSlideIndex(
          (slideIndex) =>
            (slideIndex + 1) % TWITTER_ANALYTICS_SLIDE_COUNT,
        );
      }

      if (activeApp === "codex-usage") {
        const slideCount = getAgentUsageSlides(agentUsage, "codex").length;
        setCodexUsageSlideIndex(
          (slideIndex) => (slideIndex + 1) % Math.max(1, slideCount),
        );
      }

      if (activeApp === "claude-usage") {
        const slideCount = getAgentUsageSlides(agentUsage, "claude").length;
        setClaudeUsageSlideIndex(
          (slideIndex) => (slideIndex + 1) % Math.max(1, slideCount),
        );
      }

      if (activeApp === "agent-cost") {
        setAgentCostSlideIndex(
          (slideIndex) => (slideIndex + 1) % AGENT_COST_SLIDE_COUNT,
        );
      }

      if (
        activeApp === "calendar" &&
        calendar.clientConfigured &&
        !calendar.configured
      ) {
        window.location.assign("/api/google-calendar/login");
      }
    },
    openLauncher,
  );

  const startupReady =
    alarmsReady &&
    navigationReady &&
    productivityReady &&
    pomodoroReady &&
    displayPowerReady &&
    bootDelayElapsed;

  if (!startupReady) {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <BootLoader />
      </ScreenProtection>
    );
  }

  if (displaySleeping) {
    return (
      <DisplaySleepOverlay
        language={settings.language}
        onWake={() => void wakeDisplay()}
        waking={displayPowerChanging}
      />
    );
  }

  if (ringingAlarm) {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={false}
      >
        <AlarmRinging
          alarm={ringingAlarm}
          language={settings.language}
          onDismiss={dismissAlarm}
        />
      </ScreenProtection>
    );
  }

  if (timerFinished) {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={false}
      >
        <TimerFinished
          language={settings.language}
          onDismiss={dismissTimerFinished}
        />
      </ScreenProtection>
    );
  }

  if (launcherOpen) {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <AppLauncher
            language={settings.language}
            name={settings.name}
            now={now}
            onLaunch={launchApp}
            twitterConfigured={twitter.configured}
            weatherIcon={weatherIcon}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "settings") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <SettingsApp
            onChange={updateSettings}
            onHome={openLauncher}
            settings={settings}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "display-power") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <DisplayPowerApp
            changing={displayPowerChanging}
            error={displayPowerError}
            language={settings.language}
            onHome={openLauncher}
            onSleep={() => void sleepDisplay()}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "alarm") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <AlarmApp
            alarms={alarms}
            language={settings.language}
            now={now}
            onAdd={addAlarm}
            onDelete={deleteAlarm}
            onHome={openLauncher}
            onToggle={toggleAlarm}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "timer") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <TimerApp
            language={settings.language}
            now={now}
            onChangeDuration={changeTimerDuration}
            onHome={openLauncher}
            onPause={pauseTimer}
            onReset={resetTimer}
            onStart={startTimer}
            timer={productivity.timer}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "pomodoro") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <PomodoroApp
            language={settings.language}
            now={now}
            onChangeMode={changePomodoroMode}
            onChangePlanDuration={changePomodoroPlanDuration}
            onHome={openLauncher}
            onReset={resetPomodoro}
            onToggle={togglePomodoro}
            pomodoro={pomodoro}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "stopwatch") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <StopwatchApp
            language={settings.language}
            now={now}
            onHome={openLauncher}
            onReset={resetStopwatch}
            onToggle={toggleStopwatch}
            stopwatch={productivity.stopwatch}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "tic-tac-toe") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <TicTacToeApp
            language={settings.language}
            onHome={openLauncher}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "pong") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <PongApp language={settings.language} onHome={openLauncher} />
        </Suspense>
      </ScreenProtection>
    );
  }

  if (activeApp === "brick-breaker") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <Suspense fallback={<BootLoader />}>
          <BrickBreakerApp
            language={settings.language}
            onHome={openLauncher}
          />
        </Suspense>
      </ScreenProtection>
    );
  }

  return (
    <ScreenProtection
      enabled={settings.oledProtection}
      nightModeActive={nightModeActive}
    >
      <ActiveApp
        activeApp={activeApp}
        agentCostSlideIndex={agentCostSlideIndex}
        agentUsage={agentUsage}
        calendar={calendar}
        claudeUsageSlideIndex={claudeUsageSlideIndex}
        codexUsageSlideIndex={codexUsageSlideIndex}
        isAnnual={isAnnual}
        language={settings.language}
        mrr={mrr}
        now={now}
        onTap={onAppTap}
        productivity={productivity}
        spotify={spotify}
        system={system}
        twitter={twitter}
        twitterSlideIndex={twitterSlideIndex}
        weather={weather}
        weatherIcon={weatherIcon}
      />
    </ScreenProtection>
  );
}
