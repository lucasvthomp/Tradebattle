import { TradebattleIcon } from "@/components/tradebattle-icons";
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
    <div className="w-full border-b border-border/50 px-6 py-3" style={{ backgroundColor: 'transparent' }}>
      <div className="flex items-center gap-6">
        {/* Tournament Selector */}
        {activeTournaments.length > 0 && selectedTournament && onTournamentChange && (
          <div className="flex items-center gap-2">
            <TradebattleIcon name="rankings" className="w-4 h-4" style={{ color: '#F2C76A' }} />
            <Select
              value={selectedTournament?.id?.toString() || ""}
              onValueChange={onTournamentChange}
            >
              <SelectTrigger className="w-[200px] h-9 border-0" style={{ backgroundColor: '#0C1A2E', color: '#F1F5F9' }}>
                <SelectValue placeholder="Select arena" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'transparent', borderColor: '#0E2040' }}>
                {activeTournaments.map((tournament: any) => (
                  <SelectItem key={tournament.id} value={tournament.id.toString()} style={{ color: '#F1F5F9' }}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Total Portfolio Value with Cash/Stock breakdown */}
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-white">{formatCurrency(portfolioValue)}</div>
          <div className="flex flex-col text-xs leading-tight" style={{ color: '#94A3B8' }}>
            <div>Buying power: {formatCurrency(cashBalance)}</div>
            <div>Positions: {formatCurrency(stockHoldingsValue)}</div>
          </div>
        </div>

        {/* Today's Return */}
        <div className={`text-base font-semibold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
          {isPositive ? '+' : ''}{formatCurrency(profitLoss)} ({isPositive ? '▲' : '▼'} {Math.abs(profitLossPercent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)
        </div>

        {/* Time Remaining */}
        {timeRemaining && (
          <div className="text-base font-medium" style={{ color: '#F1F5F9' }}>
            {timeRemaining}
          </div>
        )}

        {/* Current Rank */}
        {rank && totalPlayers && (
          <div className="text-base font-semibold" style={{ color: '#F2C76A' }}>
            Place #{rank}/{totalPlayers}
          </div>
        )}
      </div>
    </div>
  );
}
