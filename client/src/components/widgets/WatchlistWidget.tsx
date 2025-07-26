import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Eye, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Link } from "wouter";

interface WatchlistWidgetProps {
  height?: number;
}

export function WatchlistWidget({ height = 300 }: WatchlistWidgetProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  // Fetch watchlist
  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: height - 80 }}>
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const watchlistData = watchlist || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Watchlist
          </CardTitle>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1" style={{ height: height - 80, overflowY: 'auto' }}>
          {watchlistData.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              No stocks in watchlist
            </div>
          ) : (
            watchlistData.slice(0, 10).map((stock: any, index: number) => (
              <div 
                key={stock.symbol || index}
                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-xs">
                    {stock.symbol || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {stock.name || 'Unknown Company'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">
                    {formatCurrency(stock.price || 0)}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    (stock.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(stock.changePercent || 0) >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {(stock.changePercent || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}