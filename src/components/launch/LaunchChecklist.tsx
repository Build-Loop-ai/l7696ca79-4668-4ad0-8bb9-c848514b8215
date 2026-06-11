import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, AlertTriangle, Rocket, Copy, RefreshCw,
  Database, Mic, Phone, PartyPopper,
} from "lucide-react";

interface Integration {
  name: string;
  configured: boolean;
  connected: boolean | null;
  error: string | null;
  secrets: string[];
}

interface HealthResponse {
  success: boolean;
  integrations: Integration[];
}

// What each optional integration unlocks, in buyer language.
// Vapi + Twilio are NOT here — they're required and covered by the core checks.
const UNLOCKS: Record<string, string> = {
  "Stripe (Payments)": "Charge clients and take payments",
  "Resend (Email)": "Email call summaries and notifications",
  "Google (Calendar)": "Let the AI book into your calendar",
  "ElevenLabs (Voice Synthesis)": "Premium, more natural voices",
};
const CORE_INTEGRATIONS = ["Vapi", "Twilio"];

function StatusDot({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
    : <XCircle className="h-5 w-5 text-muted-foreground/50 shrink-0" />;
}

const isRealPhone = (n: string) => /^\+?[\d\s\-()]+$/.test(n);

export function LaunchChecklist() {
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [hasAssistant, setHasAssistant] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[] | null>(null);

  const run = async () => {
    setLoading(true);
    setDbError(null);

    // 1. Core state — DB probe + the two things that make the line answer.
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user?.id ?? "")
        .maybeSingle();
      if (pErr) throw pErr;

      const orgId = profile?.organization_id;
      if (orgId) {
        const [settingsRes, phonesRes] = await Promise.all([
          supabase.from("organization_settings").select("vapi_assistant_id").eq("organization_id", orgId).maybeSingle(),
          supabase.from("phone_numbers").select("phone_number").eq("organization_id", orgId).eq("is_active", true),
        ]);
        if (phonesRes.error) throw phonesRes.error;
        setHasAssistant(!!settingsRes.data?.vapi_assistant_id);
        const real = (phonesRes.data ?? []).map(p => p.phone_number).find(isRealPhone);
        setPhoneNumber(real ?? null);
      } else {
        setHasAssistant(false);
        setPhoneNumber(null);
      }
      setDbReady(true);
    } catch (e) {
      setDbReady(false);
      setDbError(e instanceof Error ? e.message : "Database unreachable");
      setHasAssistant(false);
      setPhoneNumber(null);
    }

    // 2. Optional integration status (best-effort)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-check`,
        { headers: { Authorization: `Bearer ${session?.access_token ?? ""}` } },
      );
      if (res.ok) {
        const json: HealthResponse = await res.json();
        setIntegrations((json.integrations ?? []).filter(
          i => !CORE_INTEGRATIONS.some(c => i.name.includes(c)),
        ));
      }
    } catch {
      // leave integrations null; core checks still render
    }

    setLoading(false);
  };

  useEffect(() => { run(); }, []);

  const isLive = dbReady === true && hasAssistant && !!phoneNumber;

  const copyNumber = () => {
    if (!phoneNumber) return;
    navigator.clipboard.writeText(phoneNumber);
    toast.success("Phone number copied");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero status */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${
        isLive ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isLive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {isLive ? <PartyPopper className="h-6 w-6" /> : <Rocket className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">
              {isLive ? "You're live" : "Let's get you live"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLive
                ? "Your AI receptionist is answering. Add-ons below unlock extra features."
                : "Three checks stand between you and an AI that answers the phone."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={run} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Re-check
          </Button>
        </div>
      </div>

      {/* Core steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required to go live</CardTitle>
          <CardDescription>These make your AI answer real calls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <StatusDot ok={dbReady === true} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <Database className="h-4 w-4 text-muted-foreground" /> Database connected
              </div>
              {dbReady === true ? (
                <p className="text-sm text-muted-foreground mt-0.5">Your tables are set up and reachable.</p>
              ) : (
                <p className="text-sm text-destructive mt-0.5">
                  Can't reach your database. Apply the migrations in <code className="font-mono">supabase/migrations</code>,
                  and if this is a free Supabase project, make sure it isn't paused.
                  {dbError && <span className="block text-xs text-muted-foreground mt-1">({dbError})</span>}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <StatusDot ok={hasAssistant} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <Mic className="h-4 w-4 text-muted-foreground" /> AI receptionist created
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {hasAssistant
                  ? "Your AI assistant is configured."
                  : "Create your AI receptionist from the dashboard. Needs your Vapi key in Secrets."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <StatusDot ok={!!phoneNumber} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-muted-foreground" /> Phone number connected
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {phoneNumber
                  ? "Customers can call your AI now."
                  : "Add a number in Settings → Phone Numbers. Needs your Twilio keys in Secrets."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share — only when live */}
      {isLive && phoneNumber && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Your AI answers here</CardTitle>
            <CardDescription>Forward your business line to this number, or hand it out directly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-xl bg-muted p-3">
              <code className="flex-1 truncate text-base font-mono font-medium">{phoneNumber}</code>
              <Button size="sm" variant="outline" onClick={copyNumber} className="gap-1.5 shrink-0">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Free-tier warning */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-900">Putting this in front of a paying client?</p>
          <p className="text-amber-800 mt-0.5">
            Free Supabase projects pause after about a week of inactivity — your receptionist stops answering until it's woken.
            For anything client-facing, use a paid Supabase project so it never sleeps.
          </p>
        </div>
      </div>

      {/* Optional add-ons */}
      {integrations && integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unlock more (optional)</CardTitle>
            <CardDescription>
              Add a key in <span className="font-medium text-foreground">Settings → Backend → Secrets</span> to switch each on.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map((it) => {
              const ok = it.configured && it.connected !== false;
              return (
                <div key={it.name} className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <StatusDot ok={ok} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{it.name}</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {UNLOCKS[it.name] ?? "Optional integration"}
                    </p>
                    {it.configured && it.connected === false && (
                      <p className="text-xs text-amber-700 mt-1">
                        Key is set but the connection failed{it.error ? `: ${it.error}` : "."} Double-check the value.
                      </p>
                    )}
                    {!it.configured && (
                      <p className="text-xs text-muted-foreground/80 mt-1 font-mono">
                        Needs: {it.secrets.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LaunchChecklist;
