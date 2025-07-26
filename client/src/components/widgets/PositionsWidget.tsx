import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";

interface PositionsWidgetProps {
  height?: number;
}

export function PositionsWidget({ height = 300 }: PositionsWidgetProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  // Fetch personal portfolio positions
  const { data: purchases, isLoading } = useQuery({
    queryKey: ["/api/personal-purchases"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Positions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: height - 80 }}>
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const positions = purchases?.data || [];

  // Group positions by symbol
  const groupedPositions = positions.reduce((acc: any, purchase: any) => {
    const symbol = purchase.symbol;
    if (!acc[symbol]) {
      acc[symbol] = {
        symbol,
        totalShares: 0,
        totalCost: 0,
        currentPrice: purchase.currentPrice || 0,
        purchases: []
      };
    }
    acc[symbol].totalShares += purchase.shares;
    acc[symbol].totalCost += purchase.totalCost;
    acc[symbol].purchases.push(purchase);
    return acc;
  }, {});

  const positionsList = Object.values(groupedPositions);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Positions
          </CardTitle>
          <Link href="/portfolio">
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1" style={{ height: height - 80, overflowY: 'auto' }}>
          {positionsList.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              No positions held
            </div>
          ) : (
            positionsList.slice(0, 8).map((position: any) => {
              const currentValue = position.totalShares * position.currentPrice;
              const totalReturn = currentValue - position.totalCost;
              const returnPercent = ((totalReturn / position.totalCost) * 100);
              
              return (
                <div 
                  key={position.symbol}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-xs">
                      {position.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {position.totalShares} shares
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">
                      {formatCurrency(currentValue)}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${
                      totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {totalReturn >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {totalReturn >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}