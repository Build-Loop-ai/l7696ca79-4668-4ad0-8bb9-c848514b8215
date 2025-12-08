import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Phone, Calendar, Clock, Play, Pause, FileText, Download, PhoneOutgoing } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRef } from "react";

interface CallLog {
  id: string;
  caller_number: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  recording_url: string | null;
  transcript: string | null;
  summary: string | null;
  created_at: string;
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

const outcomeColors: Record<string, string> = {
  appointment_booked: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  info_provided: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  transferred: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  voicemail: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  missed: "bg-red-500/10 text-red-600 border-red-500/20",
};

const DashboardCallDetail = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [call, setCall] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchCall = async () => {
      if (!user || !callId) return;

      // Get organization_id from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .eq("id", callId)
        .eq("organization_id", profile.organization_id)
        .single();

      if (!error && data) {
        setCall(data);
      }
      setLoading(false);
    };

    fetchCall();
  }, [callId, user]);

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
    if (call?.caller_number) {
      window.location.href = `tel:${call.caller_number}`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/calls")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calls
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Call not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate("/dashboard/calls")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Calls
      </Button>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Phone className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold">
                {call.caller_number || "Unknown Caller"}
              </p>
              <p className="text-muted-foreground">
                {call.started_at && format(new Date(call.started_at), "EEEE, MMMM d, yyyy 'at' HH:mm")}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCallback}>
              <PhoneOutgoing className="w-4 h-4 mr-2" />
              Call Back
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            {formatDuration(call.duration_seconds)}
          </p>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Outcome</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${outcomeColors[call.outcome || ""] || "bg-muted text-muted-foreground border-border"}`}>
            {outcomeLabels[call.outcome || ""] || "Unknown"}
          </span>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Phone className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Direction</span>
          </div>
          <p className="text-sm font-medium">Inbound</p>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Ended</span>
          </div>
          <p className="text-sm font-medium">
            {call.ended_at ? format(new Date(call.ended_at), "HH:mm") : "—"}
          </p>
        </div>
      </div>

      {/* Recording player */}
      {call.recording_url && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Call Recording</h3>
            </div>
            <a 
              href={call.recording_url} 
              download 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0 w-12 h-12"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            {/* Waveform visualization */}
            <div className="flex-1 flex items-center gap-0.5 h-12">
              {Array.from({ length: 60 }).map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 rounded-full bg-primary/20 transition-all ${isPlaying ? "animate-pulse" : ""}`}
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

      {/* AI Summary */}
      {call.summary && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h3 className="font-semibold">AI Summary</h3>
          <p className="text-muted-foreground leading-relaxed">
            {call.summary}
          </p>
        </div>
      )}

      {/* Transcript */}
      {call.transcript && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Full Transcript</h3>
          </div>
          <div className="rounded-lg bg-muted/30 p-4 max-h-96 overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {call.transcript}
            </p>
          </div>
        </div>
      )}

      {/* Empty state for no recording/transcript */}
      {!call.recording_url && !call.transcript && !call.summary && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-muted-foreground">No recording or transcript available for this call</p>
        </div>
      )}
    </div>
  );
};

export default DashboardCallDetail;
