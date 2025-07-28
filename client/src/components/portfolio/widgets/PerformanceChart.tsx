import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

// Mock data for portfolio performance
const mockData = [
  { date: 'Jan 1', value: 10000 },
  { date: 'Jan 8', value: 10250 },
  { date: 'Jan 15', value: 9950 },
  { date: 'Jan 22', value: 10300 },
  { date: 'Jan 29', value: 10150 },
  { date: 'Feb 5', value: 10450 },
  { date: 'Feb 12', value: 10200 },
  { date: 'Feb 19', value: 10600 },
  { date: 'Feb 26', value: 10350 },
  { date: 'Mar 5', value: 10750 },
];

export function PerformanceChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Performance Chart</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
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
        </div>
      </CardContent>
    </Card>
  );
}