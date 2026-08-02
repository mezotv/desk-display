const MINUTES_PER_DAY = 24 * 60

function clockTimeToMinutes(value: string) {
  const [hours = '0', minutes = '0'] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function shiftClockTime(value: string, offsetMinutes: number) {
  const shiftedMinutes =
    (clockTimeToMinutes(value) + offsetMinutes + MINUTES_PER_DAY) %
    MINUTES_PER_DAY
  const hours = Math.floor(shiftedMinutes / 60)
  const minutes = shiftedMinutes % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`
}

export function isNightModeActive(
  now: Date,
  enabled: boolean,
  start: string,
  end: string,
) {
  if (!enabled) return false

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = clockTimeToMinutes(start)
  const endMinutes = clockTimeToMinutes(end)

  if (startMinutes === endMinutes) return false
  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes
}
