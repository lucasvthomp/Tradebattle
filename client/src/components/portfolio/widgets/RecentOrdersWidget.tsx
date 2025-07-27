import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

export function RecentOrdersWidget() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  const { data: purchasesData } = useQuery({
    queryKey: ["/api/personal-purchases"],
    enabled: !!user
  });

  const purchases = (purchasesData?.data as any[]) || [];

  const recentOrders = Array.isArray(purchases) ? purchases.slice(0, 5).map((purchase: any) => ({
    ...purchase,
    type: 'buy',
    timestamp: purchase.purchaseDate || new Date().toISOString()
  })) : [];

  if (!recentOrders.length) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Recent Orders</h3>
        <Badge variant="secondary" className="text-xs">
          {recentOrders.length}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {recentOrders.map((order: any) => {
          const isBuy = order.type === 'buy';
          const totalValue = order.shares * order.purchasePrice;

          return (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-full ${
                  isBuy ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {isBuy ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {order.symbol}
                    </span>
                    <Badge variant={isBuy ? "default" : "secondary"} className="text-xs">
                      {isBuy ? 'BUY' : 'SELL'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.shares} shares @ {formatCurrency(order.purchasePrice)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(order.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-border/50">
        <Button size="sm" variant="ghost" className="w-full text-xs">
          View all orders
        </Button>
      </div>
    </div>
  );
}