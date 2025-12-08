import { Building2, Users, Phone, CreditCard, PhoneCall, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminMetricsHeroProps {
  metrics: {
    totalOrganizations: number;
    totalUsers: number;
    totalCalls: number;
    totalMinutes: number;
    activePhoneNumbers: number;
    monthlyRevenue: number;
  } | null;
  loading: boolean;
}

const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  loading 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  loading: boolean;
}) => (
  <Card className="relative overflow-hidden p-5 bg-card border border-border card-hover">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
            )}
          </>
        )}
      </div>
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </Card>
);

export const AdminMetricsHero = ({ metrics, loading }: AdminMetricsHeroProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        icon={Building2}
        label="Organizations"
        value={metrics ? formatNumber(metrics.totalOrganizations) : '-'}
        loading={loading}
      />
      <MetricCard
        icon={Users}
        label="Total Users"
        value={metrics ? formatNumber(metrics.totalUsers) : '-'}
        loading={loading}
      />
      <MetricCard
        icon={PhoneCall}
        label="Total Calls"
        value={metrics ? formatNumber(metrics.totalCalls) : '-'}
        loading={loading}
      />
      <MetricCard
        icon={Phone}
        label="Call Minutes"
        value={metrics ? formatNumber(Math.round(metrics.totalMinutes / 60)) : '-'}
        subValue="All time"
        loading={loading}
      />
      <MetricCard
        icon={TrendingUp}
        label="Active Numbers"
        value={metrics ? formatNumber(metrics.activePhoneNumbers) : '-'}
        loading={loading}
      />
      <MetricCard
        icon={CreditCard}
        label="Est. MRR"
        value={metrics ? formatCurrency(metrics.monthlyRevenue) : '-'}
        loading={loading}
      />
    </div>
  );
};
