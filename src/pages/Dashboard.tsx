import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { isToday, parseISO, getHours } from "date-fns";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { PhoneNumberDialog } from "@/components/dashboard/PhoneNumberDialog";
import { TestCallDialog } from "@/components/dashboard/TestCallDialog";
import { toast } from "sonner";
import StatusHero from "@/components/dashboard/StatusHero";
import ActivityStream from "@/components/dashboard/ActivityStream";
import InsightsPanel from "@/components/dashboard/InsightsPanel";

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface CallLog {
  id: string;
  started_at: string | null;
  caller_number: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  recording_url: string | null;
  transcript: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [userName, setUserName] = useState<string>("");

  // Setup state
  const [hasAssistant, setHasAssistant] = useState(false);
  const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
  const [hasTestCall, setHasTestCall] = useState(false);
  const [assistantId, setAssistantId] = useState<string | undefined>();
  const [aiPhoneNumber, setAiPhoneNumber] = useState<string | null>(null);
  const [vapiPhoneId, setVapiPhoneId] = useState<string | null>(null);
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);

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
          .select("organization_id, onboarding_completed, full_name")
          .eq("id", user.id)
          .single();

        if (!profile?.organization_id) {
          setLoading(false);
          return;
        }

        setOrganizationId(profile.organization_id);
        setOnboardingCompleted(profile.onboarding_completed ?? false);
        setUserName(profile.full_name || user.email?.split("@")[0] || "");

        // Fetch all data in parallel
        const [callsRes, settingsRes, phonesRes] = await Promise.all([
          supabase
            .from("call_logs")
            .select("id, started_at, caller_number, duration_seconds, outcome, recording_url, transcript")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("organization_settings")
            .select("vapi_assistant_id")
            .eq("organization_id", profile.organization_id)
            .single(),
          supabase
            .from("phone_numbers")
            .select("id, phone_number, vapi_phone_id, status")
            .eq("organization_id", profile.organization_id)
            .eq("is_active", true),
        ]);

        if (callsRes.data) {
          setCalls(callsRes.data);
          setHasTestCall(callsRes.data.length > 0);
        }

        if (settingsRes.data?.vapi_assistant_id) {
          setHasAssistant(true);
          setAssistantId(settingsRes.data.vapi_assistant_id);
        }

        if (phonesRes.data && phonesRes.data.length > 0) {
          const activePhone = phonesRes.data[0];
          if (activePhone.phone_number?.startsWith('+')) {
            setHasPhoneNumber(true);
            setAiPhoneNumber(activePhone.phone_number);
            setVapiPhoneId(activePhone.vapi_phone_id || null);
            setIsPhoneConnected(!!activePhone.vapi_phone_id);
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

  const resolutionRate =
    todaysCalls.length > 0
      ? Math.round((answeredCalls / todaysCalls.length) * 100)
      : 100;

  // Calculate peak hour
  const peakHour = todaysCalls.length > 0
    ? (() => {
        const hourCounts: Record<number, number> = {};
        todaysCalls.forEach((call) => {
          if (call.started_at) {
            const hour = getHours(parseISO(call.started_at));
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          }
        });
        const maxHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
        return maxHour ? parseInt(maxHour[0]) : undefined;
      })()
    : undefined;

  // Get last call time
  const lastCallTime = calls.length > 0 && calls[0].started_at
    ? parseISO(calls[0].started_at)
    : undefined;

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
  const setupComplete = onboardingCompleted || (hasAssistant && hasPhoneNumber && hasTestCall);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Hero Status Card */}
      <StatusHero
        isLive={hasAssistant && hasPhoneNumber}
        lastCallTime={lastCallTime ? lastCallTime.toISOString() : null}
        todayCalls={todaysTotalCalls}
        todayBooked={todaysAppointments}
        avgDuration={formatDuration(avgDurationSeconds)}
        resolutionRate={resolutionRate}
        userName={userName}
      />

      {/* Activity Stream + Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <ActivityStream 
          calls={todaysCalls.slice(0, 5).map(call => ({
            id: call.id,
            caller_number: call.caller_number,
            started_at: call.started_at || "",
            outcome: call.outcome,
            duration_seconds: call.duration_seconds,
          }))}
          isLoading={loading}
        />
        
        <InsightsPanel
          totalCalls={todaysTotalCalls}
          appointmentsBooked={todaysAppointments}
          peakHour={peakHour}
          avgDurationSeconds={avgDurationSeconds}
        />
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
