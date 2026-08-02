import type { DisplayLanguage } from "@/types/settings";

export const DESK_DISPLAY_REPOSITORY = "mezotv/desk-display";
export const DESK_DISPLAY_UPDATE_MANIFEST_URL =
  "https://github.com/mezotv/desk-display/releases/latest/download/desk-display-release.json";
export const DESK_DISPLAY_UPDATE_MARKER = ".desk-display-version";
export const DESK_DISPLAY_UPDATE_WORK_DIRECTORY = ".desk-display-update";
export const DESK_DISPLAY_UPDATE_RESTART_DELAY_MS = 1_500;
export const DESK_DISPLAY_VERSION_CHECK_INTERVAL_MS = 60_000;
export const UPDATE_DOWNLOAD_TIMEOUT = "5 minutes";
export const UPDATE_MANIFEST_TIMEOUT = "20 seconds";
export const SEMANTIC_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
export const SHA_256_PATTERN = /^[a-f0-9]{64}$/;
export const UPDATE_LOOPBACK_HOSTS: ReadonlyArray<string> = [
  "127.0.0.1",
  "::1",
  "localhost",
];

export const UPDATE_COPY = {
  de: {
    available: "UPDATE VERFÜGBAR",
    checking: "SUCHE…",
    current: "INSTALLIERT",
    failed: "UPDATE FEHLGESCHLAGEN",
    install: "INSTALLIEREN",
    latest: "NEUE VERSION",
    manual: "NUR MANUELLE PRÜFUNG",
    refresh: "PRÜFEN",
    restarting: "NEUSTART…",
    title: "SOFTWARE-UPDATE",
    upToDate: "AKTUELL",
  },
  en: {
    available: "UPDATE AVAILABLE",
    checking: "CHECKING…",
    current: "INSTALLED",
    failed: "UPDATE FAILED",
    install: "INSTALL",
    latest: "NEW VERSION",
    manual: "MANUAL CHECK ONLY",
    refresh: "CHECK",
    restarting: "RESTARTING…",
    title: "SOFTWARE UPDATE",
    upToDate: "UP TO DATE",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;
