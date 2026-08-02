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
    automatic: "AUTOMATISCH ALLE 6 STUNDEN",
    check: "NACH UPDATE SUCHEN",
    checking: "SUCHE…",
    current: "INSTALLIERT",
    failed: "UPDATE FEHLGESCHLAGEN",
    install: "INSTALLIEREN",
    latest: "NEUE VERSION",
    restarting: "NEUSTART…",
    title: "SOFTWARE-UPDATE",
    unavailable: "NUR AUF LINUX VERFÜGBAR",
    upToDate: "AKTUELL",
  },
  en: {
    automatic: "AUTOMATICALLY EVERY 6 HOURS",
    check: "CHECK FOR UPDATE",
    checking: "CHECKING…",
    current: "INSTALLED",
    failed: "UPDATE FAILED",
    install: "INSTALL",
    latest: "NEW VERSION",
    restarting: "RESTARTING…",
    title: "SOFTWARE UPDATE",
    unavailable: "AVAILABLE ON LINUX ONLY",
    upToDate: "UP TO DATE",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;
