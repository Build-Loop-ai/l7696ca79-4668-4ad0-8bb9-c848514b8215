import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3, 
  Phone,
  ArrowLeft
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface Metrics {
  totalOrganizations: number;
  totalUsers: number;
  totalCalls: number;
  totalMinutes: number;
  activePhoneNumbers: number;
  monthlyRevenue: number;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', value: 'overview' },
  { icon: Building2, label: 'Organizations', value: 'organizations' },
  { icon: Users, label: 'Users', value: 'users' },
  { icon: BarChart3, label: 'Analytics', value: 'analytics' },
];

const Admin = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [callsChartData, setCallsChartData] = useState<any[]>([]);
  const [subscriptionsData, setSubscriptionsData] = useState<any[]>([]);
  const [outcomesData, setOutcomesData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
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

      const orgs = orgsResult.data || [];
      setOrganizations(orgs);

      const usersData = usersResult.data || [];
      setUsers(usersData);

      const calls = callsResult.data || [];
      const totalMinutes = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);

      const phoneNumbers = phoneNumbersResult.data || [];
      const activePhones = phoneNumbers.filter(p => p.is_active).length;

      const subs = subscriptionsResult.data || [];
      const planPrices: Record<string, number> = { starter: 97, growth: 197, enterprise: 497 };
      const monthlyRevenue = subs.reduce((sum, s) => {
        if (s.status === 'active' || s.status === 'trialing') {
          return sum + (planPrices[s.plan] || 0);
        }
        return sum;
      }, 0);

      setMetrics({
        totalOrganizations: orgs.length,
        totalUsers: usersData.length,
        totalCalls: calls.length,
        totalMinutes,
        activePhoneNumbers: activePhones,
        monthlyRevenue,
      });

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

      const subCounts: Record<string, number> = {};
      subs.forEach(s => {
        subCounts[s.plan] = (subCounts[s.plan] || 0) + 1;
      });
      setSubscriptionsData(
        Object.entries(subCounts).map(([name, value]) => ({ name, value }))
      );

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

      const activities: any[] = [];
      
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
        <title>Admin Dashboard | Callisto</title>
      </Helmet>
      
      <div className="admin-theme min-h-screen flex w-full bg-background gradient-mesh">
        {/* Sidebar */}
        <aside className="bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 flex flex-col hidden md:flex w-64">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-medium text-sidebar-foreground">
              Admin
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Back to Dashboard */}
          <div className="p-4 border-t border-sidebar-border">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all w-full"
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Back to App</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile header */}
          <header className="md:hidden border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-serif text-lg font-medium text-foreground">Admin</span>
              </div>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
            <div className="space-y-6 animate-fade-in">
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                  Platform Overview
                </h1>
                <p className="text-muted-foreground mt-1">
                  Monitor your SaaS platform performance and insights
                </p>
              </div>

              {/* Metrics Hero */}
              <AdminMetricsHero metrics={metrics} loading={loading} />

              {/* Mobile tabs */}
              <div className="md:hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-4 bg-muted/50">
                    {navItems.map((item) => (
                      <TabsTrigger 
                        key={item.value} 
                        value={item.value}
                        className="text-xs px-2"
                      >
                        <item.icon className="h-4 w-4" />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AdminCallsChart data={callsChartData} loading={loading} />
                    <AdminSubscriptionsChart data={subscriptionsData} loading={loading} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AdminAIInsights metrics={metrics} />
                    <AdminRecentActivity activities={recentActivities} loading={loading} />
                  </div>

                  <AdminOutcomesChart data={outcomesData} loading={loading} />
                </div>
              )}

              {activeTab === 'organizations' && (
                <AdminOrgsTable organizations={organizations} loading={loading} />
              )}

              {activeTab === 'users' && (
                <AdminUsersTable users={users} loading={loading} />
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AdminCallsChart data={callsChartData} loading={loading} />
                    <AdminOutcomesChart data={outcomesData} loading={loading} />
                  </div>
                  <AdminSubscriptionsChart data={subscriptionsData} loading={loading} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Admin;
