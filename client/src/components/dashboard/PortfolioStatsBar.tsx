import { Trophy } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const stockHoldingsValue = portfolioValue - cashBalance;
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
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [selectedTournament?.endDate]);

  return (
    <div className="w-full bg-secondary border-b border-border/50 px-6 py-3">
      <div className="flex items-center gap-8">
        {/* Tournament Selector */}
        {activeTournaments.length > 0 && selectedTournament && onTournamentChange && (
          <Select
            value={selectedTournament?.id?.toString() || ""}
            onValueChange={onTournamentChange}
          >
            <SelectTrigger className="w-[200px] h-9 border border-border">
              <SelectValue placeholder="Select tournament" />
            </SelectTrigger>
            <SelectContent>
              {activeTournaments.map((tournament: any) => (
                <SelectItem key={tournament.id} value={tournament.id.toString()}>
                  {tournament.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Total Portfolio Value with Cash/Stock breakdown */}
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold">{formatCurrency(portfolioValue)}</div>
          <div className="flex flex-col text-xs text-muted-foreground">
            <div>Cash: {formatCurrency(cashBalance)}</div>
            <div>Stock: {formatCurrency(stockHoldingsValue)}</div>
          </div>
        </div>

        {/* Today's Return */}
        <div className={`font-semibold ${isPositive ? 'text-[#28C76F]' : 'text-[#FF4F58]'}`}>
          {isPositive ? '+' : ''}{formatCurrency(profitLoss)} ({isPositive ? '▲' : '▼'} {Math.abs(profitLossPercent).toFixed(2)}%)
        </div>

        {/* Time Remaining */}
        {timeRemaining && (
          <div className="font-semibold">
            {timeRemaining}
          </div>
        )}

        {/* Current Rank */}
        {rank && totalPlayers && (
          <div className="font-semibold">
            Rank #{rank} / {totalPlayers}
          </div>
        )}
      </div>
    </div>
  );
}
