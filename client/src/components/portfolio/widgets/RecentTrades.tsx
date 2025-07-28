import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { format } from "date-fns";

export function RecentTrades() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  const { data: tradesData, isLoading } = useQuery({
    queryKey: ['/api/portfolio/personal'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trades = tradesData?.data?.purchases?.slice(0, 5) || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Recent Trades</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent trades</p>
            <p className="text-xs mt-1">Start trading to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map((trade: any) => (
              <div key={trade.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">{trade.symbol}</div>
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(trade.createdAt), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{trade.quantity} shares</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(trade.purchasePrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}