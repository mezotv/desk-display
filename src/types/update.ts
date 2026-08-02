import type { DisplayLanguage } from "@/types/settings";
import { updateInstallResultSchema } from "@/schemas/update";

export type UpdateStatus = {
  checkedAt: string;
  currentVersion: string;
  error: string | null;
  installSupported: boolean;
  latestVersion: string | null;
  updateAvailable: boolean;
};

export type UpdateInstallResult = typeof updateInstallResultSchema.Type;

export type UpdatePanelProps = {
  language: DisplayLanguage;
};

export type UpdatePhase = "checking" | "idle" | "installing" | "restarting";
