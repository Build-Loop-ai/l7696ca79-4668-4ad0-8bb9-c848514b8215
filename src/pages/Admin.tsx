import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminMetricsHero } from '@/components/admin/AdminMetricsHero';
import { AdminOrgsTable } from '@/components/admin/AdminOrgsTable';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { AdminCallsChart } from '@/components/admin/AdminCallsChart';
import { AdminSubscriptionsChart } from '@/components/admin/AdminSubscriptionsChart';
import { AdminOutcomesChart } from '@/components/admin/AdminOutcomesChart';
import { AdminAIInsights } from '@/components/admin/AdminAIInsights';
import { AdminRecentActivity } from '@/components/admin/AdminRecentActivity';
import { AdminEmailsTable } from '@/components/admin/AdminEmailsTable';
import { AdminEmailSettings } from '@/components/admin/AdminEmailSettings';
import { AdminPlansTable } from '@/components/admin/AdminPlansTable';
import { AdminContactRequests } from '@/components/admin/AdminContactRequests';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3,
  Mail,
  Settings,
  ArrowLeft,
  CreditCard,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface Metrics {
  totalOrganizations: number;
  totalUsers: number;
  totalCalls: number;
  totalMinutes: number;
  activePhoneNumbers: number;
  monthlyRevenue: number;
  totalEmails: number;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', value: 'overview' },
  { icon: Building2, label: 'Organizations', value: 'organizations' },
  { icon: Users, label: 'Users', value: 'users' },
  { icon: MessageSquare, label: 'Contacts', value: 'contacts' },
  { icon: Mail, label: 'Emails', value: 'emails' },
  { icon: CreditCard, label: 'Plans', value: 'plans' },
  { icon: Settings, label: 'Settings', value: 'settings' },
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
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
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
        emailLogsResult,
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
        supabase
          .from('email_logs')
          .select(`
            id, email_type, recipient_email, subject, organization_id, status, resend_id, created_at, error_message,
            organization:organizations(name)
          `)
          .order('created_at', { ascending: false }),
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

      const emailLogsData = emailLogsResult.data || [];
      setEmailLogs(emailLogsData);

      setMetrics({
        totalOrganizations: orgs.length,
        totalUsers: usersData.length,
        totalCalls: calls.length,
        totalMinutes,
        activePhoneNumbers: activePhones,
        monthlyRevenue,
        totalEmails: emailLogsData.length,
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

  const getPageTitle = () => {
    const current = navItems.find(item => item.value === activeTab);
    return current?.label || 'Overview';
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | {siteConfig.name}</title>
      </Helmet>
      
      <div className="admin-theme min-h-screen flex w-full">
        {/* Premium gradient background - navy/teal theme */}
        <div className="fixed inset-0 pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 20% 0%, hsl(166 76% 46% / 0.1) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 20%, hsl(200 70% 40% / 0.08) 0%, transparent 40%),
                radial-gradient(ellipse 50% 30% at 50% 80%, hsl(166 60% 30% / 0.06) 0%, transparent 40%),
                hsl(220 60% 6%)
              `,
            }}
          />
          {/* Subtle grain texture */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />
        </div>

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 z-40">
          <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-xl border-r border-border/50 m-3 mr-0 rounded-2xl overflow-hidden">
            {/* Logo */}
            <div className="p-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-teal-dark flex items-center justify-center shadow-lg shadow-primary/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-serif text-lg font-medium text-foreground block">
                  Admin
                </span>
                <span className="text-xs text-muted-foreground">Control Center</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full group",
                      isActive
                        ? "bg-gradient-to-r from-primary/20 to-teal-dark/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Back to Dashboard */}
            <div className="p-3 mt-auto">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all w-full group"
              >
                <ArrowLeft className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm">Back to App</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          {/* Mobile header */}
          <header className="md:hidden border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-teal-dark flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-serif text-lg font-medium text-foreground">Admin</span>
              </div>
              <Link 
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
            
            {/* Mobile tabs */}
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {navItems.map((item) => {
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <div className="space-y-6 animate-fade-in">
              {/* Page header */}
              <div className="mb-2">
                <div className="flex items-center gap-2 text-primary/80 text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Platform Admin</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                  {getPageTitle()}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeTab === 'overview' && 'Monitor your platform performance and insights'}
                  {activeTab === 'organizations' && 'Manage all organizations on the platform'}
                  {activeTab === 'users' && 'View and manage user accounts'}
                  {activeTab === 'contacts' && 'View and respond to contact form submissions'}
                  {activeTab === 'emails' && 'Track email delivery and logs'}
                  {activeTab === 'plans' && 'Configure pricing plans and features'}
                  {activeTab === 'settings' && 'Platform configuration and email settings'}
                  {activeTab === 'analytics' && 'Deep dive into platform analytics'}
                </p>
              </div>

              {/* Metrics Hero - always visible */}
              <AdminMetricsHero metrics={metrics} loading={loading} />

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

              {activeTab === 'contacts' && (
                <AdminContactRequests />
              )}

              {activeTab === 'emails' && (
                <AdminEmailsTable emails={emailLogs} loading={loading} />
              )}

              {activeTab === 'plans' && (
                <AdminPlansTable />
              )}

              {activeTab === 'settings' && (
                <AdminEmailSettings />
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
