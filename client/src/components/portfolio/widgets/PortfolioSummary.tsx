import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

export function PortfolioSummary() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio/personal'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = portfolioData?.data?.totalValue || 10000;
  const initialDeposit = 10000;
  const totalGain = totalValue - initialDeposit;
  const totalGainPercent = ((totalGain / initialDeposit) * 100);
  const isPositive = totalGain >= 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Portfolio Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Value</span>
            <span className="text-lg font-bold">{formatCurrency(totalValue)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Initial Deposit</span>
            <span className="text-sm">{formatCurrency(initialDeposit)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Gain/Loss</span>
            <div className="flex items-center space-x-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalGain))}
              </span>
              <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                {isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}