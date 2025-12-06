import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ELEVENLABS_VOICES, Voice } from "@/lib/voice-config";
import { Play, Loader2, Sparkles } from "lucide-react";

interface DemoFormData {
  businessName: string;
  businessType: string;
  services: string;
  tone: string;
  voiceId: string;
  email: string;
}

interface DemoFormProps {
  onSubmit: (data: DemoFormData) => void;
  isLoading: boolean;
}

const businessTypes = [
  { value: "dental_clinic", label: "Dental Clinic" },
  { value: "medical_practice", label: "Medical Practice" },
  { value: "salon", label: "Hair Salon / Barbershop" },
  { value: "spa", label: "Spa & Wellness" },
  { value: "restaurant", label: "Restaurant" },
  { value: "fitness", label: "Fitness Studio / Gym" },
  { value: "other", label: "Other Business" },
];

const toneOptions = [
  { value: "professional", label: "Professional", description: "Formal and business-like" },
  { value: "friendly", label: "Friendly", description: "Warm and welcoming" },
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
];

const DemoForm = ({ onSubmit, isLoading }: DemoFormProps) => {
  const [formData, setFormData] = useState<DemoFormData>({
    businessName: "",
    businessType: "dental_clinic",
    services: "",
    tone: "friendly",
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah - recommended
    email: "",
  });

  const [selectedGender, setSelectedGender] = useState<"female" | "male">("female");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) return;
    onSubmit(formData);
  };

  const femaleVoices = ELEVENLABS_VOICES.filter((v) => v.gender === "female");
  const maleVoices = ELEVENLABS_VOICES.filter((v) => v.gender === "male");
  const displayedVoices = selectedGender === "female" ? femaleVoices : maleVoices;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="businessName" className="text-base font-medium">
          Your Business Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="businessName"
          placeholder="e.g., Bright Smile Dental"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className="h-12 text-base"
          required
        />
        <p className="text-sm text-muted-foreground">
          Your AI will greet callers with this name
        </p>
      </div>

      {/* Business Type */}
      <div className="space-y-2">
        <Label htmlFor="businessType" className="text-base font-medium">
          Business Type
        </Label>
        <Select
          value={formData.businessType}
          onValueChange={(value) => setFormData({ ...formData, businessType: value })}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services */}
      <div className="space-y-2">
        <Label htmlFor="services" className="text-base font-medium">
          Services You Offer
        </Label>
        <Textarea
          id="services"
          placeholder="e.g., cleanings, whitening, orthodontics, emergency care"
          value={formData.services}
          onChange={(e) => setFormData({ ...formData, services: e.target.value })}
          className="min-h-[80px] text-base resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Brief list of your main services (optional)
        </p>
      </div>

      {/* Tone */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Tone & Personality</Label>
        <div className="grid grid-cols-3 gap-3">
          {toneOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, tone: option.value })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                formData.tone === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Choose a Voice</Label>
        
        {/* Gender Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedGender("female");
              setFormData({ ...formData, voiceId: femaleVoices[0].id });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedGender === "female"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Female Voices
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedGender("male");
              setFormData({ ...formData, voiceId: maleVoices[0].id });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedGender === "male"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Male Voices
          </button>
        </div>

        {/* Voice Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayedVoices.map((voice) => (
            <button
              key={voice.id}
              type="button"
              onClick={() => setFormData({ ...formData, voiceId: voice.id })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                formData.voiceId === voice.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{voice.name}</span>
                {voice.recommended && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    ★
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {voice.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-medium">
          Email <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="h-12 text-base"
        />
        <p className="text-sm text-muted-foreground">
          We'll send you a link to replay your demo
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full h-14 text-base gap-2"
        disabled={isLoading || !formData.businessName.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Your Demo...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Hear Your AI Receptionist
          </>
        )}
      </Button>
    </form>
  );
};

export default DemoForm;
