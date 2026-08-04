const updatedAtFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function formatUpdatedAt(updatedAt: string) {
  return updatedAtFormatter.format(new Date(updatedAt));
}
