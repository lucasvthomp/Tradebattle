import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { TrendingUp, TrendingDown, Search } from "lucide-react";

interface StockGraphWidgetProps {
  height?: number;
}

export function StockGraphWidget({ height = 300 }: StockGraphWidgetProps) {
  const [symbol, setSymbol] = useState("AAPL");
  const [inputSymbol, setInputSymbol] = useState("AAPL");
  const { formatCurrency } = useUserPreferences();

  // Fetch stock quote
  const { data: stockData, isLoading } = useQuery({
    queryKey: ["/api/quote", symbol],
    enabled: !!symbol,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate sample historical data
  const generateHistoricalData = (currentPrice: number) => {
    const data = [];
    const days = 30;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const randomChange = (Math.random() - 0.5) * (currentPrice * 0.1);
      const basePrice = currentPrice * (0.95 + Math.random() * 0.1);
      const price = i === days - 1 ? currentPrice : basePrice + randomChange;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, 0.01),
        displayDate: date.toLocaleDateString()
      });
    }
    return data;
  };

  const handleSymbolChange = () => {
    if (inputSymbol.trim()) {
      setSymbol(inputSymbol.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSymbolChange();
    }
  };

  const currentPrice = stockData?.data?.price || 0;
  const change = stockData?.data?.change || 0;
  const changePercent = stockData?.data?.changePercent || 0;
  const chartData = generateHistoricalData(currentPrice);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Symbol (e.g., AAPL)"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="text-xs h-8 w-20"
                maxLength={10}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSymbolChange}
                className="h-8 w-8 p-0"
              >
                <Search className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{symbol}</CardTitle>
          <div className="text-sm font-bold">
            {isLoading ? 'Loading...' : formatCurrency(currentPrice)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height: height - 100 }}>
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
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
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip 
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value: number) => [formatCurrency(value), symbol]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={change >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: change >= 0 ? '#10b981' : '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}