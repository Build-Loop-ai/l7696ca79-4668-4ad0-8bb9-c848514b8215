import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  FileText,
  PhoneCall,
  CheckCircle2,
  Info,
  PhoneForwarded,
  PhoneMissed,
  Search,
  Calendar,
  Download,
  Pause,
  Phone,
  Voicemail,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";

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
  voicemail: {
    label: "Voicemail",
    color: "bg-purple-100 text-purple-700",
    icon: Voicemail,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-100 text-gray-700",
    icon: Phone,
  },
};

const formatDuration = (seconds: number | null): string => {
  if (!seconds || seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  try {
    return format(parseISO(dateStr), "yyyy-MM-dd");
  } catch {
    return "-";
  }
};

const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  try {
    return format(parseISO(dateStr), "HH:mm");
  } catch {
    return "-";
  }
};

const DashboardCalls = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Calls</h1>
          <p className="text-muted-foreground">
            View and manage all your call recordings and transcripts.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="appointment_booked">
                    Appointment Booked
                  </SelectItem>
                  <SelectItem value="info_provided">Info Provided</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calls Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No calls yet</p>
              <p className="text-sm mt-1">
                Calls will appear here once your AI starts receiving them
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.map((call) => {
                  const outcome = call.outcome
                    ? outcomeConfig[call.outcome] || outcomeConfig.completed
                    : outcomeConfig.completed;
                  return (
                    <TableRow
                      key={call.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCall(call)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDate(call.started_at || call.created_at)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(call.started_at || call.created_at)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {call.caller_number || "-"}
                      </TableCell>
                      <TableCell>
                        {formatDuration(call.duration_seconds)}
                      </TableCell>
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
                          {call.recording_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(call.recording_url!, "_blank");
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {call.transcript && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCall(call);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                          {call.caller_number && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${call.caller_number}`);
                              }}
                            >
                              <PhoneCall className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Call Detail Modal */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">Call Details</DialogTitle>
          </DialogHeader>

          {selectedCall && (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">
              {/* Left side - Audio player */}
              <div className="md:w-1/2 space-y-4">
                <div className="bg-muted/50 rounded-xl p-6">
                  {selectedCall.recording_url ? (
                    <div className="flex items-center gap-4 mb-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <audio
                          src={selectedCall.recording_url}
                          controls
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No recording available
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Caller</span>
                      <span className="font-mono">
                        {selectedCall.caller_number || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span>
                        {formatDate(
                          selectedCall.started_at || selectedCall.created_at
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span>
                        {formatTime(
                          selectedCall.started_at || selectedCall.created_at
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span>
                        {formatDuration(selectedCall.duration_seconds)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground">Outcome</span>
                      {selectedCall.outcome && (
                        <Badge
                          variant="secondary"
                          className={`gap-1 ${
                            (
                              outcomeConfig[selectedCall.outcome] ||
                              outcomeConfig.completed
                            ).color
                          }`}
                        >
                          {
                            (
                              outcomeConfig[selectedCall.outcome] ||
                              outcomeConfig.completed
                            ).label
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedCall.caller_number && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() =>
                        window.open(`tel:${selectedCall.caller_number}`)
                      }
                    >
                      <PhoneCall className="w-4 h-4" />
                      Call Back
                    </Button>
                  )}
                  {selectedCall.recording_url && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() =>
                        window.open(selectedCall.recording_url!, "_blank")
                      }
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>

              {/* Right side - Transcript */}
              <div className="md:w-1/2 flex flex-col">
                <h3 className="font-medium text-foreground mb-4">Transcript</h3>
                <div className="flex-1 overflow-y-auto pr-2">
                  {selectedCall.transcript ? (
                    <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap">
                      {selectedCall.transcript}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No transcript available for this call.
                    </div>
                  )}
                </div>

                {selectedCall.summary && (
                  <div className="mt-4">
                    <h3 className="font-medium text-foreground mb-2">
                      Summary
                    </h3>
                    <div className="bg-primary/5 rounded-lg p-4 text-sm">
                      {selectedCall.summary}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCalls;
