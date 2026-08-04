const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amountMinor: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  let formatter = currencyFormatters.get(normalizedCurrency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      currency: normalizedCurrency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      style: "currency",
    });
    currencyFormatters.set(normalizedCurrency, formatter);
  }

  return formatter.format(amountMinor / 100);
}
