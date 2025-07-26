import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioGraphWidgetProps {
  height?: number;
}

export function PortfolioGraphWidget({ height = 300 }: PortfolioGraphWidgetProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();

  // Fetch portfolio history
  const { data: portfolioHistory, isLoading } = useQuery({
    queryKey: ["/api/portfolio-history", user?.userId],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });

  // Generate sample data if no history exists
  const generateSampleData = () => {
    const data = [];
    const startValue = 10000;
    const days = 30;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const randomChange = (Math.random() - 0.5) * 200;
      const value = i === 0 ? startValue : data[i-1].value + randomChange;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(value, 0),
        displayDate: date.toLocaleDateString()
      });
    }
    return data;
  };

  const chartData = portfolioHistory?.data?.length > 0 ? portfolioHistory.data : generateSampleData();
  const currentValue = chartData[chartData.length - 1]?.value || 10000;
  const previousValue = chartData[chartData.length - 2]?.value || 10000;
  const change = currentValue - previousValue;
  const changePercent = ((change / previousValue) * 100);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: height - 80 }}>
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Portfolio Performance</CardTitle>
          <div className="flex items-center gap-2">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-lg font-bold">
          {formatCurrency(currentValue)}
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height={height - 100}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="displayDate" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={change >= 0 ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: change >= 0 ? '#10b981' : '#ef4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}