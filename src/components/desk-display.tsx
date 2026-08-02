import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { ActiveApp } from "@/components/active-app";
import { AppLauncher } from "@/components/app-launcher";
import { AlarmApp } from "@/components/alarm-app";
import { AlarmRinging } from "@/components/alarm-ringing";
import { BootLoader } from "@/components/boot-loader";
import { SettingsApp } from "@/components/settings-app";
import { ScreenProtection } from "@/components/screen-protection";
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
import { useTapGesture } from "@/utils/use-tap-gesture";
import { useRecurringRefresh } from "@/utils/use-recurring-refresh";
import { getWeatherIcon } from "@/utils/get-weather-icon";
import { getWeather } from "@/utils/weather.functions";
import { isNightModeActive } from "@/utils/night-mode-time";

export function DeskDisplay({
  initialCalendar,
  initialMrr,
  initialSettings,
  initialSpotify,
  initialSystem,
  initialWeather,
}: DeskDisplayProps) {
  const [activeApp, setActiveApp] = useState<AppId>("stripe");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmsReady, setAlarmsReady] = useState(false);
  const [bootDelayElapsed, setBootDelayElapsed] = useState(false);
  const [ringingAlarmId, setRingingAlarmId] = useState<string | null>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [metricPeriod, setMetricPeriod] = useState<"mrr" | "arr">("mrr");
  const [calendar, setCalendar] = useState(initialCalendar);
  const [mrr, setMrr] = useState(initialMrr);
  const [settings, setSettings] = useState(initialSettings);
  const [spotify, setSpotify] = useState(initialSpotify);
  const [system, setSystem] = useState(initialSystem);
  const [weather, setWeather] = useState(initialWeather);
  const refreshMrr = useServerFn(getMrr);
  const refreshCalendar = useServerFn(getCalendar);
  const refreshSpotify = useServerFn(getSpotify);
  const controlSpotify = useServerFn(setSpotifyPlayback);
  const refreshSystem = useServerFn(getSystem);
  const refreshWeather = useServerFn(getWeather);

  useEffect(() => {
    const bootTimer = window.setTimeout(
      () => setBootDelayElapsed(true),
      BOOT_LOADER_MINIMUM_MS,
    );

    return () => window.clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    setAlarms(loadAlarms());
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

  useEffect(() => {
    if (!navigationReady) return;

    saveNavigation({ activeApp, launcherOpen });
  }, [activeApp, launcherOpen, navigationReady]);

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
      setRingingAlarmId((currentId) =>
        currentId === alarmId ? null : currentId,
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
    if (!ringingAlarmId) return;

    updateAlarms((currentAlarms) =>
      currentAlarms.map((alarm) =>
        alarm.id === ringingAlarmId ? { ...alarm, enabled: false } : alarm,
      ),
    );
    setRingingAlarmId(null);
  }, [ringingAlarmId, updateAlarms]);

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

  useEffect(() => {
    if (!alarmsReady) return;

    const nowTimestamp = now.getTime();
    const existingRingingAlarm = alarms.find(
      (alarm) => alarm.id === ringingAlarmId,
    );

    if (ringingAlarmId && !existingRingingAlarm) {
      setRingingAlarmId(null);
      return;
    }

    const dueAlarm = alarms
      .filter((alarm) => {
        const scheduledTimestamp = Date.parse(alarm.scheduledAt);
        return (
          alarm.enabled &&
          scheduledTimestamp <= nowTimestamp &&
          scheduledTimestamp >= nowTimestamp - ALARM_TRIGGER_GRACE_MS
        );
      })
      .sort(
        (left, right) =>
          Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt),
      )[0];

    if (!ringingAlarmId && dueAlarm) setRingingAlarmId(dueAlarm.id);

    if (
      alarms.some(
        (alarm) =>
          alarm.enabled &&
          Date.parse(alarm.scheduledAt) < nowTimestamp - ALARM_TRIGGER_GRACE_MS,
      )
    ) {
      updateAlarms((currentAlarms) =>
        currentAlarms.map((alarm) =>
          alarm.enabled &&
          Date.parse(alarm.scheduledAt) < nowTimestamp - ALARM_TRIGGER_GRACE_MS
            ? { ...alarm, enabled: false }
            : alarm,
        ),
      );
    }
  }, [alarms, alarmsReady, now, ringingAlarmId, updateAlarms]);

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

      if (
        activeApp === "calendar" &&
        calendar.clientConfigured &&
        !calendar.configured
      ) {
        window.location.assign("/api/google-calendar/login");
      }
    },
    () => setLauncherOpen(true),
  );

  const ringingAlarm = alarms.find((alarm) => alarm.id === ringingAlarmId);
  const startupReady =
    alarmsReady && navigationReady && bootDelayElapsed;

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
          onLaunch={(appId) => {
            setActiveApp(appId);
            setLauncherOpen(false);
          }}
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
          onHome={() => setLauncherOpen(true)}
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
          onHome={() => setLauncherOpen(true)}
          onToggle={toggleAlarm}
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
        spotify={spotify}
        system={system}
        weather={weather}
        weatherIcon={weatherIcon}
      />
    </ScreenProtection>
  );
}
