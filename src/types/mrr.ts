export type MrrSnapshot = {
  activeSubscriptions: number
  amountMinor: number
  configured: boolean
  currency: string
  source: 'demo' | 'stripe'
  updatedAt: string
  warning: string | null
}

export type RecurringInterval = 'day' | 'month' | 'week' | 'year'

export type RecurringItemAmount = {
  amountMinor: number
  currency: string
  productId: string
}
