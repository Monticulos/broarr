// Deterministic ID makes favorites in local storage stable across runs
export function generateEventId(sourceName: string, dateTime: string): string {
  const normalizedDateTime = new Date(dateTime).toISOString();
  const normalizedSourceName = sourceName.replaceAll(" ", "-");
  return `${normalizedSourceName}-${normalizedDateTime}`;
}
