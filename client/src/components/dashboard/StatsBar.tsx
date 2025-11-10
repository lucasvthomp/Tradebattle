import { TrendingUp, TrendingDown, DollarSign, Activity, Trophy } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface StatsBarProps {
  portfolioValue: number;
  cashBalance: number;
  profitLoss: number;
  profitLossPercent: number;
  change4h?: number;
  change4hPercent?: number;
  selectedTournament?: any;
  tournaments?: any[];
  onTournamentChange?: (tournamentId: string) => void;
}

export function StatsBar({
  portfolioValue,
  cashBalance,
  profitLoss,
  profitLossPercent,
  change4h = 0,
  change4hPercent = 0,
  selectedTournament,
  tournaments = [],
  onTournamentChange
}: StatsBarProps) {
  const { formatCurrency } = useUserPreferences();

  const is4hPositive = change4hPercent >= 0;
  const isProfitPositive = profitLossPercent >= 0;

  return (
    <div className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between gap-8">
        {/* Left: Title and Tournament Selector */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Trading Dashboard</h1>

          {tournaments.length > 0 && selectedTournament && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <Select
                value={selectedTournament?.id?.toString() || ""}
                onValueChange={onTournamentChange}
              >
                <SelectTrigger className="w-[200px] h-8">
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((tournament: any) => (
                    <SelectItem key={tournament.id} value={tournament.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{tournament.name}</span>
                        <Badge variant={tournament.tournamentType === "crypto" ? "secondary" : "default"} className="text-xs">
                          {tournament.tournamentType === "crypto" ? "🪙" : "📈"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {selectedTournament.currentPlayers}
              </Badge>
            </div>
          )}
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-6">
        {/* Portfolio Value */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Portfolio</div>
            <div className="text-lg font-bold">{formatCurrency(portfolioValue)}</div>
          </div>
        </div>

        {/* 4h Change */}
        <div className="flex items-center gap-2">
          {is4hPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <div>
            <div className="text-xs text-muted-foreground">4h Change</div>
            <div className={`text-lg font-bold ${is4hPositive ? 'text-green-500' : 'text-red-500'}`}>
              {is4hPositive ? '+' : ''}{formatCurrency(change4h)} ({is4hPositive ? '+' : ''}{change4hPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Total P/L */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Total P/L</div>
            <div className={`text-lg font-bold ${isProfitPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitPositive ? '+' : ''}{formatCurrency(profitLoss)} ({isProfitPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Cash</div>
            <div className="text-lg font-bold">{formatCurrency(cashBalance)}</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
