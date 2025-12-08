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
  gradient,
  loading 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  gradient: string;
  loading: boolean;
}) => (
  <Card className={`relative overflow-hidden p-6 ${gradient}`}>
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
      <Icon className="w-full h-full" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 text-white/80 mb-2">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-10 w-24 bg-white/20" />
      ) : (
        <>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subValue && (
            <p className="text-sm text-white/70 mt-1">{subValue}</p>
          )}
        </>
      )}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        icon={Building2}
        label="Organizations"
        value={metrics ? formatNumber(metrics.totalOrganizations) : '-'}
        gradient="bg-gradient-to-br from-violet-500 to-purple-600"
        loading={loading}
      />
      <MetricCard
        icon={Users}
        label="Total Users"
        value={metrics ? formatNumber(metrics.totalUsers) : '-'}
        gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
        loading={loading}
      />
      <MetricCard
        icon={PhoneCall}
        label="Total Calls"
        value={metrics ? formatNumber(metrics.totalCalls) : '-'}
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        loading={loading}
      />
      <MetricCard
        icon={Phone}
        label="Call Minutes"
        value={metrics ? formatNumber(Math.round(metrics.totalMinutes / 60)) : '-'}
        subValue="All time"
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        loading={loading}
      />
      <MetricCard
        icon={TrendingUp}
        label="Active Numbers"
        value={metrics ? formatNumber(metrics.activePhoneNumbers) : '-'}
        gradient="bg-gradient-to-br from-pink-500 to-rose-600"
        loading={loading}
      />
      <MetricCard
        icon={CreditCard}
        label="Est. MRR"
        value={metrics ? formatCurrency(metrics.monthlyRevenue) : '-'}
        gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
        loading={loading}
      />
    </div>
  );
};
