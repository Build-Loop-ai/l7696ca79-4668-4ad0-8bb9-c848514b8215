import { useEffect, useState } from "react";
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
  Voicemail,
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
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format, isToday, parseISO } from "date-fns";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { PhoneNumberDialog } from "@/components/dashboard/PhoneNumberDialog";
import { TestCallDialog } from "@/components/dashboard/TestCallDialog";
import { toast } from "sonner";

interface CallLog {
  id: string;
  started_at: string | null;
  caller_number: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  recording_url: string | null;
  transcript: string | null;
}

interface Subscription {
  minutes_used: number | null;
  minutes_included: number | null;
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

const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  try {
    return format(parseISO(dateStr), "HH:mm");
  } catch {
    return "-";
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Setup state
  const [hasAssistant, setHasAssistant] = useState(false);
  const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
  const [hasTestCall, setHasTestCall] = useState(false);
  const [assistantId, setAssistantId] = useState<string | undefined>();
  const [aiPhoneNumber, setAiPhoneNumber] = useState<string | null>(null);

  // Dialog state
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get user's organization
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        if (!profile?.organization_id) {
          setLoading(false);
          return;
        }

        setOrganizationId(profile.organization_id);

        // Fetch all data in parallel
        const [callsRes, subRes, settingsRes, phonesRes] = await Promise.all([
          supabase
            .from("call_logs")
            .select("id, started_at, caller_number, duration_seconds, outcome, recording_url, transcript")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("subscriptions")
            .select("minutes_used, minutes_included")
            .eq("organization_id", profile.organization_id)
            .single(),
          supabase
            .from("organization_settings")
            .select("vapi_assistant_id")
            .eq("organization_id", profile.organization_id)
            .single(),
          supabase
            .from("phone_numbers")
            .select("id, phone_number")
            .eq("organization_id", profile.organization_id)
            .eq("is_active", true),
        ]);

        if (callsRes.data) {
          setCalls(callsRes.data);
          // Has test call if there's at least one call
          setHasTestCall(callsRes.data.length > 0);
        }

        if (subRes.data) {
          setSubscription(subRes.data);
        }

        if (settingsRes.data?.vapi_assistant_id) {
          setHasAssistant(true);
          setAssistantId(settingsRes.data.vapi_assistant_id);
        }

        if (phonesRes.data && phonesRes.data.length > 0) {
          const activePhone = phonesRes.data[0];
          // Only set as valid phone number if it looks like a real phone number (starts with +)
          if (activePhone.phone_number?.startsWith('+')) {
            setHasPhoneNumber(true);
            setAiPhoneNumber(activePhone.phone_number);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats from real data
  const todaysCalls = calls.filter(
    (call) => call.started_at && isToday(parseISO(call.started_at))
  );

  const todaysAppointments = todaysCalls.filter(
    (call) => call.outcome === "appointment_booked"
  ).length;

  const todaysTotalCalls = todaysCalls.length;

  const avgDurationSeconds =
    todaysCalls.length > 0
      ? Math.round(
          todaysCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) /
            todaysCalls.length
        )
      : 0;

  const answeredCalls = todaysCalls.filter(
    (call) => call.outcome && call.outcome !== "missed"
  ).length;

  const missedCalls = todaysCalls.filter(
    (call) => call.outcome === "missed"
  ).length;

  const resolutionRate =
    todaysCalls.length > 0
      ? Math.round((answeredCalls / todaysCalls.length) * 100)
      : 0;

  const conversionRate =
    todaysTotalCalls > 0
      ? Math.round((todaysAppointments / todaysTotalCalls) * 100)
      : 0;

  const lastCallTime = calls.length > 0 ? formatTime(calls[0].started_at) : "-";

  const stats = [
    {
      title: "Today's Calls",
      value: todaysTotalCalls.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Phone,
    },
    {
      title: "Appointments Booked",
      value: todaysAppointments.toString(),
      change: conversionRate > 0 ? `${conversionRate}%` : "",
      changeType: "positive" as const,
      icon: Calendar,
      subtitle: "conversion",
    },
    {
      title: "Avg Call Duration",
      value: formatDuration(avgDurationSeconds),
      change: "",
      changeType: "neutral" as const,
      icon: Clock,
    },
    {
      title: "AI Resolution Rate",
      value: `${resolutionRate}%`,
      change: "",
      changeType: resolutionRate >= 80 ? "positive" as const : "neutral" as const,
      icon: TrendingUp,
    },
  ];

  const handlePhoneSuccess = () => {
    setHasPhoneNumber(true);
    setShowPhoneDialog(false);
  };

  const handleTestCallComplete = () => {
    setHasTestCall(true);
  };

  const handleCreateAssistant = async () => {
    if (!organizationId) return;
    
    setIsCreatingAssistant(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-vapi-assistant", {
        body: { organizationId },
      });

      if (error) throw error;

      if (data?.assistantId) {
        setHasAssistant(true);
        setAssistantId(data.assistantId);
        toast.success("AI Receptionist created successfully!");
      }
    } catch (error: any) {
      console.error("Error creating assistant:", error);
      toast.error(error.message || "Failed to create AI assistant");
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  // Check if setup is complete
  const setupComplete = hasAssistant && hasPhoneNumber && hasTestCall;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {setupComplete
              ? "Welcome back! Here's what's happening today."
              : "Let's get your AI receptionist ready for production."}
          </p>
        </div>
      </div>

      {/* Setup Checklist - shown until complete */}
      {!setupComplete && organizationId && (
        <SetupChecklist
          hasAssistant={hasAssistant}
          hasPhoneNumber={hasPhoneNumber}
          hasTestCall={hasTestCall}
          onCreateAssistant={handleCreateAssistant}
          onGetPhoneNumber={() => setShowPhoneDialog(true)}
          onTestCall={() => setShowTestDialog(true)}
          isCreatingAssistant={isCreatingAssistant}
        />
      )}

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
                    {stat.change && (
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stat.change}
                      </span>
                    )}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/calls")}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {calls.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No calls yet</p>
                <p className="text-sm mt-1 mb-4">
                  {hasPhoneNumber
                    ? "Calls will appear here once customers start calling"
                    : "Get a phone number to start receiving calls"}
                </p>
                {!hasPhoneNumber && organizationId && (
                  <Button onClick={() => setShowPhoneDialog(true)}>
                    Get Phone Number
                  </Button>
                )}
              </div>
            ) : (
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
                  {calls.slice(0, 5).map((call) => {
                    const outcome = call.outcome
                      ? outcomeConfig[call.outcome] || outcomeConfig.completed
                      : outcomeConfig.completed;
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          {formatTime(call.started_at)}
                        </TableCell>
                        <TableCell>{call.caller_number || "-"}</TableCell>
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
                                onClick={() =>
                                  window.open(call.recording_url!, "_blank")
                                }
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {call.transcript && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            {call.caller_number && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  window.open(`tel:${call.caller_number}`)
                                }
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
                {hasPhoneNumber ? "Ready to receive calls" : "Setup in progress"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Last call: {lastCallTime}
              </p>

              {/* AI Phone Number Display */}
              {aiPhoneNumber && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Your AI Number</p>
                  <a 
                    href={`tel:${aiPhoneNumber}`}
                    className="text-lg font-medium text-primary hover:underline"
                  >
                    {aiPhoneNumber}
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h4 className="text-sm font-medium text-foreground mb-4">
                Today's Summary
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calls answered</span>
                  <span className="font-medium text-foreground">
                    {answeredCalls}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calls missed</span>
                  <span className="font-medium text-foreground">
                    {missedCalls}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Minutes used</span>
                  <span className="font-medium text-foreground">
                    {subscription?.minutes_used ?? 0} /{" "}
                    {subscription?.minutes_included ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            {hasAssistant && (
              <div className="border-t border-border pt-6 mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowTestDialog(true)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Test Your AI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {organizationId && (
        <>
          <PhoneNumberDialog
            open={showPhoneDialog}
            onOpenChange={setShowPhoneDialog}
            organizationId={organizationId}
            onSuccess={handlePhoneSuccess}
          />
          <TestCallDialog
            open={showTestDialog}
            onOpenChange={setShowTestDialog}
            assistantId={assistantId}
            phoneNumber={aiPhoneNumber || undefined}
            onCallComplete={handleTestCallComplete}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
