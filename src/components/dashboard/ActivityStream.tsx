import { Phone, Calendar, Info, ArrowRight, PhoneForwarded, Voicemail, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CallLog {
  id: string;
  caller_number: string | null;
  started_at: string | null;
  outcome: string | null;
  duration_seconds: number | null;
}

interface ActivityStreamProps {
  calls: CallLog[];
  isLoading?: boolean;
}

const outcomeConfig: Record<string, { label: string; icon: typeof Phone; color: string }> = {
  appointment_booked: { 
    label: "Appointment booked", 
    icon: Calendar, 
    color: "text-success" 
  },
  info_provided: { 
    label: "Info provided", 
    icon: Info, 
    color: "text-info" 
  },
  transferred: { 
    label: "Transferred", 
    icon: PhoneForwarded, 
    color: "text-warning" 
  },
  voicemail: { 
    label: "Voicemail", 
    icon: Voicemail, 
    color: "text-muted-foreground" 
  },
  completed: { 
    label: "Completed", 
    icon: CheckCircle2, 
    color: "text-success" 
  },
  missed: { 
    label: "Missed", 
    icon: XCircle, 
    color: "text-destructive" 
  },
};

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "Unknown";
  if (phone.length > 8) {
    return `${phone.slice(0, 4)}...${phone.slice(-4)}`;
  }
  return phone;
};

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
};

const ActivityStream = ({ calls, isLoading }: ActivityStreamProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Live Activity</h2>
        <Link to="/dashboard/calls">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            See all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-8">
          <Phone className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No calls yet today</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Your AI is ready to answer
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {calls.slice(0, 5).map((call, index) => {
            const config = outcomeConfig[call.outcome || ""] || {
              label: "Call",
              icon: Phone,
              color: "text-muted-foreground",
            };
            const Icon = config.icon;
            const isRecent = index === 0 && call.started_at && 
              new Date().getTime() - new Date(call.started_at).getTime() < 5 * 60 * 1000;

            return (
              <Link
                key={call.id}
                to="/dashboard/calls"
                className={cn(
                  "flex items-center gap-4 p-3 -mx-3 rounded-xl transition-colors",
                  "hover:bg-muted/50 cursor-pointer group",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Status indicator */}
                <div className="relative">
                  <span className={cn(
                    "block w-2 h-2 rounded-full",
                    isRecent ? "bg-success" : "bg-border"
                  )} />
                  {isRecent && (
                    <span className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping" />
                  )}
                </div>

                {/* Time */}
                <span className="text-xs text-muted-foreground w-20 shrink-0">
                  {formatTime(call.started_at)}
                </span>

                {/* Phone number */}
                <span className="font-mono text-sm text-foreground/80 w-24 shrink-0">
                  {formatPhoneNumber(call.caller_number)}
                </span>

                {/* Outcome */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
                  <span className="text-sm text-muted-foreground truncate">
                    {config.label}
                  </span>
                </div>

                {/* Arrow on hover */}
                <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityStream;
