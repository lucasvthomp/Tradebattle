import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle } from "lucide-react";

interface MarketHours {
  isOpen: boolean;
  nextOpen: Date | null;
  timezone: string;
}

export function MarketStatusDisclaimer() {
  const [marketStatus, setMarketStatus] = useState<MarketHours | null>(null);

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = easternTime.getDay();
      const hour = easternTime.getHours();
      const minute = easternTime.getMinutes();
      const currentTime = hour * 60 + minute; // Convert to minutes

      // Market hours: Monday-Friday 9:30 AM - 4:00 PM ET
      const marketOpen = 9 * 60 + 30; // 9:30 AM in minutes
      const marketClose = 16 * 60; // 4:00 PM in minutes

      // Check if it's a weekday and within market hours
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isDuringMarketHours = currentTime >= marketOpen && currentTime < marketClose;
      const isOpen = isWeekday && isDuringMarketHours;

      let nextOpen: Date | null = null;

      if (!isOpen) {
        // Calculate next market open
        const nextOpenDate = new Date(easternTime);
        
        if (isWeekday && currentTime < marketOpen) {
          // Same day, before market open
          nextOpenDate.setHours(9, 30, 0, 0);
        } else if (isWeekday && currentTime >= marketClose) {
          // Same day, after market close - next business day
          nextOpenDate.setDate(nextOpenDate.getDate() + 1);
          nextOpenDate.setHours(9, 30, 0, 0);
          // Skip weekend
          if (nextOpenDate.getDay() === 6) { // Saturday
            nextOpenDate.setDate(nextOpenDate.getDate() + 2);
          } else if (nextOpenDate.getDay() === 0) { // Sunday
            nextOpenDate.setDate(nextOpenDate.getDate() + 1);
          }
        } else {
          // Weekend - next Monday
          const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // Sunday = 1 day, Saturday = 2 days
          nextOpenDate.setDate(nextOpenDate.getDate() + daysUntilMonday);
          nextOpenDate.setHours(9, 30, 0, 0);
        }

        nextOpen = nextOpenDate;
      }

      setMarketStatus({
        isOpen,
        nextOpen,
        timezone: "ET"
      });
    };

    // Check immediately
    checkMarketStatus();

    // Update every minute
    const interval = setInterval(checkMarketStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!marketStatus || marketStatus.isOpen) {
    return null;
  }

  const formatNextOpen = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/New_York'
      })} ET`;
    } else {
      return `${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/New_York'
      })} ET`;
    }
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <strong>Stock Market is Closed</strong> - Will reopen {marketStatus.nextOpen && formatNextOpen(marketStatus.nextOpen)}
          </div>
          <div className="text-sm">
            Only crypto tournaments available • Stock trades scheduled for market open
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}