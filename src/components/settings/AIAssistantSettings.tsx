import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoicePreview } from "@/components/VoicePreview";
import { TestCallButton } from "@/components/TestCallButton";
import { getDefaultGreeting, getDefaultVoiceId, migrateOldVoiceId, getLanguageByCode } from "@/lib/voice-config";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveStatusIndicator } from "@/components/ui/save-status";

interface AIAssistantSettingsProps {
  organizationId?: string;
}

export function AIAssistantSettings({ organizationId: propOrgId }: AIAssistantSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(propOrgId || null);
  const [organizationName, setOrganizationName] = useState<string>("your business");
  
  // Voice & Language
  const [language, setLanguage] = useState("en-US");
  const [voiceId, setVoiceId] = useState(getDefaultVoiceId());
  
  // Greeting & Instructions
  const [customGreeting, setCustomGreeting] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Memoized settings data for auto-save
  const settingsData = useMemo(() => ({
    language,
    voiceId,
    customGreeting,
    specialInstructions,
    assistantId,
  }), [language, voiceId, customGreeting, specialInstructions, assistantId]);

  // Save function for database
  const saveToDatabase = useCallback(async (data: typeof settingsData) => {
    if (!organizationId) return;

    // Save special instructions to organizations table
    const { error: orgError } = await supabase
      .from("organizations")
      .update({ special_instructions: data.specialInstructions })
      .eq("id", organizationId);

    if (orgError) throw orgError;

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("organization_settings")
      .select("id")
      .eq("organization_id", organizationId)
      .single();

    // Get the correct transcriber language from voice-config
    const langConfig = getLanguageByCode(data.language);
    const transcriberLang = langConfig?.transcriberLang || data.language.split("-")[0];

    const settingsPayload = {
      language: data.language,
      transcriber_language: transcriberLang,
      voice_id: data.voiceId,
      voice_provider: "elevenlabs",
      custom_greeting: data.customGreeting,
    };

    if (existingSettings) {
      const { error } = await supabase
        .from("organization_settings")
        .update(settingsPayload)
        .eq("organization_id", organizationId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("organization_settings")
        .insert({ ...settingsPayload, organization_id: organizationId });
      if (error) throw error;
    }
  }, [organizationId]);

  // Sync function for Vapi
  const syncToVapi = useCallback(async (data: typeof settingsData) => {
    if (!organizationId) return;

    // Sync to Vapi assistant
    if (data.assistantId) {
      // Get the correct transcriber language from voice-config
      const langConfig = getLanguageByCode(data.language);
      const transcriberLang = langConfig?.transcriberLang || data.language.split("-")[0];
      
      await supabase.functions.invoke("update-vapi-assistant", {
        body: {
          organizationId,
          updates: {
            voice: { voiceId: data.voiceId, provider: "11labs", model: "eleven_multilingual_v2" },
            transcriber: { language: transcriberLang },
            firstMessage: data.customGreeting,
          },
        },
      });
    }

    // Also sync business context to assistant
    await supabase.functions.invoke("create-vapi-assistant", {
      body: { organizationId },
    });
  }, [organizationId]);

  // Auto-save hook
  const { status, syncStatus } = useAutoSave({
    data: settingsData,
    onSave: saveToDatabase,
    onSync: syncToVapi,
    debounceMs: 1500,
    syncDebounceMs: 4000,
    enabled: dataLoaded && !!organizationId,
  });

  // Load organization ID if not provided
  useEffect(() => {
    async function loadOrgId() {
      if (propOrgId) {
        setOrganizationId(propOrgId);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
        
      if (profile?.organization_id) {
        setOrganizationId(profile.organization_id);
      }
    }
    loadOrgId();
  }, [propOrgId]);

  // Load settings when org ID is available
  useEffect(() => {
    if (!organizationId) return;

    async function loadSettings() {
      setLoading(true);
      try {
        // Load organization name and special instructions
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name, special_instructions")
          .eq("id", organizationId)
          .single();
          
        if (orgData) {
          setOrganizationName(orgData.name || "your business");
          setSpecialInstructions(orgData.special_instructions || "");
        }

        // Load phone number
        const { data: phoneData } = await supabase
          .from("phone_numbers")
          .select("phone_number")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();
          
        if (phoneData?.phone_number?.match(/^\+?[\d\s\-()]+$/)) {
          setPhoneNumber(phoneData.phone_number);
        }

        // Load voice/language settings
        const { data, error } = await supabase
          .from("organization_settings")
          .select("language, voice_id, custom_greeting, vapi_assistant_id")
          .eq("organization_id", organizationId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          const lang = data.language || "en-US";
          setLanguage(lang);
          const migratedVoiceId = migrateOldVoiceId(data.voice_id || getDefaultVoiceId());
          setVoiceId(migratedVoiceId);
          setCustomGreeting(data.custom_greeting || getDefaultGreeting(lang, orgData?.name || "your business"));
          setAssistantId(data.vapi_assistant_id);
        } else {
          setCustomGreeting(getDefaultGreeting(language, orgData?.name || "your business"));
        }

        // Enable auto-save after initial load
        setTimeout(() => setDataLoaded(true), 100);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error loading settings",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [organizationId, toast]);

  const handleVoiceSelect = (id: string) => {
    setVoiceId(id);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Reset greeting to default for new language if empty
    if (!customGreeting) {
      setCustomGreeting(getDefaultGreeting(newLanguage, organizationName));
    }
  };

  const resetGreeting = () => {
    setCustomGreeting(getDefaultGreeting(language, organizationName));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Status Indicator */}
      <div className="flex justify-end">
        <SaveStatusIndicator status={status} syncStatus={syncStatus} />
      </div>

      {/* Voice & Language */}
      <Card>
        <CardHeader>
          <CardTitle>Voice & Language</CardTitle>
          <CardDescription>
            Choose how your AI assistant sounds to callers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoicePreview
            selectedVoice={voiceId}
            onSelectVoice={(id) => handleVoiceSelect(id)}
            selectedLanguage={language}
            onSelectLanguage={handleLanguageChange}
            businessName={organizationName}
          />
        </CardContent>
      </Card>

      {/* Custom Greeting */}
      <Card>
        <CardHeader>
          <CardTitle>Greeting Message</CardTitle>
          <CardDescription>
            The first thing your AI says when answering a call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="greeting">Custom Greeting</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetGreeting}
                className="h-8 text-xs"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset to Default
              </Button>
            </div>
            <Textarea
              id="greeting"
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              placeholder="Hello! Thank you for calling..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This is the first message callers will hear when your AI answers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>AI Behavior & Instructions</CardTitle>
          <CardDescription>
            Tell your AI how to handle specific situations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Examples:&#10;- Always ask for the caller's phone number&#10;- For emergencies, transfer to the on-call number&#10;- Don't book appointments on holidays&#10;- Mention our current promotion for new patients"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              These instructions guide how your AI handles calls. Be specific about what it should and shouldn't do.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Your AI - Eye-catching Hero Section */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary via-secondary to-secondary/90">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" />
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-secondary-foreground">Ready to Test?</h3>
              <p className="text-secondary-foreground/70 text-sm">
                Experience your AI receptionist in action
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-border/20">
              <TestCallButton 
                assistantId={assistantId || undefined}
                phoneNumber={phoneNumber || undefined}
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-secondary-foreground/50 text-center sm:text-left">
            Call your AI to hear your greeting, voice, and test how it handles questions
          </p>
        </div>
      </Card>
    </div>
  );
}
