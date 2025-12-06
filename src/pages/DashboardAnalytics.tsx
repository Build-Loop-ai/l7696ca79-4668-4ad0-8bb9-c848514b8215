import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Download, TrendingUp, Phone, Clock, Target } from "lucide-react";
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

const callsOverTime = [
  { date: "Mar 1", calls: 12 },
  { date: "Mar 2", calls: 19 },
  { date: "Mar 3", calls: 15 },
  { date: "Mar 4", calls: 22 },
  { date: "Mar 5", calls: 18 },
  { date: "Mar 6", calls: 25 },
  { date: "Mar 7", calls: 28 },
  { date: "Mar 8", calls: 16 },
  { date: "Mar 9", calls: 21 },
  { date: "Mar 10", calls: 24 },
  { date: "Mar 11", calls: 20 },
  { date: "Mar 12", calls: 27 },
  { date: "Mar 13", calls: 23 },
  { date: "Mar 14", calls: 29 },
  { date: "Mar 15", calls: 24 },
];

const outcomeDistribution = [
  { name: "Appointment Booked", value: 45, color: "#22c55e" },
  { name: "Info Provided", value: 30, color: "#3b82f6" },
  { name: "Transferred", value: 15, color: "#eab308" },
  { name: "Missed", value: 10, color: "#ef4444" },
];

const callsByHour = [
  { hour: "8AM", calls: 5 },
  { hour: "9AM", calls: 12 },
  { hour: "10AM", calls: 18 },
  { hour: "11AM", calls: 22 },
  { hour: "12PM", calls: 15 },
  { hour: "1PM", calls: 10 },
  { hour: "2PM", calls: 20 },
  { hour: "3PM", calls: 25 },
  { hour: "4PM", calls: 18 },
  { hour: "5PM", calls: 8 },
];

const callsByDay = [
  { day: "Mon", calls: 45 },
  { day: "Tue", calls: 52 },
  { day: "Wed", calls: 48 },
  { day: "Thu", calls: 55 },
  { day: "Fri", calls: 42 },
  { day: "Sat", calls: 25 },
  { day: "Sun", calls: 8 },
];

const DashboardAnalytics = () => {
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
            value: "342",
            icon: Phone,
            change: "+18%",
          },
          {
            title: "Peak Hours",
            value: "10-11 AM",
            icon: Clock,
            change: "Most active",
          },
          {
            title: "Avg Duration",
            value: "1:38",
            icon: TrendingUp,
            change: "-5%",
          },
          {
            title: "Booking Rate",
            value: "45%",
            icon: Target,
            change: "+8%",
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
                  <p className="text-sm text-primary mt-1">{metric.change}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calls Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif">Calls Over Time</CardTitle>
            <Select defaultValue="daily">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={callsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
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
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="hour"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
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
    </div>
  );
};

export default DashboardAnalytics;
