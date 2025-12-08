import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OutcomeData {
  outcome: string;
  count: number;
}

interface AdminOutcomesChartProps {
  data: OutcomeData[];
  loading: boolean;
}

export const AdminOutcomesChart = ({ data, loading }: AdminOutcomesChartProps) => {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'appointment_booked': return '#10b981';
      case 'info_provided': return '#3b82f6';
      case 'transferred': return '#f59e0b';
      case 'voicemail': return '#8b5cf6';
      case 'missed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatOutcome = (outcome: string) => {
    return outcome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formattedData = data.map(item => ({
    ...item,
    label: formatOutcome(item.outcome),
    color: getOutcomeColor(item.outcome),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Call Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No call data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" className="text-xs fill-muted-foreground" />
              <YAxis 
                type="category" 
                dataKey="label" 
                className="text-xs fill-muted-foreground"
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
