import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  TrendingUp,
  Phone,
  Clock,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, subDays, startOfDay, getHours } from "date-fns";

interface CallLog {
  id: string;
  created_at: string;
  started_at: string | null;
  duration_seconds: number | null;
  outcome: string | null;
}

const outcomeColors: Record<string, string> = {
  appointment_booked: "#22c55e",
  info_provided: "#3b82f6",
  transferred: "#eab308",
  missed: "#ef4444",
  voicemail: "#a855f7",
  completed: "#6b7280",
};

const outcomeLabels: Record<string, string> = {
  appointment_booked: "Appointment Booked",
  info_provided: "Info Provided",
  transferred: "Transferred",
  missed: "Missed",
  voicemail: "Voicemail",
  completed: "Completed",
};

const DashboardAnalytics = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.organization_id) {
          setLoading(false);
          return;
        }

        // Fetch last 30 days of calls
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const { data, error } = await supabase
          .from("call_logs")
          .select("id, created_at, started_at, duration_seconds, outcome")
          .eq("organization_id", profile.organization_id)
          .gte("created_at", thirtyDaysAgo)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setCalls(data || []);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [user]);

  // Process calls over time (last 14 days)
  const callsOverTime = (() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return {
        date: format(date, "MMM d"),
        dateKey: format(date, "yyyy-MM-dd"),
        calls: 0,
      };
    });

    calls.forEach((call) => {
      const callDate = format(
        parseISO(call.started_at || call.created_at),
        "yyyy-MM-dd"
      );
      const dayEntry = last14Days.find((d) => d.dateKey === callDate);
      if (dayEntry) {
        dayEntry.calls++;
      }
    });

    return last14Days;
  })();

  // Process outcome distribution
  const outcomeDistribution = (() => {
    const outcomes: Record<string, number> = {};
    calls.forEach((call) => {
      const outcome = call.outcome || "completed";
      outcomes[outcome] = (outcomes[outcome] || 0) + 1;
    });

    return Object.entries(outcomes).map(([name, value]) => ({
      name: outcomeLabels[name] || name,
      value,
      color: outcomeColors[name] || "#6b7280",
      percentage:
        calls.length > 0 ? Math.round((value / calls.length) * 100) : 0,
    }));
  })();

  // Process calls by hour
  const callsByHour = (() => {
    const hours: Record<number, number> = {};
    for (let i = 8; i <= 18; i++) hours[i] = 0;

    calls.forEach((call) => {
      if (call.started_at) {
        const hour = getHours(parseISO(call.started_at));
        if (hour >= 8 && hour <= 18) {
          hours[hour]++;
        }
      }
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour}:00`,
      calls: count,
    }));
  })();

  // Calculate metrics
  const totalCalls = calls.length;
  const appointmentsBooked = calls.filter(
    (c) => c.outcome === "appointment_booked"
  ).length;
  const bookingRate =
    totalCalls > 0 ? Math.round((appointmentsBooked / totalCalls) * 100) : 0;
  const avgDuration =
    calls.length > 0
      ? Math.round(
          calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) /
            calls.length
        )
      : 0;
  const avgDurationFormatted = `${Math.floor(avgDuration / 60)}:${(
    avgDuration % 60
  )
    .toString()
    .padStart(2, "0")}`;

  // Find peak hour
  const peakHour = callsByHour.reduce(
    (max, h) => (h.calls > max.calls ? h : max),
    { hour: "-", calls: 0 }
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for your AI receptionist.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 days
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Calls",
            value: totalCalls.toString(),
            icon: Phone,
            change: "Last 30 days",
          },
          {
            title: "Peak Hours",
            value: peakHour.calls > 0 ? peakHour.hour : "-",
            icon: Clock,
            change: peakHour.calls > 0 ? `${peakHour.calls} calls` : "No data",
          },
          {
            title: "Avg Duration",
            value: avgDurationFormatted,
            icon: TrendingUp,
            change: "Per call",
          },
          {
            title: "Booking Rate",
            value: `${bookingRate}%`,
            icon: Target,
            change: `${appointmentsBooked} appointments`,
          },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-serif text-foreground mt-1">
                    {metric.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metric.change}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalCalls === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No call data yet</p>
            <p className="text-sm mt-1">
              Analytics will appear here once your AI starts receiving calls
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calls Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif">Calls Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={callsOverTime}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="calls"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Outcome Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Call Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                {outcomeDistribution.length > 0 ? (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={outcomeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {outcomeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {outcomeDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.name} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No outcome data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calls by Hour */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Calls by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callsByHour}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="hour"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="calls"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnalytics;
