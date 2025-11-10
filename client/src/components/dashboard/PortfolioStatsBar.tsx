import { TrendingUp, TrendingDown, Trophy, DollarSign, Users, Clock } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface PortfolioStatsBarProps {
  portfolioValue: number;
  cashBalance: number;
  profitLoss: number;
  profitLossPercent: number;
  rank?: number;
  totalPlayers?: number;
  selectedTournament?: any;
  activeTournaments?: any[];
  onTournamentChange?: (tournamentId: string) => void;
}

export function PortfolioStatsBar({
  portfolioValue,
  cashBalance,
  profitLoss,
  profitLossPercent,
  rank,
  totalPlayers,
  selectedTournament,
  activeTournaments = [],
  onTournamentChange,
}: PortfolioStatsBarProps) {
  const { formatCurrency } = useUserPreferences();
  const isPositive = profitLoss >= 0;
  const [timeRemaining, setTimeRemaining] = useState("");

  // Calculate time remaining for tournament
  useEffect(() => {
    if (!selectedTournament?.endDate) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(selectedTournament.endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [selectedTournament?.endDate]);

  return (
    <div className="w-full bg-muted/60 backdrop-blur border-b border-border/50 px-4 py-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Tournament Selector */}
        {activeTournaments.length > 0 && selectedTournament && onTournamentChange && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <Select
              value={selectedTournament?.id?.toString() || ""}
              onValueChange={onTournamentChange}
            >
              <SelectTrigger className="w-[180px] h-8 border-0 bg-muted/50">
                <SelectValue placeholder="Select tournament" />
              </SelectTrigger>
              <SelectContent>
                {activeTournaments.map((tournament: any) => (
                  <SelectItem key={tournament.id} value={tournament.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tournament.name}</span>
                      <Badge variant={tournament.tournamentType === "crypto" ? "secondary" : "default"} className="text-xs">
                        {tournament.tournamentType === "crypto" ? "🪙" : "📈"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs font-medium">
              <Users className="w-3 h-3 mr-1" />
              {selectedTournament.currentPlayers}
            </Badge>
          </div>
        )}

        {/* Portfolio Value */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground font-medium">Portfolio</div>
            <div className="text-base font-bold leading-tight">{formatCurrency(portfolioValue)}</div>
          </div>
        </div>

        {/* 4hr Change */}
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground font-medium">Today</div>
            <div className={`text-base font-bold leading-tight ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatCurrency(profitLoss)} ({isPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Rank */}
        {rank && totalPlayers && (
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/10">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-medium">Rank</div>
              <div className="text-base font-bold leading-tight">
                #{rank} <span className="text-xs text-muted-foreground font-normal">/ {totalPlayers}</span>
              </div>
            </div>
          </div>
        )}

        {/* Time Remaining */}
        {timeRemaining && (
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-medium">Time Left</div>
              <div className="text-base font-bold leading-tight text-blue-500">
                {timeRemaining}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
