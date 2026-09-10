export const JST_OFFSET_MINUTES = 9 * 60;

export type TimeOfDay = "morning" | "day" | "evening" | "night";

export function toJst(date: Date): Date {
  return new Date(date.getTime() + JST_OFFSET_MINUTES * 60_000);
}

export function jstHour(date: Date = new Date()): number {
  return toJst(date).getUTCHours();
}

export function timeOfDay(date: Date = new Date()): TimeOfDay {
  const h = jstHour(date);
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export function formatJst(iso: string): string {
  const d = toJst(new Date(iso));
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCFullYear()}/${mm}/${dd} ${hh}:${mi}`;
}

export function jstDateKey(iso: string): string {
  return toJst(new Date(iso)).toISOString().slice(0, 10);
}

export function daysSince(iso: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}
