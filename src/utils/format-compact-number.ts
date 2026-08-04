const compactNumberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
  notation: "compact",
});

export function formatCompactNumber(value: number) {
  return compactNumberFormatter.format(value);
}
