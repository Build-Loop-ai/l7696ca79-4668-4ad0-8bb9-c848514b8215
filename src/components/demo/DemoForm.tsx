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
import { ELEVENLABS_VOICES } from "@/lib/voice-config";
import { Loader2, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

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
  { value: "professional", label: "Professional", emoji: "👔" },
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "casual", label: "Casual", emoji: "✌️" },
];

const DemoForm = ({ onSubmit, isLoading }: DemoFormProps) => {
  const [formData, setFormData] = useState<DemoFormData>({
    businessName: "",
    businessType: "dental_clinic",
    services: "",
    tone: "friendly",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="businessName" className="text-sm font-medium text-white/80">
          Business Name <span className="text-teal">*</span>
        </Label>
        <Input
          id="businessName"
          placeholder="e.g., Bright Smile Dental"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal/50 focus:ring-teal/20"
          required
        />
      </div>

      {/* Business Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white/80">Business Type</Label>
        <Select
          value={formData.businessType}
          onValueChange={(value) => setFormData({ ...formData, businessType: value })}
        >
          <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white focus:border-teal/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(222,47%,11%)] border-white/10">
            {businessTypes.map((type) => (
              <SelectItem 
                key={type.value} 
                value={type.value}
                className="text-white/80 focus:bg-white/10 focus:text-white"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white/80">
          Services <span className="text-white/40">(optional)</span>
        </Label>
        <Textarea
          placeholder="e.g., cleanings, whitening, orthodontics"
          value={formData.services}
          onChange={(e) => setFormData({ ...formData, services: e.target.value })}
          className="min-h-[70px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal/50 resize-none"
        />
      </div>

      {/* Tone */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white/80">Tone</Label>
        <div className="grid grid-cols-3 gap-2">
          {toneOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, tone: option.value })}
              className={`relative p-3 rounded-xl border text-center transition-all ${
                formData.tone === option.value
                  ? "border-teal bg-teal/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-xl mb-1">{option.emoji}</div>
              <div className="text-xs font-medium text-white/80">{option.label}</div>
              {formData.tone === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-teal rounded-full flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white/80">Voice</Label>
        
        {/* Gender Toggle */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => {
              setSelectedGender("female");
              setFormData({ ...formData, voiceId: femaleVoices[0].id });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedGender === "female"
                ? "bg-teal text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Female
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedGender("male");
              setFormData({ ...formData, voiceId: maleVoices[0].id });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedGender === "male"
                ? "bg-teal text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Male
          </button>
        </div>

        {/* Voice Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
          {displayedVoices.map((voice) => (
            <motion.button
              key={voice.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, voiceId: voice.id })}
              className={`relative p-2.5 rounded-xl border text-left transition-all ${
                formData.voiceId === voice.id
                  ? "border-teal bg-teal/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white/90">{voice.name}</span>
                {voice.recommended && (
                  <span className="text-[10px] bg-teal/20 text-teal px-1 py-0.5 rounded">★</span>
                )}
              </div>
              {formData.voiceId === voice.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-teal rounded-full flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Email (Optional) */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white/80">
          Email <span className="text-white/40">(optional)</span>
        </Label>
        <Input
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal/50"
        />
      </div>

      {/* Submit Button */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          type="submit"
          className="w-full h-14 text-base font-medium rounded-xl relative overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, hsl(166 76% 36%) 0%, hsl(166 76% 28%) 100%)",
          }}
          disabled={isLoading || !formData.businessName.trim()}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Generating Your Demo...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Hear Your AI Receptionist
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
};

export default DemoForm;