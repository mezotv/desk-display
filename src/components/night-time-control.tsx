import { NIGHT_MODE_TIME_STEP_MINUTES } from '@/constants/settings'
import { PixelIcon } from '@/components/pixel-icon'
import type { NightTimeControlProps } from '@/types/settings'
import { shiftClockTime } from '@/utils/night-mode-time'

export function NightTimeControl({
  label,
  onChange,
  value,
}: NightTimeControlProps) {
  return (
    <div className="grid min-w-0 grid-cols-[26px_minmax(0,1fr)_26px] grid-rows-[16px_minmax(42px,1fr)] gap-x-0.5 gap-y-[3px] [@media(min-width:1100px)_and_(min-height:650px)]:grid-cols-[44px_minmax(0,1fr)_44px] [@media(min-width:1100px)_and_(min-height:650px)]:grid-rows-[20px_minmax(56px,1fr)] [@media(min-width:1100px)_and_(min-height:650px)]:gap-x-1 [@media(max-width:620px)_and_(orientation:portrait)]:grid-cols-[30px_minmax(0,1fr)_30px] max-[370px]:grid-cols-[26px_minmax(0,1fr)_26px]">
      <span className="col-span-full overflow-hidden text-center text-[11px] font-bold tracking-[0.08em] text-ellipsis whitespace-nowrap text-[#777784] [@media(min-width:1100px)_and_(min-height:650px)]:text-[15px]">
        {label}
      </span>
      <button
        aria-label={`${label} -${NIGHT_MODE_TIME_STEP_MINUTES}`}
        className="grid min-w-0 touch-manipulation cursor-pointer place-items-center rounded-lg border-0 bg-[#17171d] font-mono text-[22px] font-bold leading-none text-amber-500 active:scale-[0.94] active:bg-[#282833] [@media(min-width:1100px)_and_(min-height:650px)]:text-[32px]"
        onClick={() =>
          onChange(shiftClockTime(value, -NIGHT_MODE_TIME_STEP_MINUTES))
        }
        type="button"
      >
        <PixelIcon className="size-[18px]" name="minus" />
      </button>
      <time className="grid min-w-0 place-items-center overflow-hidden rounded-lg border-0 bg-[#17171d] text-[clamp(17px,min(2.25vw,3.75vh),25px)] font-bold whitespace-nowrap text-display-text max-[370px]:text-[17px]">
        {value}
      </time>
      <button
        aria-label={`${label} +${NIGHT_MODE_TIME_STEP_MINUTES}`}
        className="grid min-w-0 touch-manipulation cursor-pointer place-items-center rounded-lg border-0 bg-[#17171d] font-mono text-[22px] font-bold leading-none text-amber-500 active:scale-[0.94] active:bg-[#282833] [@media(min-width:1100px)_and_(min-height:650px)]:text-[32px]"
        onClick={() =>
          onChange(shiftClockTime(value, NIGHT_MODE_TIME_STEP_MINUTES))
        }
        type="button"
      >
        <PixelIcon className="size-[18px]" name="plus" />
      </button>
    </div>
  )
}
