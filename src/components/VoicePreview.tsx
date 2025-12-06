import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Loader2, Volume2, User, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_GREETINGS,
  getLanguageByCode, 
  getRecommendedVoice,
  type Voice as VoiceConfig,
  type Language 
} from "@/lib/voice-config";

// Legacy voices for backward compatibility
export interface Voice {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female";
  tone: "professional" | "friendly" | "warm";
}

export const AVAILABLE_VOICES: Voice[] = [
  {
    id: "rachel",
    name: "Rachel",
    description: "Warm and friendly, perfect for customer service",
    gender: "female",
    tone: "friendly",
  },
  {
    id: "adam",
    name: "Adam",
    description: "Professional and clear, ideal for business",
    gender: "male",
    tone: "professional",
  },
  {
    id: "bella",
    name: "Bella",
    description: "Empathetic and caring, great for healthcare",
    gender: "female",
    tone: "warm",
  },
  {
    id: "josh",
    name: "Josh",
    description: "Confident and energetic",
    gender: "male",
    tone: "friendly",
  },
];

interface VoiceCardProps {
  voice: VoiceConfig;
  selected: boolean;
  onSelect: () => void;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

function VoiceCard({
  voice,
  selected,
  onSelect,
  isPlaying,
  onPlay,
  onStop,
}: VoiceCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all text-left w-full",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2">
          <Check className="h-5 w-5 text-primary" />
        </div>
      )}
      
      {/* Voice avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        voice.gender === "female" 
          ? "bg-pink-100 text-pink-600" 
          : "bg-blue-100 text-blue-600"
      )}>
        <User className="h-5 w-5" />
      </div>
      
      {/* Voice info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{voice.name}</span>
          {voice.recommended && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {voice.description}
        </p>
        <Badge variant="outline" className="mt-2 text-xs capitalize">
          {voice.provider === "11labs" ? "ElevenLabs" : voice.provider}
        </Badge>
      </div>
      
      {/* Preview button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          isPlaying ? onStop() : onPlay();
        }}
      >
        {isPlaying ? (
          <Square className="w-4 h-4 text-primary" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
    </button>
  );
}

interface VoicePreviewProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
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
  greeting = "Hello! Thank you for calling. How can I help you today?",
  onGreetingChange,
  businessName = "our business",
  showLanguageSelector = true,
}: VoicePreviewProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentLanguage = getLanguageByCode(selectedLanguage);
  const voices = currentLanguage?.voices || [];

  // Auto-select recommended voice when language changes
  useEffect(() => {
    if (currentLanguage) {
      const recommendedVoice = getRecommendedVoice(currentLanguage);
      if (recommendedVoice && !voices.find(v => v.id === selectedVoice)) {
        onSelectVoice(recommendedVoice.id);
      }
    }
  }, [selectedLanguage, currentLanguage, voices, selectedVoice, onSelectVoice]);

  const handleLanguageChange = (languageCode: string) => {
    if (onSelectLanguage) {
      onSelectLanguage(languageCode);
    }
    
    // Auto-select recommended voice for new language
    const lang = getLanguageByCode(languageCode);
    if (lang) {
      const recommended = getRecommendedVoice(lang);
      if (recommended) {
        onSelectVoice(recommended.id);
      }
      
      // Update greeting if handler provided
      if (onGreetingChange) {
        const defaultGreeting = DEFAULT_GREETINGS[languageCode]?.replace("{businessName}", businessName) || greeting;
        onGreetingChange(defaultGreeting);
      }
    }
  };

  const handlePlay = async (voiceId: string) => {
    setIsLoading(true);
    setPlayingVoice(voiceId);

    try {
      // Use browser's speech synthesis for demo
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(greeting);
        const synthVoices = speechSynthesis.getVoices();
        
        // Try to find a matching voice for the language
        const voice = voices.find((v) => v.id === voiceId);
        const langCode = selectedLanguage.split('-')[0];
        
        if (voice) {
          const synthVoice = synthVoices.find((v) => 
            v.lang.startsWith(langCode) && 
            (voice.gender === "female" 
              ? !v.name.toLowerCase().includes("male")
              : v.name.toLowerCase().includes("male"))
          );
          if (synthVoice) {
            utterance.voice = synthVoice;
          }
        }
        
        utterance.lang = selectedLanguage;
        utterance.onend = () => {
          setPlayingVoice(null);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setPlayingVoice(null), 3000);
      }
    } catch (error) {
      console.error("Error playing voice:", error);
      setPlayingVoice(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    setPlayingVoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Language Selector */}
      {showLanguageSelector && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm transition-all text-left",
                  selectedLanguage === lang.code
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="font-medium truncate">{lang.nativeName}</div>
                <div className="text-xs text-muted-foreground truncate">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Voice {currentLanguage ? `for ${currentLanguage.name}` : ""}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {voices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              selected={selectedVoice === voice.id}
              onSelect={() => onSelectVoice(voice.id)}
              isPlaying={playingVoice === voice.id}
              onPlay={() => handlePlay(voice.id)}
              onStop={handleStop}
            />
          ))}
        </div>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading voice preview...</span>
        </div>
      )}
    </div>
  );
}

export default VoicePreview;
