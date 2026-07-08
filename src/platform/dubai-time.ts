export function formatDubaiDateTime(value: string, includeTime = true): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: includeTime ? "short" : undefined,
    timeZone: "Asia/Dubai",
  }).format(date);
}

export function dubaiInputValue(value?: string | null, defaultOffsetMs = 60 * 60 * 1000): string {
  const date = value ? new Date(value) : new Date(Date.now() + defaultOffsetMs);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Dubai",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
}

export function dubaiLocalToOffset(localValue: string, requireFuture = true): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localValue)) return null;
  const candidate = `${localValue}:00+04:00`;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) return null;
  if (requireFuture && parsed.getTime() <= Date.now()) return null;
  return candidate;
}
