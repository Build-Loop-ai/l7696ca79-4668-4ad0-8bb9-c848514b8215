import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  voice: Voice;
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
    <div
      onClick={onSelect}
      className={cn(
        "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{voice.name}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {voice.description}
          </p>
        </div>
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
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
      )}
    </div>
  );
}

interface VoicePreviewProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  greeting?: string;
}

export function VoicePreview({
  selectedVoice,
  onSelectVoice,
  greeting = "Hello! Thank you for calling. How can I help you today?",
}: VoicePreviewProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async (voiceId: string) => {
    setIsLoading(true);
    setPlayingVoice(voiceId);

    try {
      // Simulate audio playback for demo
      // In production, this would call the test-voice edge function
      // and play the returned audio
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Use browser's speech synthesis as fallback for demo
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(greeting);
        const voices = speechSynthesis.getVoices();
        
        // Try to find a matching voice
        const voice = AVAILABLE_VOICES.find((v) => v.id === voiceId);
        if (voice) {
          const synthVoice = voices.find((v) => 
            voice.gender === "female" 
              ? v.name.toLowerCase().includes("female") || v.name.includes("Samantha")
              : v.name.toLowerCase().includes("male") || v.name.includes("Daniel")
          );
          if (synthVoice) {
            utterance.voice = synthVoice;
          }
        }
        
        utterance.onend = () => {
          setPlayingVoice(null);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        // Fallback timeout
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AVAILABLE_VOICES.map((voice) => (
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
