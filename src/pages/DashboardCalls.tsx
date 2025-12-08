import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CallCard from "@/components/dashboard/CallCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { toast } from "sonner";

interface CallLog {
  id: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  caller_number: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  recording_url: string | null;
  transcript: string | null;
  summary: string | null;
}

const DashboardCalls = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");

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

        const { data, error } = await supabase
          .from("call_logs")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCalls(data || []);
      } catch (error) {
        console.error("Error fetching calls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [user]);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch = searchQuery
      ? call.caller_number?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesOutcome =
      outcomeFilter === "all" ? true : call.outcome === outcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  const handleExport = () => {
    if (filteredCalls.length === 0) {
      toast.error("No calls to export");
      return;
    }

    const headers = ["Date", "Time", "Caller", "Duration", "Outcome"];
    const csvRows = [headers.join(",")];

    filteredCalls.forEach((call) => {
      const date = call.started_at ? new Date(call.started_at).toLocaleDateString() : "-";
      const time = call.started_at ? new Date(call.started_at).toLocaleTimeString() : "-";
      const caller = call.caller_number || "-";
      const duration = call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, "0")}` : "0:00";
      const outcome = call.outcome || "-";
      csvRows.push([date, time, caller, duration, outcome].join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calls-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calls exported successfully");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calls</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all your call recordings and transcripts.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone number..."
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <SelectValue placeholder="Filter by outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
            <SelectItem value="info_provided">Info Provided</SelectItem>
            <SelectItem value="transferred">Transferred</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
            <SelectItem value="voicemail">Voicemail</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Call Cards */}
      {filteredCalls.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="No calls yet"
          description="Calls will appear here once your AI starts receiving them"
        />
      ) : (
        <div className="grid gap-3">
          {filteredCalls.map((call) => (
            <CallCard
              key={call.id}
              id={call.id}
              callerNumber={call.caller_number}
              startedAt={call.started_at || call.created_at}
              durationSeconds={call.duration_seconds}
              outcome={call.outcome}
              hasRecording={!!call.recording_url}
              hasTranscript={!!call.transcript}
              onClick={() => navigate(`/dashboard/calls/${call.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCalls;
