import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";

import { UPDATE_COPY } from "@/constants/update";
import type {
  UpdatePanelProps,
  UpdatePhase,
  UpdateStatus,
} from "@/types/update";
import { reloadAfterUpdate } from "@/utils/reload-after-update";
import { requestDeskDisplayUpdate } from "@/utils/request-desk-display-update";
import { checkForDeskDisplayUpdate } from "@/utils/update.functions";

export function UpdatePanel({ language }: UpdatePanelProps) {
  const copy = UPDATE_COPY[language];
  const checkForUpdate = useServerFn(checkForDeskDisplayUpdate);
  const [phase, setPhase] = useState<UpdatePhase>("idle");
  const [status, setStatus] = useState<UpdateStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    setPhase("checking");

    try {
      setStatus(await checkForUpdate());
    } catch {
      setStatus({
        checkedAt: new Date().toISOString(),
        currentVersion: __DESK_DISPLAY_VERSION__,
        error: copy.failed,
        installSupported: false,
        latestVersion: null,
        updateAvailable: false,
      });
    } finally {
      setPhase("idle");
    }
  }, [checkForUpdate, copy.failed]);

  const runUpdate = useCallback(async () => {
    if (!status?.updateAvailable || !status.installSupported) return;
    setPhase("installing");

    try {
      const result = await requestDeskDisplayUpdate();

      if (result.status === "installed") {
        setPhase("restarting");
        void reloadAfterUpdate(result.currentVersion);
        return;
      }

      setStatus((current) =>
        current
          ? {
              ...current,
              currentVersion: result.currentVersion,
              error: result.error,
              latestVersion: result.latestVersion,
              updateAvailable: false,
            }
          : current,
      );
    } catch {
      setStatus((current) =>
        current ? { ...current, error: copy.failed } : current,
      );
    } finally {
      setPhase((current) => (current === "restarting" ? current : "idle"));
    }
  }, [copy.failed, status]);

  const busy = phase !== "idle";
  const installSupported = status?.installSupported ?? true;
  const statusLabel =
    phase === "installing"
      ? `${copy.install}…`
      : phase === "restarting"
        ? copy.restarting
        : status?.error
          ? status.error
          : status?.updateAvailable
            ? copy.available
            : status
              ? copy.upToDate
              : copy.manual;

  return (
    <section
      className="grid min-h-[150px] grid-cols-1 grid-rows-[auto_auto_auto] content-center items-stretch gap-[clamp(7px,1.2vh,11px)] rounded-[14px] bg-display-panel px-[clamp(12px,1.6vw,22px)] py-[clamp(10px,1.6vh,16px)] [@media(max-width:620px)_and_(orientation:portrait)]:p-3"
      data-update-panel
    >
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-[clamp(18px,min(2.35vw,3.9vh),29px)] font-bold leading-none tracking-[0.06em] text-[#7f7f8b] max-[620px]:text-[clamp(17px,5.5vw,22px)]">
          {copy.title}
          <small className="mt-1 block overflow-hidden text-[10px] font-bold tracking-[0.04em] text-ellipsis whitespace-nowrap text-[#5d5d68]">
            {statusLabel}
          </small>
        </span>
        <small className="shrink-0 text-[clamp(12px,1.5vw,17px)] font-bold text-brand-purple">
          v{status?.currentVersion ?? __DESK_DISPLAY_VERSION__}
        </small>
      </div>

      <div className="grid grid-cols-2 items-center gap-2 rounded-[9px] bg-[#17171d] px-2.5 py-1.5">
        <span className="min-w-0 text-[clamp(11px,1.35vw,15px)] font-bold tracking-[0.06em] text-[#666672]">
          {copy.current}
          <strong className="mt-0.5 block overflow-hidden text-ellipsis text-[clamp(18px,2.2vw,27px)] text-display-text">
            v{status?.currentVersion ?? __DESK_DISPLAY_VERSION__}
          </strong>
        </span>
        <span className="min-w-0 text-right text-[clamp(11px,1.35vw,15px)] font-bold tracking-[0.06em] text-[#666672]">
          {copy.latest}
          <strong className="mt-0.5 block overflow-hidden text-ellipsis text-[clamp(18px,2.2vw,27px)] text-brand-purple">
            {status?.latestVersion ? `v${status.latestVersion}` : "—"}
          </strong>
        </span>
      </div>

      <div
        className={`grid gap-1.5 ${
          status?.updateAvailable && installSupported
            ? "grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
            : "grid-cols-1"
        }`}
      >
        <button
          aria-label={copy.refresh}
          className="min-h-[46px] touch-manipulation rounded-[9px] border-0 bg-[#202028] px-2 text-[clamp(13px,min(1.55vw,2.6vh),18px)] font-extrabold tracking-[0.03em] text-[#a1a1ad] outline-none active:scale-[0.98] active:bg-[#2a2a35] disabled:opacity-50"
          data-update-refresh
          disabled={busy}
          onClick={() => void refreshStatus()}
          type="button"
        >
          ↻ {phase === "checking" ? copy.checking : copy.refresh}
        </button>

        {status?.updateAvailable && installSupported ? (
          <button
            className="min-h-[46px] touch-manipulation rounded-[9px] border-0 bg-brand-purple px-2 text-[clamp(13px,min(1.55vw,2.6vh),18px)] font-extrabold tracking-[0.03em] text-display-bg outline-none active:scale-[0.98] disabled:opacity-50"
            disabled={busy}
            onClick={() => void runUpdate()}
            type="button"
          >
            {phase === "installing" ? `${copy.install}…` : copy.install}
          </button>
        ) : null}
      </div>
    </section>
  );
}
