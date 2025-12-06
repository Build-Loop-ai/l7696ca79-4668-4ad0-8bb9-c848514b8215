import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Calendar,
  Clock,
  TrendingUp,
  Play,
  FileText,
  PhoneCall,
  CheckCircle2,
  Info,
  PhoneForwarded,
  PhoneMissed,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Today's Calls",
    value: "24",
    change: "+12%",
    changeType: "positive",
    icon: Phone,
  },
  {
    title: "Appointments Booked",
    value: "8",
    change: "33%",
    changeType: "positive",
    icon: Calendar,
    subtitle: "conversion",
  },
  {
    title: "Avg Call Duration",
    value: "1:42",
    change: "-8%",
    changeType: "neutral",
    icon: Clock,
  },
  {
    title: "AI Resolution Rate",
    value: "87%",
    change: "+5%",
    changeType: "positive",
    icon: TrendingUp,
  },
];

const recentCalls = [
  {
    id: 1,
    time: "14:32",
    caller: "+31 6 1234 5678",
    duration: "2:15",
    outcome: "appointment_booked",
  },
  {
    id: 2,
    time: "14:15",
    caller: "+31 6 9876 5432",
    duration: "1:02",
    outcome: "info_provided",
  },
  {
    id: 3,
    time: "13:48",
    caller: "+31 6 5555 4444",
    duration: "0:45",
    outcome: "transferred",
  },
  {
    id: 4,
    time: "13:22",
    caller: "+31 6 3333 2222",
    duration: "1:58",
    outcome: "appointment_booked",
  },
  {
    id: 5,
    time: "12:55",
    caller: "+31 6 1111 0000",
    duration: "0:00",
    outcome: "missed",
  },
];

const outcomeConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  appointment_booked: {
    label: "Appointment Booked",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  info_provided: {
    label: "Info Provided",
    color: "bg-blue-100 text-blue-700",
    icon: Info,
  },
  transferred: {
    label: "Transferred",
    color: "bg-yellow-100 text-yellow-700",
    icon: PhoneForwarded,
  },
  missed: {
    label: "Missed",
    color: "bg-red-100 text-red-700",
    icon: PhoneMissed,
  },
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-serif text-foreground mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "negative"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.change}
                    </span>
                    {stat.subtitle && (
                      <span className="text-sm text-muted-foreground">
                        {stat.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Calls */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif">Recent Calls</CardTitle>
            <Button variant="outline" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCalls.map((call) => {
                  const outcome = outcomeConfig[call.outcome];
                  return (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">{call.time}</TableCell>
                      <TableCell>{call.caller}</TableCell>
                      <TableCell>{call.duration}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`gap-1 ${outcome.color}`}
                        >
                          <outcome.icon className="w-3 h-3" />
                          {outcome.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PhoneCall className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Live Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Live Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-green-500 pulse-indicator" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Ready to receive calls
              </h3>
              <p className="text-sm text-muted-foreground">
                Last call: 14:32
              </p>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h4 className="text-sm font-medium text-foreground mb-4">
                Today's Summary
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calls answered</span>
                  <span className="font-medium text-foreground">23</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calls missed</span>
                  <span className="font-medium text-foreground">1</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Minutes used</span>
                  <span className="font-medium text-foreground">42 / 500</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
