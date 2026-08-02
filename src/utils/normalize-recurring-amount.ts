import type { RecurringInterval } from '@/types/mrr'

export function isRecurringInterval(
  interval: string,
): interval is RecurringInterval {
  return ['day', 'week', 'month', 'year'].includes(interval)
}

export function normalizeRecurringAmount(
  unitAmountMinor: number,
  quantity: number,
  interval: RecurringInterval,
  intervalCount: number,
) {
  const intervalMultipliers: Record<RecurringInterval, number> = {
    day: 365 / 12,
    week: 52 / 12,
    month: 1,
    year: 1 / 12,
  }

  return (
    unitAmountMinor *
    quantity *
    (intervalMultipliers[interval] / intervalCount)
  )
}
