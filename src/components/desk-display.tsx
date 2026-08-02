import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { ActiveApp } from "@/components/active-app";
import { AppLauncher } from "@/components/app-launcher";
import { AlarmApp } from "@/components/alarm-app";
import { AlarmRinging } from "@/components/alarm-ringing";
import { BootLoader } from "@/components/boot-loader";
import { SettingsApp } from "@/components/settings-app";
import { ScreenProtection } from "@/components/screen-protection";
import { StopwatchApp } from "@/components/stopwatch-app";
import { TimerApp } from "@/components/timer-app";
import { TimerFinished } from "@/components/timer-finished";
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
import { DASHBOARD_REFRESH_INTERVAL_MS } from "@/constants/dashboard";
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
import {
  loadAlarms,
  loadDisplaySettings,
  loadNavigation,
  saveAlarms,
  saveDisplaySettings,
  saveNavigation,
} from "@/utils/display-storage";
import { getCalendar } from "@/utils/google-calendar.functions";
import { getMrr } from "@/utils/mrr.functions";
import { getSpotify, setSpotifyPlayback } from "@/utils/spotify.functions";
import { getSystem } from "@/utils/system.functions";
import { getTwitter } from "@/utils/twitter.functions";
import { useTapGesture } from "@/utils/use-tap-gesture";
import { useRecurringRefresh } from "@/utils/use-recurring-refresh";
import { getWeatherIcon } from "@/utils/get-weather-icon";
import { getWeather } from "@/utils/weather.functions";
import { isNightModeActive } from "@/utils/night-mode-time";
import { useProductivity } from "@/utils/use-productivity";

export function DeskDisplay({
  initialCalendar,
  initialMrr,
  initialSettings,
  initialSpotify,
  initialSystem,
  initialTwitter,
  initialWeather,
}: DeskDisplayProps) {
  const [activeApp, setActiveApp] = useState<AppId>("stripe");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmsReady, setAlarmsReady] = useState(false);
  const [bootDelayElapsed, setBootDelayElapsed] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [metricPeriod, setMetricPeriod] = useState<"mrr" | "arr">("mrr");
  const [calendar, setCalendar] = useState(initialCalendar);
  const [mrr, setMrr] = useState(initialMrr);
  const [settings, setSettings] = useState(initialSettings);
  const [spotify, setSpotify] = useState(initialSpotify);
  const [system, setSystem] = useState(initialSystem);
  const [twitter, setTwitter] = useState(initialTwitter);
  const [twitterSlideIndex, setTwitterSlideIndex] = useState(0);
  const [weather, setWeather] = useState(initialWeather);
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
  const refreshMrr = useServerFn(getMrr);
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

  useEffect(() => {
    const clockInterval = window.setInterval(() => setNow(new Date()), 1_000);
    const mrrInterval = window.setInterval(
      updateMrr,
      DASHBOARD_REFRESH_INTERVAL_MS,
    );
    const weatherInterval = window.setInterval(
      updateWeather,
      WEATHER_REFRESH_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(clockInterval);
      window.clearInterval(mrrInterval);
      window.clearInterval(weatherInterval);
    };
  }, [updateMrr, updateWeather]);

  const isSpotifyVisible = activeApp === "spotify" && !launcherOpen;
  useRecurringRefresh(
    updateSpotify,
    isSpotifyVisible
      ? SPOTIFY_ACTIVE_REFRESH_INTERVAL_MS
      : SPOTIFY_BACKGROUND_REFRESH_INTERVAL_MS,
    isSpotifyVisible,
  );

  const isCalendarVisible = activeApp === "calendar" && !launcherOpen;
  useRecurringRefresh(
    updateCalendar,
    isCalendarVisible
      ? CALENDAR_ACTIVE_REFRESH_INTERVAL_MS
      : CALENDAR_BACKGROUND_REFRESH_INTERVAL_MS,
    isCalendarVisible,
  );

  const isSystemVisible = activeApp === "system" && !launcherOpen;
  useRecurringRefresh(
    updateSystem,
    isSystemVisible
      ? SYSTEM_ACTIVE_REFRESH_INTERVAL_MS
      : SYSTEM_BACKGROUND_REFRESH_INTERVAL_MS,
    isSystemVisible,
  );

  const isTwitterVisible = activeApp === "twitter" && !launcherOpen;
  useRecurringRefresh(
    updateTwitter,
    TWITTER_REFRESH_INTERVAL_MS,
    isTwitterVisible,
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
    alarmsReady && navigationReady && productivityReady && bootDelayElapsed;

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
        <AppLauncher
          language={settings.language}
          name={settings.name}
          now={now}
          onLaunch={launchApp}
          twitterConfigured={twitter.configured}
          weatherIcon={weatherIcon}
        />
      </ScreenProtection>
    );
  }

  if (activeApp === "settings") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <SettingsApp
          onChange={updateSettings}
          onHome={openLauncher}
          settings={settings}
        />
      </ScreenProtection>
    );
  }

  if (activeApp === "alarm") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <AlarmApp
          alarms={alarms}
          language={settings.language}
          now={now}
          onAdd={addAlarm}
          onDelete={deleteAlarm}
          onHome={openLauncher}
          onToggle={toggleAlarm}
        />
      </ScreenProtection>
    );
  }

  if (activeApp === "timer") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
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
      </ScreenProtection>
    );
  }

  if (activeApp === "stopwatch") {
    return (
      <ScreenProtection
        enabled={settings.oledProtection}
        nightModeActive={nightModeActive}
      >
        <StopwatchApp
          language={settings.language}
          now={now}
          onHome={openLauncher}
          onReset={resetStopwatch}
          onToggle={toggleStopwatch}
          stopwatch={productivity.stopwatch}
        />
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
        calendar={calendar}
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
