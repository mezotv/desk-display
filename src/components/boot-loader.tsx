export function BootLoader() {
  return (
    <main
      className="grid h-dvh min-h-80 w-full place-items-center overflow-hidden bg-display-bg px-[clamp(24px,7vw,72px)] text-display-text"
      data-boot-loader
    >
      <section
        aria-label="Desk Display is loading"
        aria-live="polite"
        className="grid w-[min(680px,100%)] grid-cols-[minmax(0,1fr)_96px] items-center gap-[clamp(32px,7vw,72px)] max-[620px]:grid-cols-1 max-[620px]:justify-items-center max-[620px]:text-center"
        role="status"
      >
        <div className="min-w-0">
          <p className="m-0 text-[clamp(13px,2vw,18px)] font-bold tracking-[0.18em] text-[#656571]">
            STARTING SYSTEM
          </p>
          <h1 className="mt-2 mb-0 text-[clamp(52px,10vw,88px)] font-black leading-[0.82] tracking-[-0.045em]">
            DESK
            <span className="block text-brand-purple">DISPLAY</span>
          </h1>
          <div className="mt-[clamp(24px,5vh,38px)] flex items-center gap-3 max-[620px]:justify-center">
            <span className="text-[clamp(16px,2.5vw,22px)] font-bold tracking-[0.12em] text-[#8b8b97]">
              INITIALIZING
            </span>
            <span className="flex items-end gap-1.5" aria-hidden="true">
              <i className="size-2 animate-[boot-loader-dot_900ms_steps(2,end)_infinite] bg-brand-purple" />
              <i className="size-2 animate-[boot-loader-dot_900ms_steps(2,end)_infinite] bg-brand-purple [animation-delay:150ms]" />
              <i className="size-2 animate-[boot-loader-dot_900ms_steps(2,end)_infinite] bg-brand-purple [animation-delay:300ms]" />
            </span>
          </div>
          <div
            aria-hidden="true"
            className="mt-4 h-2 w-full max-w-[430px] overflow-hidden bg-[#19191f] max-[620px]:mx-auto"
          >
            <span className="block h-full origin-left animate-[boot-loader-progress_1.8s_steps(12,end)_infinite] bg-brand-purple" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative size-24 animate-[boot-loader-turn_1.2s_steps(8,end)_infinite]"
        >
          <i className="absolute top-0 left-1/2 size-4 -translate-x-1/2 bg-brand-purple" />
          <i className="absolute top-2 right-2 size-4 bg-brand-purple opacity-80" />
          <i className="absolute top-1/2 right-0 size-4 -translate-y-1/2 bg-brand-purple opacity-70" />
          <i className="absolute right-2 bottom-2 size-4 bg-brand-purple opacity-60" />
          <i className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 bg-brand-purple opacity-50" />
          <i className="absolute bottom-2 left-2 size-4 bg-brand-purple opacity-40" />
          <i className="absolute top-1/2 left-0 size-4 -translate-y-1/2 bg-brand-purple opacity-30" />
          <i className="absolute top-2 left-2 size-4 bg-brand-purple opacity-20" />
        </div>
      </section>
    </main>
  );
}
