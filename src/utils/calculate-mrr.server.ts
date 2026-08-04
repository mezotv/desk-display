import '@tanstack/react-start/server-only'

import { Effect, Option } from 'effect'
import Stripe from 'stripe'

import {
  DEMO_MRR_MINOR,
  FALLBACK_CURRENCY,
} from '@/constants/dashboard'
import { decodeStripeEnvironment } from '@/schemas/environment'
import { StripeServiceError } from '@/schemas/service-error'
import { serverRuntime } from '@/runtime/server-runtime'
import type {
  MrrSnapshot,
  RecurringItemAmount,
} from '@/types/mrr'
import {
  isRecurringInterval,
  normalizeRecurringAmount,
} from '@/utils/normalize-recurring-amount'

function createDemoSnapshot(warning: string | null): MrrSnapshot {
  return {
    activeSubscriptions: 0,
    amountMinor: DEMO_MRR_MINOR,
    configured: false,
    currency: process.env.DISPLAY_CURRENCY?.toLowerCase() ?? FALLBACK_CURRENCY,
    source: 'demo',
    updatedAt: new Date().toISOString(),
    warning,
  }
}

function getTierAmount(
  amount: number | null,
  amountDecimal: string | { toString(): string } | null,
): number | null {
  if (amountDecimal !== null) {
    const parsedAmount = Number(amountDecimal.toString())
    return Number.isFinite(parsedAmount) ? parsedAmount : null
  }

  return amount
}

function calculateTieredAmount(price: Stripe.Price, quantity: number) {
  const tiers = price.tiers

  if (!tiers || tiers.length === 0 || quantity <= 0) {
    return tiers ? 0 : null
  }

  if (price.tiers_mode === 'volume') {
    const tier = tiers.find(
      ({ up_to: upperLimit }) =>
        upperLimit === null || quantity <= upperLimit,
    )
    const unitAmount = tier
      ? getTierAmount(tier.unit_amount, tier.unit_amount_decimal)
      : null
    const flatAmount = tier
      ? getTierAmount(tier.flat_amount, tier.flat_amount_decimal)
      : null

    return tier && (unitAmount !== null || flatAmount !== null)
      ? quantity * (unitAmount ?? 0) + (flatAmount ?? 0)
      : null
  }

  if (price.tiers_mode !== 'graduated') {
    return null
  }

  let amount = 0
  let previousUpperLimit = 0

  for (const tier of tiers) {
    const upperLimit = tier.up_to ?? quantity
    const unitsInTier = Math.max(
      0,
      Math.min(quantity, upperLimit) - previousUpperLimit,
    )

    if (unitsInTier > 0) {
      const unitAmount = getTierAmount(
        tier.unit_amount,
        tier.unit_amount_decimal,
      )
      const flatAmount = getTierAmount(
        tier.flat_amount,
        tier.flat_amount_decimal,
      )

      if (unitAmount === null && flatAmount === null) {
        return null
      }

      amount += unitsInTier * (unitAmount ?? 0) + (flatAmount ?? 0)
    }

    if (quantity <= upperLimit) {
      break
    }

    previousUpperLimit = upperLimit
  }

  return amount
}

function applySubscriptionDiscounts(
  itemAmounts: RecurringItemAmount[],
  discounts: Array<string | Stripe.Discount>,
) {
  let unsupportedDiscounts = 0

  for (const discount of discounts) {
    if (
      typeof discount === 'string' ||
      (discount.end !== null && discount.end <= Date.now() / 1_000)
    ) {
      unsupportedDiscounts += typeof discount === 'string' ? 1 : 0
      continue
    }

    const { coupon } = discount.source

    if (typeof coupon === 'string' || coupon === null) {
      unsupportedDiscounts += 1
      continue
    }

    const applicableProducts = coupon.applies_to?.products
    const eligibleItems = applicableProducts
      ? itemAmounts.filter(({ productId }) =>
          applicableProducts.includes(productId),
        )
      : itemAmounts

    if (coupon.percent_off !== null) {
      const multiplier = Math.max(0, 1 - coupon.percent_off / 100)

      for (const item of eligibleItems) {
        item.amountMinor *= multiplier
      }

      continue
    }

    unsupportedDiscounts += 1
  }

  return unsupportedDiscounts
}

async function calculateStripeMrr(
  secretKey: string,
  configuredCurrency?: string,
): Promise<MrrSnapshot> {
    const stripe = new Stripe(secretKey, {
      maxNetworkRetries: 2,
    })
    const pricesById = new Map<string, Promise<Stripe.Price>>()
    const totalsByCurrency = new Map<string, number>()
    let activeSubscriptions = 0
    let unsupportedDiscounts = 0
    let unsupportedPrices = 0

    for await (const subscription of stripe.subscriptions.list({
      expand: ['data.discounts.source.coupon'],
      limit: 100,
      status: 'active',
    })) {
      if (
        subscription.cancel_at_period_end ||
        subscription.cancel_at !== null
      ) {
        continue
      }

      const items = subscription.items.has_more
        ? await stripe.subscriptionItems
            .list({ limit: 100, subscription: subscription.id })
            .autoPagingToArray({ limit: 1_000 })
        : subscription.items.data
      const recurringItemAmounts: RecurringItemAmount[] = []

      for (const item of items) {
        let { price } = item
        const recurring = price.recurring

        if (!recurring || recurring.usage_type === 'metered') {
          continue
        }

        if (price.billing_scheme === 'tiered' && !price.tiers) {
          let priceRequest = pricesById.get(price.id)

          if (!priceRequest) {
            priceRequest = stripe.prices.retrieve(price.id, {
              expand: ['tiers'],
            })
            pricesById.set(price.id, priceRequest)
          }

          price = await priceRequest
        }

        const quantity = item.quantity ?? 1
        const unitAmountMinor = getTierAmount(
          price.unit_amount,
          price.unit_amount_decimal,
        )
        const recurringAmountMinor =
          price.billing_scheme === 'tiered'
            ? calculateTieredAmount(price, quantity)
            : unitAmountMinor === null
              ? null
              : unitAmountMinor * quantity

        if (
          recurringAmountMinor === null ||
          !Number.isFinite(recurringAmountMinor)
        ) {
          unsupportedPrices += 1
          continue
        }

        if (!isRecurringInterval(recurring.interval)) {
          unsupportedPrices += 1
          continue
        }

        const monthlyAmount = normalizeRecurringAmount(
          recurringAmountMinor,
          1,
          recurring.interval,
          recurring.interval_count,
        )
        const currency = price.currency.toLowerCase()
        const productId =
          typeof price.product === 'string' ? price.product : price.product.id

        recurringItemAmounts.push({
          amountMinor: monthlyAmount,
          currency,
          productId,
        })
      }

      unsupportedDiscounts += applySubscriptionDiscounts(
        recurringItemAmounts,
        subscription.discounts,
      )
      const subscriptionMrr = recurringItemAmounts.reduce(
        (sum, { amountMinor }) => sum + amountMinor,
        0,
      )

      for (const { amountMinor, currency } of recurringItemAmounts) {
        if (amountMinor <= 0) {
          continue
        }

        totalsByCurrency.set(
          currency,
          (totalsByCurrency.get(currency) ?? 0) + amountMinor,
        )
      }

      if (subscriptionMrr > 0) {
        activeSubscriptions += 1
      }
    }

    const selectedCurrency =
      configuredCurrency ??
      [...totalsByCurrency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      FALLBACK_CURRENCY
    const currencyCount = totalsByCurrency.size
    const warnings = [
      currencyCount > 1 && !configuredCurrency
        ? `Showing ${selectedCurrency.toUpperCase()} from ${currencyCount} currencies`
        : null,
      unsupportedPrices > 0
        ? `${unsupportedPrices} unsupported recurring prices were skipped`
        : null,
      unsupportedDiscounts > 0
        ? `${unsupportedDiscounts} unsupported discounts were skipped`
        : null,
    ].filter(Boolean)

    return {
      activeSubscriptions,
      amountMinor: Math.round(totalsByCurrency.get(selectedCurrency) ?? 0),
      configured: true,
      currency: selectedCurrency,
      source: 'stripe',
      updatedAt: new Date().toISOString(),
      warning: warnings.length > 0 ? warnings.join(' · ') : null,
    }
}

const calculateStripeMrrEffect = Effect.fn('Stripe.calculateMrr')(
  (secretKey: string, configuredCurrency?: string) =>
    Effect.tryPromise({
      catch: (cause) =>
        new StripeServiceError({
          cause,
          message: 'Unable to refresh Stripe MRR',
        }),
      try: () => calculateStripeMrr(secretKey, configuredCurrency),
    }),
)

export function calculateMrr(): Promise<MrrSnapshot> {
  const environment = decodeStripeEnvironment({
    DISPLAY_CURRENCY: process.env.DISPLAY_CURRENCY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  })

  if (Option.isNone(environment)) {
    return Promise.resolve(
      createDemoSnapshot('Add your restricted Stripe key to go live'),
    )
  }

  const configuredCurrency = environment.value.DISPLAY_CURRENCY?.toLowerCase()

  return serverRuntime.runPromise(
    calculateStripeMrrEffect(
      environment.value.STRIPE_SECRET_KEY,
      configuredCurrency,
    ).pipe(
      Effect.tapError(Effect.logError),
      Effect.catch(() =>
        Effect.succeed(
          createDemoSnapshot('Stripe is temporarily unavailable'),
        ),
      ),
    ),
  )
}
