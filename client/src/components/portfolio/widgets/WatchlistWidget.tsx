import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function WatchlistWidget() {
  const { user } = useAuth();

  const { data: watchlistData, isLoading } = useQuery({
    queryKey: ['/api/watchlist'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const watchlist = watchlistData?.data?.slice(0, 5) || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Watchlist</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No stocks in watchlist</p>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="mt-2">
                Add Stocks
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((stock: any) => {
              const change = parseFloat(stock.changePercent || 0);
              const isPositive = change >= 0;
              
              return (
                <div key={stock.symbol} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{stock.symbol}</span>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">${stock.price?.toFixed(2)}</span>
                    <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}