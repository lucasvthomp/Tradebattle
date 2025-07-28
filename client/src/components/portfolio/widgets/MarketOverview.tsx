import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

export function MarketOverview() {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['/api/popular'],
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
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

  const stocks = marketData?.data?.slice(0, 6) || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Market Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stocks.map((stock: any) => {
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
      </CardContent>
    </Card>
  );
}