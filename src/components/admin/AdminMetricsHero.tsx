import { Building2, Users, Phone, CreditCard, PhoneCall, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  loading,
  accent = false,
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  loading: boolean;
  accent?: boolean;
}) => (
  <div className={cn(
    "relative overflow-hidden rounded-xl p-5 transition-all duration-300",
    "bg-card/50 backdrop-blur-sm border border-border/50",
    "hover:bg-card/70 hover:border-border/70 hover:shadow-lg hover:shadow-purple-500/5",
    accent && "bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20"
  )}>
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    
    <div className="relative flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-20 bg-muted/50" />
        ) : (
          <>
            <p className={cn(
              "text-2xl font-semibold tabular-nums",
              accent ? "text-purple-300" : "text-foreground"
            )}>
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </>
        )}
      </div>
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center",
        accent 
          ? "bg-purple-500/20 text-purple-400" 
          : "bg-white/5 text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
        accent
      />
    </div>
  );
};
