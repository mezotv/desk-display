export function formatCurrency(amountMinor: number, currency: string) {
  const amount = amountMinor / 100

  return new Intl.NumberFormat('en-US', {
    currency: currency.toUpperCase(),
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount)
}
