import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, UserPlus, Phone, Building2, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'user_signup' | 'org_created' | 'call_completed' | 'subscription_change';
  title: string;
  description: string;
  timestamp: string;
}

interface AdminRecentActivityProps {
  activities: ActivityItem[];
  loading: boolean;
}

export const AdminRecentActivity = ({ activities, loading }: AdminRecentActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'org_created': return <Building2 className="h-4 w-4 text-emerald-500" />;
      case 'call_completed': return <Phone className="h-4 w-4 text-violet-500" />;
      case 'subscription_change': return <CreditCard className="h-4 w-4 text-amber-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user_signup': return 'New User';
      case 'org_created': return 'New Org';
      case 'call_completed': return 'Call';
      case 'subscription_change': return 'Subscription';
      default: return 'Activity';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{activity.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getActivityBadge(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
