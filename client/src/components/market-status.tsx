import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Globe, Moon, Sun } from "lucide-react";

interface MarketStatusProps {
  variant?: "badge" | "card" | "inline";
  showScheduleNote?: boolean;
}

export function MarketStatus({ variant = "badge", showScheduleNote = false }: MarketStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [timeUntilOpen, setTimeUntilOpen] = useState("");
  const [timeUntilClose, setTimeUntilClose] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Calculate market status (NYSE hours: 9:30 AM - 4:00 PM ET, Mon-Fri)
      const nyTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
      const day = nyTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = nyTime.getHours();
      const minute = nyTime.getMinutes();
      const totalMinutes = hour * 60 + minute;
      
      // Market is closed on weekends (Saturday = 6, Sunday = 0)
      const isWeekend = day === 0 || day === 6;
      
      // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes)
      const marketOpen = 9 * 60 + 30; // 9:30 AM in minutes
      const marketClose = 16 * 60; // 4:00 PM in minutes
      
      const isOpen = !isWeekend && totalMinutes >= marketOpen && totalMinutes < marketClose;
      setIsMarketOpen(isOpen);
      
      // Calculate time until next market event
      if (isOpen) {
        // Market is open, calculate time until close
        const minutesUntilClose = marketClose - totalMinutes;
        const hoursUntilClose = Math.floor(minutesUntilClose / 60);
        const minsUntilClose = minutesUntilClose % 60;
        setTimeUntilClose(`${hoursUntilClose}h ${minsUntilClose}m`);
        setTimeUntilOpen("");
      } else {
        // Market is closed, calculate time until open
        let minutesUntilOpen;
        
        if (isWeekend) {
          // If it's weekend, calculate until Monday 9:30 AM
          const daysUntilMonday = day === 0 ? 1 : (7 - day + 1); // If Sunday, 1 day. Otherwise, days until next Monday
          minutesUntilOpen = (daysUntilMonday * 24 * 60) + marketOpen - totalMinutes;
        } else if (totalMinutes < marketOpen) {
          // Same day, before market open
          minutesUntilOpen = marketOpen - totalMinutes;
        } else {
          // Same day, after market close - next trading day
          minutesUntilOpen = (24 * 60) - totalMinutes + marketOpen;
        }
        
        const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
        const minsUntilOpen = minutesUntilOpen % 60;
        
        if (hoursUntilOpen >= 24) {
          const daysUntilOpen = Math.floor(hoursUntilOpen / 24);
          const remainingHours = hoursUntilOpen % 24;
          setTimeUntilOpen(`${daysUntilOpen}d ${remainingHours}h`);
        } else {
          setTimeUntilOpen(`${hoursUntilOpen}h ${minsUntilOpen}m`);
        }
        setTimeUntilClose("");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = () => {
    return isMarketOpen ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = () => {
    return isMarketOpen ? "Markets Open" : "Markets Closed";
  };

  const getStatusIcon = () => {
    return isMarketOpen ? Sun : Moon;
  };

  const StatusIcon = getStatusIcon();

  if (variant === "badge") {
    return (
      <Badge variant="secondary" className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isMarketOpen ? 'animate-pulse' : ''}`}></div>
        <StatusIcon className="w-3 h-3" />
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border/50">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Market {isMarketOpen ? (
            <span className="text-green-600 dark:text-green-400">Open</span>
          ) : (
            <span className="text-orange-600 dark:text-orange-400">Closed</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <Card className={`border-0 ${isMarketOpen ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isMarketOpen ? 'animate-pulse' : ''}`}></div>
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            NYSE
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {isMarketOpen ? (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Closes in {timeUntilClose}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Opens in {timeUntilOpen}</span>
            </div>
          )}
        </div>

        {showScheduleNote && !isMarketOpen && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs text-blue-800 dark:text-blue-200">
            <strong>Off-Market Trading:</strong> Stock orders placed now will be scheduled and executed when markets open.
          </div>
        )}
      </CardContent>
    </Card>
  );
}