import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Square, User, Volume2, Loader2, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Voice,
  ELEVENLABS_VOICES,
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  getRecommendedVoice,
  getDefaultGreeting,
  migrateOldVoiceId,
} from "@/lib/voice-config";
import { supabase } from "@/integrations/supabase/client";

interface VoiceCardProps {
  voice: Voice;
  isSelected: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onSelect: () => void;
  onPlay: () => void;
  onStop: () => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isSelected,
  isPlaying,
  isLoading,
  onSelect,
  onPlay,
  onStop,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="h-5 w-5 text-primary" />
        </div>
      )}
      
      {voice.recommended && (
        <Badge
          variant="secondary"
          className="absolute -top-2 left-4 bg-amber-100 text-amber-700 border-amber-200 text-xs"
        >
          <Star className="h-3 w-3 mr-1 fill-amber-500" />
          Recommended
        </Badge>
      )}

      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          voice.gender === "female"
            ? "bg-pink-100 text-pink-600"
            : "bg-blue-100 text-blue-600"
        )}
      >
        <User className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{voice.name}</h4>
          <Badge variant="outline" className="text-xs capitalize">
            {voice.gender}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {voice.description}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          if (isPlaying) onStop();
          else onPlay();
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Square className="h-4 w-4 fill-current" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

interface VoicePreviewProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string, provider: '11labs') => void;
  selectedLanguage?: string;
  onSelectLanguage?: (languageCode: string) => void;
  greeting?: string;
  onGreetingChange?: (greeting: string) => void;
  businessName?: string;
  showLanguageSelector?: boolean;
}

export function VoicePreview({
  selectedVoice,
  onSelectVoice,
  selectedLanguage = "en-US",
  onSelectLanguage,
  greeting,
  onGreetingChange,
  businessName = "our business",
  showLanguageSelector = true,
}: VoicePreviewProps) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male">("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLanguage = useMemo(
    () => getLanguageByCode(selectedLanguage),
    [selectedLanguage]
  );

  // Migrate old voice ID if necessary
  const currentVoiceId = useMemo(() => migrateOldVoiceId(selectedVoice), [selectedVoice]);

  const filteredVoices = useMemo(() => {
    if (genderFilter === "all") return ELEVENLABS_VOICES;
    return ELEVENLABS_VOICES.filter((v) => v.gender === genderFilter);
  }, [genderFilter]);

  // Auto-select recommended voice if none selected or invalid
  useEffect(() => {
    const validVoice = ELEVENLABS_VOICES.find(v => v.id === currentVoiceId);
    if (!validVoice) {
      const recommended = getRecommendedVoice();
      onSelectVoice(recommended.id, '11labs');
    } else if (currentVoiceId !== selectedVoice) {
      // Update to migrated voice ID
      onSelectVoice(currentVoiceId, '11labs');
    }
  }, [currentVoiceId, selectedVoice, onSelectVoice]);

  const handleLanguageChange = (langCode: string) => {
    onSelectLanguage?.(langCode);
    
    // Update greeting to default for new language
    if (onGreetingChange) {
      const newGreeting = getDefaultGreeting(langCode, businessName);
      onGreetingChange(newGreeting);
    }
  };

  const handleVoiceSelect = (voice: Voice) => {
    onSelectVoice(voice.id, '11labs');
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setPlayingVoiceId(null);
    setLoadingVoiceId(null);
  };

  const handlePlay = async (voice: Voice) => {
    handleStop();
    setLoadingVoiceId(voice.id);

    const textToSpeak =
      greeting || getDefaultGreeting(selectedLanguage, businessName);

    try {
      // Try to use the edge function for real ElevenLabs preview
      const { data, error } = await supabase.functions.invoke("test-voice", {
        body: {
          voiceId: voice.id,
          text: textToSpeak,
          language: selectedLanguage,
        },
      });

      if (!error && data?.audioContent) {
        // Play the actual ElevenLabs audio
        const audioBlob = base64ToBlob(data.audioContent, "audio/mpeg");
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setPlayingVoiceId(null);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setPlayingVoiceId(null);
          URL.revokeObjectURL(audioUrl);
          // Fallback to browser TTS
          playBrowserTTS(voice, textToSpeak);
        };

        setLoadingVoiceId(null);
        setPlayingVoiceId(voice.id);
        await audio.play();
        return;
      }
    } catch (e) {
      console.log("ElevenLabs preview not available, using browser TTS");
    }

    // Fallback to browser TTS
    playBrowserTTS(voice, textToSpeak);
  };

  const playBrowserTTS = (voice: Voice, text: string) => {
    setLoadingVoiceId(null);

    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      setPlayingVoiceId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = selectedLanguage.split("-")[0];
    utterance.lang = selectedLanguage;

    // Wait for voices to load
    const synthVoices = window.speechSynthesis.getVoices();
    
    const langVoices = synthVoices.filter((v) =>
      v.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );

    if (langVoices.length > 0) {
      // Use voice index to pick different browser voices
      const voiceIndex = ELEVENLABS_VOICES.findIndex((v) => v.id === voice.id);
      const selectedBrowserVoice = langVoices[voiceIndex % langVoices.length];
      if (selectedBrowserVoice) {
        utterance.voice = selectedBrowserVoice;
      }
    }

    // Use pitch to differentiate voices
    if (voice.gender === "male") {
      utterance.pitch = 0.8;
      utterance.rate = 0.95;
    } else {
      // Vary female voices
      const femaleIndex = ELEVENLABS_VOICES.filter(v => v.gender === 'female').findIndex(v => v.id === voice.id);
      utterance.pitch = 1.0 + (femaleIndex * 0.1);
      utterance.rate = 1.0;
    }

    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);

    setPlayingVoiceId(voice.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      {showLanguageSelector && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select language">
                {currentLanguage && (
                  <span className="flex items-center gap-2">
                    <span>{currentLanguage.nativeName}</span>
                    <span className="text-muted-foreground">({currentLanguage.name})</span>
                  </span>
                )}
              </SelectValue>
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
          <p className="text-xs text-muted-foreground">
            All voices are multilingual and speak {SUPPORTED_LANGUAGES.length}+ languages naturally
          </p>
        </div>
      )}

      {/* Gender Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter:</span>
        <div className="flex gap-1">
          {(["all", "female", "male"] as const).map((filter) => (
            <Button
              key={filter}
              variant={genderFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setGenderFilter(filter)}
              className="capitalize"
            >
              {filter === "all" ? "All Voices" : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVoices.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isSelected={currentVoiceId === voice.id}
            isPlaying={playingVoiceId === voice.id}
            isLoading={loadingVoiceId === voice.id}
            onSelect={() => handleVoiceSelect(voice)}
            onPlay={() => handlePlay(voice)}
            onStop={handleStop}
          />
        ))}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Powered by ElevenLabs Multilingual v2 • Click the speaker icon to preview
      </p>
    </div>
  );
}

// Utility function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export default VoicePreview;
