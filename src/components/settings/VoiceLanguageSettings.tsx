import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  SUPPORTED_LANGUAGES, 
  ELEVENLABS_VOICES,
  getLanguageByCode, 
  getRecommendedVoice,
  getDefaultGreeting,
  migrateOldVoiceId,
} from "@/lib/voice-config";
import { TestCallButton } from "@/components/TestCallButton";
import { VoicePreview } from "@/components/VoicePreview";

interface VoiceLanguageSettingsProps {
  organizationId?: string;
  organizationName?: string;
}

export function VoiceLanguageSettings({ organizationId, organizationName = "our business" }: VoiceLanguageSettingsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(organizationId || null);
  
  // Settings state
  const [language, setLanguage] = useState("en-US");
  const [voiceId, setVoiceId] = useState("EXAVITQu4vr4xnSDxMaL"); // Default to Sarah
  const [customGreeting, setCustomGreeting] = useState("");
  const [assistantId, setAssistantId] = useState<string | null>(null);

  // Fetch organization ID from profile if not provided
  useEffect(() => {
    async function fetchOrgId() {
      if (organizationId) {
        setOrgId(organizationId);
        return;
      }
      
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profile?.organization_id) {
        setOrgId(profile.organization_id);
      }
    }

    fetchOrgId();
  }, [user?.id, organizationId]);

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      if (!orgId) return;
      
      try {
        const { data, error } = await supabase
          .from("organization_settings")
          .select("language, voice_id, custom_greeting, vapi_assistant_id")
          .eq("organization_id", orgId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setLanguage(data.language || "en-US");
          // Migrate old voice ID if necessary
          const migratedVoiceId = migrateOldVoiceId(data.voice_id || "EXAVITQu4vr4xnSDxMaL");
          setVoiceId(migratedVoiceId);
          setCustomGreeting(data.custom_greeting || "");
          setAssistantId(data.vapi_assistant_id);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load voice settings");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [orgId]);

  // Handle voice selection
  const handleVoiceSelect = (newVoiceId: string, provider: '11labs') => {
    setVoiceId(newVoiceId);
  };

  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Update greeting to default for new language if empty
    if (!customGreeting) {
      setCustomGreeting(getDefaultGreeting(newLang, organizationName));
    }
  };

  // Reset greeting to default
  const resetGreeting = () => {
    const defaultGreeting = getDefaultGreeting(language, organizationName);
    setCustomGreeting(defaultGreeting);
  };

  // Save settings
  const handleSave = async () => {
    if (!orgId) {
      toast.error("Organization not found");
      return;
    }

    setIsSaving(true);
    
    try {
      const langConfig = getLanguageByCode(language);
      const transcriberLanguage = langConfig?.transcriberLang || language;

      // Update organization_settings
      const { error: settingsError } = await supabase
        .from("organization_settings")
        .update({
          language,
          voice_provider: '11labs',
          voice_id: voiceId,
          custom_greeting: customGreeting,
          transcriber_language: transcriberLanguage,
        })
        .eq("organization_id", orgId);

      if (settingsError) throw settingsError;

      // Update Vapi assistant if exists
      if (assistantId) {
        const { error: updateError } = await supabase.functions.invoke("update-vapi-assistant", {
          body: {
            organizationId: orgId,
            updates: {
              transcriber: {
                provider: "deepgram",
                model: "nova-2",
                language: transcriberLanguage,
              },
              voice: {
                provider: "11labs",
                voiceId: voiceId,
              },
              firstMessage: customGreeting,
            },
          },
        });

        if (updateError) {
          console.error("Error updating Vapi assistant:", updateError);
          toast.error("Settings saved, but failed to update AI assistant");
          return;
        }
      }

      toast.success("Voice settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice & Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Voice & Language</CardTitle>
          <CardDescription>
            Choose the language and voice for your AI assistant. All voices are multilingual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoicePreview
            selectedVoice={voiceId}
            onSelectVoice={handleVoiceSelect}
            selectedLanguage={language}
            onSelectLanguage={handleLanguageChange}
            greeting={customGreeting}
            onGreetingChange={setCustomGreeting}
            businessName={organizationName}
            showLanguageSelector={true}
          />
        </CardContent>
      </Card>

      {/* Custom Greeting */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Greeting</CardTitle>
          <CardDescription>
            The first message your AI will say when answering a call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              placeholder="Enter your custom greeting..."
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{customGreeting.length} characters</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetGreeting}
                className="h-auto py-1"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test & Save */}
      <Card>
        <CardHeader>
          <CardTitle>Test Your AI</CardTitle>
          <CardDescription>
            Try a test call to hear your AI assistant with the current settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <TestCallButton assistantId={assistantId || undefined} />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
