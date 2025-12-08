import { Phone, Calendar, Info, PhoneForwarded, Voicemail, CheckCircle2, XCircle, Play, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface CallCardProps {
  id: string;
  callerNumber: string | null;
  startedAt: string | null;
  durationSeconds: number | null;
  outcome: string | null;
  hasRecording: boolean;
  hasTranscript: boolean;
  onClick: () => void;
}

const outcomeConfig: Record<string, { label: string; icon: typeof Phone; bgColor: string; textColor: string }> = {
  appointment_booked: { 
    label: "Booked", 
    icon: Calendar, 
    bgColor: "bg-success-muted",
    textColor: "text-success" 
  },
  info_provided: { 
    label: "Info", 
    icon: Info, 
    bgColor: "bg-info-muted",
    textColor: "text-info" 
  },
  transferred: { 
    label: "Transferred", 
    icon: PhoneForwarded, 
    bgColor: "bg-warning-muted",
    textColor: "text-warning" 
  },
  voicemail: { 
    label: "Voicemail", 
    icon: Voicemail, 
    bgColor: "bg-muted",
    textColor: "text-muted-foreground" 
  },
  completed: { 
    label: "Completed", 
    icon: CheckCircle2, 
    bgColor: "bg-success-muted",
    textColor: "text-success" 
  },
  missed: { 
    label: "Missed", 
    icon: XCircle, 
    bgColor: "bg-destructive/10",
    textColor: "text-destructive" 
  },
};

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "Unknown caller";
  return phone;
};

const CallCard = ({
  callerNumber,
  startedAt,
  durationSeconds,
  outcome,
  hasRecording,
  hasTranscript,
  onClick,
}: CallCardProps) => {
  const config = outcomeConfig[outcome || ""] || {
    label: "Call",
    icon: Phone,
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
  };
  const Icon = config.icon;

  const formattedDate = startedAt 
    ? format(new Date(startedAt), "MMM d") 
    : "";
  const formattedTime = startedAt 
    ? format(new Date(startedAt), "HH:mm") 
    : "";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl bg-card border border-border p-4",
        "transition-all duration-200 card-hover",
        "hover:border-border/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Main info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Phone number */}
          <p className="font-mono text-base font-medium truncate">
            {formatPhoneNumber(callerNumber)}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{formattedDate} at {formattedTime}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(durationSeconds)}
            </span>
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2">
            {hasRecording && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <Play className="w-3 h-3" />
                Recording
              </span>
            )}
            {hasTranscript && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <FileText className="w-3 h-3" />
                Transcript
              </span>
            )}
          </div>
        </div>

        {/* Right side - Outcome badge */}
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0",
          config.bgColor,
          config.textColor
        )}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </div>
      </div>
    </button>
  );
};

export default CallCard;
