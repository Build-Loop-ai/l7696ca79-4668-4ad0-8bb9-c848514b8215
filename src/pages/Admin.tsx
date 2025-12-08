import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { AdminMetricsHero } from '@/components/admin/AdminMetricsHero';
import { AdminOrgsTable } from '@/components/admin/AdminOrgsTable';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { AdminCallsChart } from '@/components/admin/AdminCallsChart';
import { AdminSubscriptionsChart } from '@/components/admin/AdminSubscriptionsChart';
import { AdminOutcomesChart } from '@/components/admin/AdminOutcomesChart';
import { AdminAIInsights } from '@/components/admin/AdminAIInsights';
import { AdminRecentActivity } from '@/components/admin/AdminRecentActivity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, LayoutDashboard, Building2, Users, BarChart3 } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface Metrics {
  totalOrganizations: number;
  totalUsers: number;
  totalCalls: number;
  totalMinutes: number;
  activePhoneNumbers: number;
  monthlyRevenue: number;
}

const Admin = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [callsChartData, setCallsChartData] = useState<any[]>([]);
  const [subscriptionsData, setSubscriptionsData] = useState<any[]>([]);
  const [outcomesData, setOutcomesData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        orgsResult,
        usersResult,
        callsResult,
        phoneNumbersResult,
        subscriptionsResult,
      ] = await Promise.all([
        supabase
          .from('organizations')
          .select(`
            id, name, created_at, forwarding_active,
            phone_numbers(count),
            subscriptions(plan, status, minutes_used),
            call_logs(count)
          `),
        supabase
          .from('profiles')
          .select(`
            id, full_name, email, avatar_url, onboarding_completed, created_at, organization_id,
            organization:organizations(name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('call_logs')
          .select('id, created_at, duration_seconds, outcome'),
        supabase
          .from('phone_numbers')
          .select('id, is_active'),
        supabase
          .from('subscriptions')
          .select('id, plan, status'),
      ]);

      // Process organizations
      const orgs = orgsResult.data || [];
      setOrganizations(orgs);

      // Process users
      const usersData = usersResult.data || [];
      setUsers(usersData);

      // Process calls for metrics
      const calls = callsResult.data || [];
      const totalMinutes = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);

      // Process phone numbers
      const phoneNumbers = phoneNumbersResult.data || [];
      const activePhones = phoneNumbers.filter(p => p.is_active).length;

      // Process subscriptions for revenue estimate
      const subs = subscriptionsResult.data || [];
      const planPrices: Record<string, number> = { starter: 97, growth: 197, enterprise: 497 };
      const monthlyRevenue = subs.reduce((sum, s) => {
        if (s.status === 'active' || s.status === 'trialing') {
          return sum + (planPrices[s.plan] || 0);
        }
        return sum;
      }, 0);

      // Set metrics
      setMetrics({
        totalOrganizations: orgs.length,
        totalUsers: usersData.length,
        totalCalls: calls.length,
        totalMinutes,
        activePhoneNumbers: activePhones,
        monthlyRevenue,
      });

      // Process calls chart data (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return { date: format(date, 'MMM d'), calls: 0 };
      });

      calls.forEach(call => {
        const callDate = format(new Date(call.created_at), 'MMM d');
        const dayData = last30Days.find(d => d.date === callDate);
        if (dayData) dayData.calls++;
      });

      setCallsChartData(last30Days);

      // Process subscription distribution
      const subCounts: Record<string, number> = {};
      subs.forEach(s => {
        subCounts[s.plan] = (subCounts[s.plan] || 0) + 1;
      });
      setSubscriptionsData(
        Object.entries(subCounts).map(([name, value]) => ({ name, value }))
      );

      // Process outcomes
      const outcomeCounts: Record<string, number> = {};
      calls.forEach(call => {
        const outcome = call.outcome || 'unknown';
        outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
      });
      setOutcomesData(
        Object.entries(outcomeCounts)
          .map(([outcome, count]) => ({ outcome, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Build recent activities
      const activities: any[] = [];
      
      // Recent user signups (last 7 days)
      usersData
        .filter(u => new Date(u.created_at) > subDays(new Date(), 7))
        .slice(0, 5)
        .forEach(user => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user_signup',
            title: user.full_name || 'New user',
            description: user.email || 'signed up',
            timestamp: user.created_at,
          });
        });

      // Recent organizations
      orgs
        .filter(o => new Date(o.created_at) > subDays(new Date(), 7))
        .slice(0, 3)
        .forEach(org => {
          activities.push({
            id: `org-${org.id}`,
            type: 'org_created',
            title: org.name,
            description: 'Organization created',
            timestamp: org.created_at,
          });
        });

      // Recent calls
      calls
        .slice(0, 5)
        .forEach(call => {
          activities.push({
            id: `call-${call.id}`,
            type: 'call_completed',
            title: `Call ${call.outcome || 'completed'}`,
            description: `Duration: ${Math.round((call.duration_seconds || 0) / 60)} min`,
            timestamp: call.created_at,
          });
        });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Receptionist AI</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform monitoring & insights</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Metrics Hero */}
          <AdminMetricsHero metrics={metrics} loading={loading} />

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="organizations" className="gap-2">
                <Building2 className="h-4 w-4" />
                Organizations
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminCallsChart data={callsChartData} loading={loading} />
                <AdminSubscriptionsChart data={subscriptionsData} loading={loading} />
              </div>

              {/* AI Insights & Activity Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminAIInsights metrics={metrics} />
                <AdminRecentActivity activities={recentActivities} loading={loading} />
              </div>

              {/* Outcomes Chart */}
              <AdminOutcomesChart data={outcomesData} loading={loading} />
            </TabsContent>

            <TabsContent value="organizations">
              <AdminOrgsTable organizations={organizations} loading={loading} />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTable users={users} loading={loading} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminCallsChart data={callsChartData} loading={loading} />
                <AdminOutcomesChart data={outcomesData} loading={loading} />
              </div>
              <AdminSubscriptionsChart data={subscriptionsData} loading={loading} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;
