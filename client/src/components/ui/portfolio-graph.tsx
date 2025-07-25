import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface PortfolioGraphProps {
  userId: number;
  portfolioType?: 'personal' | 'tournament';
  tournamentId?: number;
  title?: string;
  height?: number;
  showStats?: boolean;
  className?: string;
}

interface PortfolioDataPoint {
  date: string;
  value: number;
  cashBalance: number;
  stockValue: number;
}

export function PortfolioGraph({ 
  userId, 
  portfolioType = 'personal', 
  tournamentId, 
  title = 'Portfolio Performance',
  height = 300,
  showStats = true,
  className = ''
}: PortfolioGraphProps) {
  const { formatCurrency } = useUserPreferences();
  const { data: portfolioHistory, isLoading } = useQuery({
    queryKey: [`/api/portfolio-history/${userId}`, portfolioType, tournamentId],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: portfolioType
      });
      if (tournamentId) {
        params.append('tournamentId', tournamentId.toString());
      }
      
      const response = await fetch(`/api/portfolio-history/${userId}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio history');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate mock data if no history exists yet
  const generateMockData = (): PortfolioDataPoint[] => {
    const now = new Date();
    const data: PortfolioDataPoint[] = [];
    const startValue = 10000;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Simple random walk with slight upward trend
      const variation = (Math.random() - 0.45) * 200; // Slight positive bias
      const dayValue = Math.max(8000, startValue + variation * Math.sqrt(30 - i));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(dayValue),
        cashBalance: Math.round(dayValue * 0.3), // 30% cash
        stockValue: Math.round(dayValue * 0.7) // 70% stocks
      });
    }
    
    return data;
  };

  const data: PortfolioDataPoint[] = portfolioHistory?.data?.length > 0 
    ? portfolioHistory.data.map((item: any) => ({
        date: new Date(item.recordedAt).toISOString().split('T')[0],
        value: parseFloat(item.totalValue),
        cashBalance: parseFloat(item.cashBalance),
        stockValue: parseFloat(item.stockValue)
      }))
    : generateMockData();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentValue = data[data.length - 1]?.value || 10000;
  const initialValue = data[0]?.value || 10000;
  const totalChange = currentValue - initialValue;
  const percentChange = ((totalChange / initialValue) * 100);
  const isPositive = totalChange >= 0;

  return (
    <Card className={`${className} gradient-card border-0 shadow-lg`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center neon-glow mr-3">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">{title}</span>
          </div>
          {showStats && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(currentValue)}
                </p>
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {formatCurrency(Math.abs(totalChange))} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                </div>
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg pointer-events-none"></div>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 65, bottom: 35 }}
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--neon-blue))" />
                <stop offset="50%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--neon-purple))" />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="hsl(var(--muted-foreground))" 
              opacity={0.2}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tick={{ 
                fontSize: 11, 
                fill: 'hsl(var(--muted-foreground))',
                fontWeight: 500
              }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              tickMargin={8}
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              tick={{ 
                fontSize: 11, 
                fill: 'hsl(var(--muted-foreground))',
                fontWeight: 500
              }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              tickMargin={8}
              width={55}
              tickCount={6}
              domain={['dataMin - 200', 'dataMax + 200']}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return formatCurrency(value / 1000) + 'k';
                } else {
                  return formatCurrency(value);
                }
              }}
            />
            <Tooltip 
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'value' ? 'Total Value' : 
                name === 'stockValue' ? 'Stock Value' : 'Cash Balance'
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                fontWeight: 500
              }}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
                marginBottom: '4px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="url(#gradient)" 
              strokeWidth={3}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: 'hsl(var(--neon-blue))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 3,
                style: {
                  filter: 'drop-shadow(0 0 8px hsl(var(--neon-blue)))'
                }
              }}
              style={{
                filter: 'drop-shadow(0 0 4px hsl(var(--primary)))'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}