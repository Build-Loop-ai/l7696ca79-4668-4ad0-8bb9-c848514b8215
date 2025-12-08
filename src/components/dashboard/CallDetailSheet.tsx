import { X, Phone, Calendar, Clock, Play, Pause, FileText, Download, PhoneOutgoing } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef } from "react";

interface CallDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  call: {
    id: string;
    caller_number: string | null;
    started_at: string | null;
    ended_at: string | null;
    duration_seconds: number | null;
    outcome: string | null;
    recording_url: string | null;
    transcript: string | null;
    summary: string | null;
  } | null;
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const outcomeLabels: Record<string, string> = {
  appointment_booked: "Appointment Booked",
  info_provided: "Information Provided",
  transferred: "Transferred to Staff",
  voicemail: "Voicemail Left",
  completed: "Completed",
  missed: "Missed Call",
};

const CallDetailSheet = ({ isOpen, onClose, call }: CallDetailSheetProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!call) return null;

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCallback = () => {
    if (call.caller_number) {
      window.location.href = `tel:${call.caller_number}`;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100 z-[100]" : "opacity-0 pointer-events-none -z-10"
        )}
        onClick={onClose}
      />

      {/* Sheet - slides in from right edge of viewport */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-[420px] bg-card border-l border-border shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0 z-[101]" : "translate-x-full z-[101]"
        )}
        style={{ right: 0, marginRight: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Call Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Caller info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono text-lg font-medium">
                    {call.caller_number || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {call.started_at && format(new Date(call.started_at), "EEEE, MMMM d 'at' HH:mm")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleCallback}>
                  <PhoneOutgoing className="w-4 h-4 mr-2" />
                  Call back
                </Button>
              </div>
            </div>

            {/* Call stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
                </div>
                <p className="text-xl font-semibold tabular-nums">
                  {formatDuration(call.duration_seconds)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Outcome</span>
                </div>
                <p className="text-sm font-medium">
                  {outcomeLabels[call.outcome || ""] || "Unknown"}
                </p>
              </div>
            </div>

            {/* Audio player */}
            {call.recording_url && (
              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Play className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Recording</span>
                  </div>
                  <a 
                    href={call.recording_url} 
                    download 
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  {/* Simple waveform visualization */}
                  <div className="flex-1 flex items-center gap-0.5 h-8">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "flex-1 rounded-full bg-primary/20 transition-all",
                          isPlaying && "animate-pulse"
                        )}
                        style={{ 
                          height: `${20 + Math.random() * 80}%`,
                          animationDelay: `${i * 0.02}s`
                        }}
                      />
                    ))}
                  </div>
                </div>

                <audio 
                  ref={audioRef} 
                  src={call.recording_url}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}

            {/* Summary */}
            {call.summary && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  AI Summary
                </h3>
                <p className="text-sm leading-relaxed">
                  {call.summary}
                </p>
              </div>
            )}

            {/* Transcript */}
            {call.transcript && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Transcript
                  </h3>
                </div>
                <div className="rounded-xl bg-muted/30 p-4 max-h-64 overflow-y-auto scrollbar-thin">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {call.transcript}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default CallDetailSheet;
