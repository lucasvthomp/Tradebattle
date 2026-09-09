import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, Globe, Moon, Sun } from "lucide-react";
import { getMarketStatus } from "@shared/marketHours";

interface MarketStatusProps {
  variant?: "badge" | "card" | "inline" | "clock";
  showScheduleNote?: boolean;
}

const formatCountdown = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

export function MarketStatus({ variant = "badge", showScheduleNote = false }: MarketStatusProps) {
  const [marketStatus, setMarketStatus] = useState(() => getMarketStatus());

  useEffect(() => {
    const timer = setInterval(() => setMarketStatus(getMarketStatus()), 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = () => {
    return marketStatus.isOpen ? "var(--tb-gold-500)" : "var(--tb-purple-400)";
  };

  const getStatusText = () => {
    return marketStatus.isOpen ? "Markets Open" : "Markets Closed";
  };

  const getStatusIcon = () => {
    return marketStatus.isOpen ? Sun : Moon;
  };

  const StatusIcon = getStatusIcon();

  if (variant === "badge") {
    return (
      <Badge variant="secondary" className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'animate-pulse' : ''}`} style={{ background: getStatusColor() }}></div>
        <StatusIcon className="w-3 h-3" />
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border/50">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium" style={{ color: "var(--tb-text-muted)" }}>
          Market {marketStatus.isOpen ? (
            <span style={{ color: "var(--tb-gold-500)" }}>Open</span>
          ) : (
            <span style={{ color: "var(--tb-purple-400)" }}>Closed</span>
          )}
        </span>
      </div>
    );
  }

  if (variant === "clock") {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 cursor-help">
              <Clock
                className={`w-5 h-5 ${
                marketStatus.isOpen
                    ? "text-[#F3C65B]"
                    : "text-[var(--tb-purple-400)]"
                }`}
              />
              <span className="text-sm font-medium tabular-nums" style={{ color: marketStatus.isOpen ? "var(--tb-gold-500)" : "var(--tb-purple-400)" }}>
                {formatCountdown(marketStatus.minutesUntilEvent)}
                </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-xs backdrop-blur-md border-2"
            style={{
              backgroundColor: 'var(--tb-surface-800)',
              borderColor: 'var(--tb-purple-edge)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px var(--tb-purple-glow)'
            }}
          >
            <div className="space-y-2">
              <div className="font-semibold" style={{ color: 'var(--tb-text-strong)' }}>Market window (NYSE)</div>
            <div className="text-xs space-y-1" style={{ color: 'var(--tb-text-muted)' }}>
                <div>Monday - Friday</div>
                <div>9:30 AM - 4:00 PM ET</div>
                <div className="pt-2 border-t" style={{ borderColor: 'var(--tb-purple-edge)' }}>
                  {marketStatus.isOpen ? (
                    <span className="font-medium" style={{ color: 'var(--tb-gold-500)' }}>Currently Open - Closes {marketStatus.closeLabel}</span>
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--tb-purple-400)' }}>Currently Closed - Opens {marketStatus.nextOpenLabel}</span>
                  )}
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
      <Card className="border-0" style={{ background: marketStatus.isOpen ? "var(--tb-gold-wash)" : "var(--tb-purple-wash)" }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${marketStatus.isOpen ? 'animate-pulse' : ''}`} style={{ background: getStatusColor() }}></div>
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            NYSE
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {marketStatus.isOpen ? (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Closes {marketStatus.closeLabel}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Opens {marketStatus.nextOpenLabel}</span>
            </div>
          )}
        </div>

        {showScheduleNote && !marketStatus.isOpen && (
          <div className="mt-3 p-2 rounded text-xs" style={{ background: "var(--tb-purple-wash)", color: "var(--tb-text)", border: "1px solid var(--tb-purple-edge)" }}>
            Stock trades are paused until the next market open.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
