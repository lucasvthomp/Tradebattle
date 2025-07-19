import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {title}
          </div>
          {showStats && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  ${currentValue.toLocaleString()}
                </p>
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  ${Math.abs(totalChange).toLocaleString()} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                </div>
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString();
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === 'value' ? 'Total Value' : 
                name === 'stockValue' ? 'Stock Value' : 'Cash Balance'
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}