import { Phone, Calendar, Clock, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusHeroProps {
  isLive: boolean;
  lastCallTime?: string | null;
  todayCalls: number;
  todayBooked: number;
  avgDuration: string;
  resolutionRate: number;
  userName?: string;
}

const StatusHero = ({
  isLive,
  lastCallTime,
  todayCalls,
  todayBooked,
  avgDuration,
  resolutionRate,
  userName,
}: StatusHeroProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const metrics = [
    {
      label: "Calls today",
      value: todayCalls,
      icon: Phone,
      color: "text-foreground",
    },
    {
      label: "Booked",
      value: todayBooked,
      icon: Calendar,
      color: "text-success",
    },
    {
      label: "Avg duration",
      value: avgDuration,
      icon: Clock,
      color: "text-foreground",
    },
    {
      label: "Resolved",
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: "text-foreground",
    },
  ];

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          {today}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
          {getGreeting()}
          {userName && (
            <>
              ,{" "}
              <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
                {userName.split(" ")[0]}
              </span>
            </>
          )}
        </h1>
        <p className="text-muted-foreground">
          Here's how your AI receptionist is performing today
        </p>
      </div>

      {/* Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-card">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative space-y-6">
          {/* Live Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                isLive 
                  ? "bg-success/10 text-success" 
                  : "bg-muted text-muted-foreground"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isLive ? "bg-success pulse-live" : "bg-muted-foreground"
                )} />
                {isLive ? "Live" : "Offline"}
              </div>
              {lastCallTime && (
                <span className="text-sm text-muted-foreground">
                  Last call {lastCallTime}
                </span>
              )}
            </div>
            
            {isLive && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-warning" />
                <span>AI Active</span>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {metrics.map((metric, index) => (
              <div 
                key={metric.label}
                className="space-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal/10 text-teal">
                    <metric.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {metric.label}
                  </span>
                </div>
                <p className={cn(
                  "text-3xl md:text-4xl font-semibold tabular-nums tracking-tight",
                  metric.color
                )}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusHero;
