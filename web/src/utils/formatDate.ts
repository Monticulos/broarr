const NORWEGIAN_LOCALE = "nb-NO";

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat(NORWEGIAN_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatUpdatedAtDate(iso: string): string {
  return new Intl.DateTimeFormat(NORWEGIAN_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
