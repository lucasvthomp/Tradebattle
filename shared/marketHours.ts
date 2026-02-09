/**
 * Shared market hours utility for NYSE trading hours.
 * Used by both server (enforcement) and client (UI indicators).
 */

export function isMarketOpen(): boolean {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = nyTime.getDay(); // 0 = Sunday, 6 = Saturday
  const totalMinutes = nyTime.getHours() * 60 + nyTime.getMinutes();
  const isWeekend = day === 0 || day === 6;
  // NYSE: 9:30 AM (570 min) to 4:00 PM (960 min), Mon-Fri
  return !isWeekend && totalMinutes >= 570 && totalMinutes < 960;
}

export function getMarketStatus(): {
  isOpen: boolean;
  message: string;
} {
  const open = isMarketOpen();
  return {
    isOpen: open,
    message: open
      ? "Market is open"
      : "Market closed. Trading available Mon-Fri 9:30 AM - 4:00 PM ET.",
  };
}
