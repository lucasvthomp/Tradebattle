import { WidgetWrapper } from "./WidgetWrapper";
import { Activity, TrendingUp, BarChart3, Trophy } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface QuickStatsWidgetProps {
  stats: {
    holdingsCount: number;
    buyInAmount: number;
    profitLoss: number;
    players: number;
  };
  onRemove?: () => void;
}

export function QuickStatsWidget({
  stats,
  onRemove
}: QuickStatsWidgetProps) {
  const { formatCurrency } = useUserPreferences();
  const isPositive = stats.profitLoss >= 0;

  return (
    <WidgetWrapper
      title="Quick Stats"
      icon={<Activity className="w-4 h-4" />}
      onRemove={onRemove}
    >
      <div className="grid grid-cols-2 gap-3 h-full">
        <div className="p-2 rounded-lg bg-muted/30 flex flex-col">
          <div className="flex items-center space-x-1 mb-1">
            <BarChart3 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Holdings</span>
          </div>
          <div className="text-lg lg:text-xl font-bold">{stats.holdingsCount}</div>
        </div>

        <div className="p-2 rounded-lg bg-muted/30 flex flex-col">
          <div className="flex items-center space-x-1 mb-1">
            <Trophy className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Buy-In</span>
          </div>
          <div className="text-sm lg:text-lg font-bold truncate">{formatCurrency(stats.buyInAmount)}</div>
        </div>

        <div className="p-2 rounded-lg bg-muted/30 flex flex-col">
          <div className="flex items-center space-x-1 mb-1">
            <TrendingUp className={`w-3 h-3 flex-shrink-0 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-xs text-muted-foreground">P/L</span>
          </div>
          <div className={`text-sm lg:text-lg font-bold truncate ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatCurrency(stats.profitLoss)}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-muted/30 flex flex-col">
          <div className="flex items-center space-x-1 mb-1">
            <Activity className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Players</span>
          </div>
          <div className="text-lg lg:text-xl font-bold">{stats.players}</div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
