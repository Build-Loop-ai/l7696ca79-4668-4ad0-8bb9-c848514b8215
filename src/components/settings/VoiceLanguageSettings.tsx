import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Save, User, Loader2, Check, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_GREETINGS, 
  getLanguageByCode, 
  getRecommendedVoice,
  type Voice,
  type Language 
} from "@/lib/voice-config";
import { TestCallButton } from "@/components/TestCallButton";

interface VoiceLanguageSettingsProps {
  organizationId?: string;
  organizationName?: string;
}

export function VoiceLanguageSettings({ organizationId, organizationName = "our business" }: VoiceLanguageSettingsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(organizationId || null);
  
  // Settings state
  const [language, setLanguage] = useState("en-US");
  const [voiceProvider, setVoiceProvider] = useState<"azure" | "11labs" | "playht">("azure");
  const [voiceId, setVoiceId] = useState("en-US-AriaNeural");
  const [customGreeting, setCustomGreeting] = useState("");
  const [assistantId, setAssistantId] = useState<string | null>(null);

  const selectedLanguage = getLanguageByCode(language);

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
          .select("language, voice_provider, voice_id, custom_greeting, vapi_assistant_id")
          .eq("organization_id", orgId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setLanguage(data.language || "en-US");
          setVoiceProvider((data.voice_provider as "azure" | "11labs" | "playht") || "azure");
          setVoiceId(data.voice_id || "en-US-AriaNeural");
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

  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const langConfig = getLanguageByCode(newLang);
    if (langConfig) {
      const recommended = getRecommendedVoice(langConfig);
      if (recommended) {
        setVoiceId(recommended.id);
        setVoiceProvider(recommended.provider);
      }
      // Update greeting to default for new language if empty or still default
      const currentDefault = DEFAULT_GREETINGS[language]?.replace("{businessName}", organizationName);
      if (!customGreeting || customGreeting === currentDefault) {
        setCustomGreeting(DEFAULT_GREETINGS[newLang]?.replace("{businessName}", organizationName) || "");
      }
    }
  };

  // Handle voice selection
  const handleVoiceSelect = (voice: Voice) => {
    setVoiceId(voice.id);
    setVoiceProvider(voice.provider);
  };

  // Reset greeting to default
  const resetGreeting = () => {
    const defaultGreeting = DEFAULT_GREETINGS[language]?.replace("{businessName}", organizationName) || "";
    setCustomGreeting(defaultGreeting);
  };

  // Preview voice
  const previewVoice = async (voice: Voice) => {
    setIsPreviewPlaying(voice.id);
    
    try {
      // Use browser speech synthesis as a fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          DEFAULT_GREETINGS[language]?.replace("{businessName}", organizationName) || "Hello, how can I help you today?"
        );
        
        // Try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => 
          v.lang.startsWith(language.split('-')[0]) && 
          (voice.gender === 'female' ? !v.name.toLowerCase().includes('male') : v.name.toLowerCase().includes('male'))
        );
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
        
        utterance.onend = () => setIsPreviewPlaying(null);
        utterance.onerror = () => setIsPreviewPlaying(null);
        
        window.speechSynthesis.speak(utterance);
      } else {
        toast.error("Voice preview not supported in this browser");
        setIsPreviewPlaying(null);
      }
    } catch (error) {
      console.error("Error previewing voice:", error);
      toast.error("Failed to preview voice");
      setIsPreviewPlaying(null);
    }
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
          voice_provider: voiceProvider,
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
              voice: voiceProvider === "11labs"
                ? { provider: "11labs", voiceId, stability: 0.5, similarityBoost: 0.75 }
                : { provider: "azure", voiceId },
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
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>
            Choose the language your AI assistant will speak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.nativeName}</span>
                    <span className="text-muted-foreground">({lang.name})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Voice Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Voice</CardTitle>
          <CardDescription>
            Select a voice for your AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedLanguage?.voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceSelect(voice)}
                className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                  voiceId === voice.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {/* Selection indicator */}
                {voiceId === voice.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                {/* Voice avatar */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  voice.gender === "female" 
                    ? "bg-pink-100 text-pink-600" 
                    : "bg-blue-100 text-blue-600"
                }`}>
                  <User className="h-6 w-6" />
                </div>
                
                {/* Voice info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{voice.name}</span>
                    {voice.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {voice.description}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs capitalize">
                    {voice.provider === "11labs" ? "ElevenLabs" : voice.provider}
                  </Badge>
                </div>
                
                {/* Preview button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    previewVoice(voice);
                  }}
                  disabled={isPreviewPlaying === voice.id}
                >
                  {isPreviewPlaying === voice.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </button>
            ))}
          </div>
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
