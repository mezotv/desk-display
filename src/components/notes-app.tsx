import { useState } from "react";

import { TouchAppShell } from "@/components/touch-app-shell";
import { TouchKeyboard } from "@/components/touch-keyboard";
import {
  MAX_NOTE_LENGTH,
  PRODUCTIVITY_COPY,
} from "@/constants/productivity";
import type { NotesAppProps } from "@/types/productivity";

export function NotesApp({
  language,
  note,
  onChange,
  onHome,
}: NotesAppProps) {
  const [editing, setEditing] = useState(false);
  const copy = PRODUCTIVITY_COPY[language];

  if (editing) {
    return (
      <TouchKeyboard
        language={language}
        maxLength={MAX_NOTE_LENGTH}
        onCancel={() => setEditing(false)}
        onSave={(nextNote) => {
          onChange(nextNote);
          setEditing(false);
        }}
        placeholder={copy.emptyNote}
        value={note}
      />
    );
  }

  return (
    <TouchAppShell
      accent="#facc15"
      icon="/logos/notes-pixel.svg"
      onHome={onHome}
      title={copy.note}
    >
      <button
        className="grid h-full w-full touch-manipulation grid-rows-[minmax(0,1fr)_auto] place-items-center gap-3 rounded-[16px] border border-[#3b3516] bg-[#171508] p-[clamp(18px,4vw,48px)] text-yellow-300 outline-none active:scale-[0.99] active:bg-[#1e1b0a]"
        onClick={() => setEditing(true)}
        type="button"
      >
        <span
          className={`max-h-full max-w-[min(90vw,1100px)] overflow-hidden text-center text-[clamp(34px,min(5vw,8.5vh),74px)] font-extrabold leading-[1.16] tracking-[0.02em] ${
            note ? "text-yellow-200" : "text-[#6d642b]"
          }`}
        >
          {note || copy.emptyNote}
        </span>
        <span className="rounded-[10px] bg-yellow-400 px-[clamp(22px,4vw,42px)] py-[clamp(9px,1.8vh,16px)] text-[clamp(17px,min(2.3vw,3.8vh),26px)] font-extrabold text-display-bg">
          {copy.edit}
        </span>
      </button>
    </TouchAppShell>
  );
}
