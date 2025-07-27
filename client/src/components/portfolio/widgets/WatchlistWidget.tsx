import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

export function WatchlistWidget() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  const { data: watchlistData } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user
  });

  const watchlist = (watchlistData as any[]) || [];

  if (!watchlist.length) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No watchlist items</p>
          <Button size="sm" variant="outline" className="mt-2 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add stocks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Watchlist</h3>
        <Badge variant="secondary" className="text-xs">
          {watchlist.length}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {watchlist.slice(0, 8).map((item: any) => {
          const changePercent = item.changePercent || 0;
          const isPositive = changePercent >= 0;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">
                  {item.symbol}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.companyName}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {formatCurrency(item.price || 0)}
                </div>
                <div className={`text-xs flex items-center gap-1 justify-end ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {watchlist.length > 8 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <Button size="sm" variant="ghost" className="w-full text-xs">
            View all ({watchlist.length})
          </Button>
        </div>
      )}
    </div>
  );
}