import { Lightbulb, TrendingUp, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightsPanelProps {
  totalCalls: number;
  appointmentsBooked: number;
  peakHour?: number;
  avgDurationSeconds?: number;
}

const InsightsPanel = ({ 
  totalCalls, 
  appointmentsBooked, 
  peakHour,
  avgDurationSeconds 
}: InsightsPanelProps) => {
  const bookingRate = totalCalls > 0 
    ? Math.round((appointmentsBooked / totalCalls) * 100) 
    : 0;

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const insights = [
    totalCalls > 0 && bookingRate > 50 && {
      icon: TrendingUp,
      text: `Your AI converted ${bookingRate}% of calls into appointments`,
      color: "text-success",
    },
    peakHour !== undefined && totalCalls > 3 && {
      icon: Clock,
      text: `Peak calling hour today: ${formatHour(peakHour)}`,
      color: "text-info",
    },
    totalCalls === 0 && {
      icon: Calendar,
      text: "No calls yet today. Your AI is ready to answer!",
      color: "text-muted-foreground",
    },
    avgDurationSeconds && avgDurationSeconds > 120 && {
      icon: Lightbulb,
      text: "Longer calls often mean better customer engagement",
      color: "text-warning",
    },
  ].filter(Boolean);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-warning" />
        <h2 className="text-lg font-semibold">Insights</h2>
      </div>

      <div className="space-y-3">
        {insights.slice(0, 3).map((insight, index) => {
          if (!insight) return null;
          const Icon = insight.icon;
          return (
            <div 
              key={index}
              className={cn(
                "flex items-start gap-3 text-sm animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", insight.color)} />
              <p className="text-muted-foreground">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsPanel;
