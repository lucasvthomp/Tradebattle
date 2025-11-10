import { TrendingUp, TrendingDown, Trophy, DollarSign, Users, LayoutList, ShoppingCart } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  showHoldings?: boolean;
  onToggleView?: () => void;
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
  showHoldings = false,
  onToggleView
}: PortfolioStatsBarProps) {
  const { formatCurrency } = useUserPreferences();
  const isPositive = profitLoss >= 0;

  return (
    <div className="w-full bg-card/95 backdrop-blur border-b border-border/50 px-6 py-3">
      <div className="flex items-center justify-between gap-6 flex-wrap">
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

        {/* View Toggle Button */}
        {onToggleView && (
          <Button
            variant={showHoldings ? "default" : "outline"}
            size="sm"
            onClick={onToggleView}
          >
            {showHoldings ? (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Trade
              </>
            ) : (
              <>
                <LayoutList className="w-4 h-4 mr-2" />
                Holdings
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
