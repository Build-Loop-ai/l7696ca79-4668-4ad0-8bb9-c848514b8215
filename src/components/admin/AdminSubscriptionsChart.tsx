import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SubscriptionData {
  name: string;
  value: number;
}

interface AdminSubscriptionsChartProps {
  data: SubscriptionData[];
  loading: boolean;
}

export const AdminSubscriptionsChart = ({ data, loading }: AdminSubscriptionsChartProps) => {
  const COLORS: Record<string, string> = {
    starter: 'hsl(var(--primary))',
    growth: 'hsl(var(--info))',
    enterprise: 'hsl(var(--success))',
  };

  const formattedData = data.map(item => ({
    ...item,
    displayName: item.name.charAt(0).toUpperCase() + item.name.slice(1),
  }));

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          Subscription Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No subscription data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ displayName, percent }) => `${displayName} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || 'hsl(var(--muted-foreground))'} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
