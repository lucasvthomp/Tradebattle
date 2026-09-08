/**
 * Shared market-hours utility for stock arenas.
 *
 * This is intentionally used by both the API and the trading UI so an order
 * cannot look available in the browser while the server rejects it. It keeps
 * the session in Eastern Time, including daylight-saving changes, without
 * relying on the machine's local timezone.
 */

const TIMEZONE = "America/New_York";
const OPEN_MINUTES = 9 * 60 + 30;
const CLOSE_MINUTES = 16 * 60;

interface EasternParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  second: number;
}

export interface MarketStatus {
  isOpen: boolean;
  phase: "open" | "closed";
  timezone: "ET";
  minutesUntilEvent: number;
  nextOpenLabel: string;
  closeLabel: string;
  message: string;
}

function easternParts(date: Date): EasternParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value || "0";
  const weekdayValue = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, weekday: "short" }).format(date);
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdays[weekdayValue] ?? 0,
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

function labelForEasternDate(date: Date, includeDay = true): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: includeDay ? "short" : undefined,
    month: includeDay ? "short" : undefined,
    day: includeDay ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  }).format(date) + " ET";
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours < 24) return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function getMarketStatus(now = new Date()): MarketStatus {
  const current = easternParts(now);
  const currentMinutes = current.hour * 60 + current.minute;
  const isWeekday = current.weekday >= 1 && current.weekday <= 5;
  const isOpen = isWeekday && currentMinutes >= OPEN_MINUTES && currentMinutes < CLOSE_MINUTES;

  // Treat the Eastern calendar as a UTC-backed calendar so adding a day never
  // crosses a DST boundary incorrectly. Labels are explicitly rendered as ET.
  const easternNow = new Date(Date.UTC(current.year, current.month - 1, current.day, current.hour, current.minute, current.second));
  const closeToday = new Date(Date.UTC(current.year, current.month - 1, current.day, 16, 0, 0));

  if (isOpen) {
    const minutesUntilClose = Math.max(1, Math.ceil((closeToday.getTime() - easternNow.getTime()) / 60000));
    return {
      isOpen: true,
      phase: "open",
      timezone: "ET",
      minutesUntilEvent: minutesUntilClose,
      nextOpenLabel: "",
      closeLabel: labelForEasternDate(closeToday, false),
      message: `Open · closes in ${formatMinutes(minutesUntilClose)}`,
    };
  }

  const nextOpen = new Date(easternNow);
  if (!isWeekday || currentMinutes >= CLOSE_MINUTES) {
    nextOpen.setUTCDate(nextOpen.getUTCDate() + 1);
    while (nextOpen.getUTCDay() === 0 || nextOpen.getUTCDay() === 6) {
      nextOpen.setUTCDate(nextOpen.getUTCDate() + 1);
    }
  }
  nextOpen.setUTCHours(9, 30, 0, 0);

  const minutesUntilOpen = Math.max(1, Math.ceil((nextOpen.getTime() - easternNow.getTime()) / 60000));
  const nextOpenLabel = labelForEasternDate(nextOpen);
  return {
    isOpen: false,
    phase: "closed",
    timezone: "ET",
    minutesUntilEvent: minutesUntilOpen,
    nextOpenLabel,
    closeLabel: "",
    message: `Closed · opens ${nextOpenLabel} (${formatMinutes(minutesUntilOpen)})`,
  };
}

export function isMarketOpen(now = new Date()): boolean {
  return getMarketStatus(now).isOpen;
}
