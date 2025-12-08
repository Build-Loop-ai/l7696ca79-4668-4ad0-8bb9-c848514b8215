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
      case 'user_signup': return <UserPlus className="h-4 w-4 text-info" />;
      case 'org_created': return <Building2 className="h-4 w-4 text-success" />;
      case 'call_completed': return <Phone className="h-4 w-4 text-primary" />;
      case 'subscription_change': return <CreditCard className="h-4 w-4 text-warning" />;
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
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground truncate">{activity.title}</span>
                    <Badge variant="secondary" className="text-xs h-5">
                      {getActivityBadge(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
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
