import { useState } from 'react'

import {
  KEYBOARD_ROWS,
  LOCALIZED_COPY,
  MAX_DISPLAY_NAME_LENGTH,
} from '@/constants/settings'
import type { TouchKeyboardProps } from '@/types/settings'

export function TouchKeyboard({
  language,
  onCancel,
  onSave,
  value,
}: TouchKeyboardProps) {
  const [draft, setDraft] = useState(value)
  const copy = LOCALIZED_COPY[language]

  const addCharacter = (character: string) => {
    setDraft((current) => {
      if (current.length >= MAX_DISPLAY_NAME_LENGTH) return current
      const nextCharacter = current.length
        ? character.toLocaleLowerCase(language)
        : character
      return current + nextCharacter
    })
  }

  return (
    <main className="relative grid h-dvh min-h-0 w-full grid-rows-[62px_minmax(0,1fr)_58px] gap-2 overflow-hidden bg-display-bg p-3.5 px-3.5 [@media(min-width:1100px)_and_(min-height:650px)]:mx-auto [@media(min-width:1100px)_and_(min-height:650px)]:w-[min(100%,1500px)] max-[620px]:px-1.5">
      <div className="overflow-hidden rounded-[10px] bg-display-panel text-center text-[32px] font-bold leading-[62px] text-display-text text-ellipsis whitespace-nowrap max-[620px]:text-2xl">
        {draft || '…'}
      </div>
      <div className="grid min-h-0 grid-rows-3 gap-[7px]">
        {KEYBOARD_ROWS[language].map((row, rowIndex) => (
          <div
            className="flex min-h-0 justify-center gap-[clamp(2px,0.75vw,10px)]"
            key={rowIndex}
          >
            {row.map((character) => (
              <button
                className="min-h-0 w-[clamp(27px,7.75vw,84px)] rounded-lg border-0 bg-[#17171d] text-[clamp(18px,min(3vw,5vh),34px)] font-bold text-display-text outline-none touch-manipulation active:scale-[0.97] active:bg-[#282833]"
                key={character}
                onClick={() => addCharacter(character)}
                type="button"
              >
                {character}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        <button
          className="min-w-[100px] rounded-[9px] border-0 bg-[#17171d] text-xl font-bold text-[#81818c] outline-none touch-manipulation active:scale-[0.97] active:bg-[#282833]"
          onClick={onCancel}
          type="button"
        >
          {copy.cancel}
        </button>
        <button
          aria-label={language === 'de' ? 'Löschen' : 'Backspace'}
          className="min-w-[100px] rounded-[9px] border-0 bg-[#17171d] text-xl font-bold text-[#d6d6df] outline-none touch-manipulation active:scale-[0.97] active:bg-[#282833]"
          onClick={() => setDraft((current) => current.slice(0, -1))}
          type="button"
        >
          ⌫
        </button>
        <button
          className="min-w-[210px] rounded-[9px] border-0 bg-[#17171d] text-xl font-bold text-[#d6d6df] outline-none touch-manipulation active:scale-[0.97] active:bg-[#282833]"
          onClick={() =>
            setDraft((current) =>
              current.length < MAX_DISPLAY_NAME_LENGTH ? `${current} ` : current,
            )
          }
          type="button"
        >
          {copy.space}
        </button>
        <button
          className="min-w-[130px] rounded-[9px] border-0 bg-amber-500 text-xl font-bold text-display-bg outline-none touch-manipulation active:scale-[0.97] active:bg-[#282833]"
          onClick={() => onSave(draft.trim())}
          type="button"
        >
          {copy.save}
        </button>
      </div>
    </main>
  )
}
