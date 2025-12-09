import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Phone, Check, ChevronRight, Mic, Volume2, Building2, MessageSquare, User, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DemoAudioPlayer from "@/components/demo/DemoAudioPlayer";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { ELEVENLABS_VOICES, SUPPORTED_LANGUAGES } from "@/lib/voice-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DemoResult {
  audioContent: string;
  transcript: string;
  businessName: string;
}

const businessTypes = [
  { value: "dental_clinic", label: "Dental Clinic", icon: "🦷" },
  { value: "medical_practice", label: "Medical Practice", icon: "⚕️" },
  { value: "salon", label: "Hair Salon", icon: "💇" },
  { value: "spa", label: "Spa & Wellness", icon: "🧖" },
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "fitness", label: "Fitness Studio", icon: "💪" },
  { value: "other", label: "Other", icon: "🏢" },
];

const toneOptions = [
  { value: "professional", label: "Professional", emoji: "👔" },
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "casual", label: "Casual", emoji: "✌️" },
];

// Most popular languages for demo
const popularLanguages = SUPPORTED_LANGUAGES.filter(l => 
  ["en-US", "en-GB", "nl-NL", "de-DE", "fr-FR", "es-ES", "it-IT", "pt-BR"].includes(l.code)
);

const Demo = () => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "dental_clinic",
    language: "en-US",
    tone: "friendly",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
  });

  const [selectedGender, setSelectedGender] = useState<"female" | "male">("female");

  const femaleVoices = ELEVENLABS_VOICES.filter((v) => v.gender === "female").slice(0, 4);
  const maleVoices = ELEVENLABS_VOICES.filter((v) => v.gender === "male").slice(0, 4);
  const displayedVoices = selectedGender === "female" ? femaleVoices : maleVoices;

  const canProceed = useCallback(() => {
    if (step === 0) return formData.businessName.trim().length > 0;
    return true;
  }, [step, formData.businessName]);

  // Handle Enter key to advance steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isLoading && !demoResult && canProceed()) {
        e.preventDefault();
        if (step < 4) setStep(step + 1);
        else handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, isLoading, demoResult, canProceed]);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke(
        "generate-demo-audio",
        {
          body: {
            businessName: formData.businessName,
            businessType: formData.businessType,
            services: "",
            tone: formData.tone,
            voiceId: formData.voiceId,
            language: formData.language,
          },
        }
      );

      if (error) throw error;

      if (!result?.audioContent) {
        throw new Error("No audio content received");
      }

      setDemoResult({
        audioContent: result.audioContent,
        transcript: result.script || "",
        businessName: formData.businessName,
      });

      toast.success("Your AI demo is ready!");
    } catch (error) {
      console.error("Demo generation error:", error);
      toast.error("Failed to generate demo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDemoResult(null);
    setStep(0);
    setFormData({
      businessName: "",
      businessType: "dental_clinic",
      language: "en-US",
      tone: "friendly",
      voiceId: "EXAVITQu4vr4xnSDxMaL",
    });
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const steps = [
    { icon: Building2, label: "Business" },
    { icon: MessageSquare, label: "Type" },
    { icon: Globe, label: "Language" },
    { icon: User, label: "Tone" },
    { icon: Mic, label: "Voice" },
  ];

  return (
    <>
      <Helmet>
        <title>Hear Your AI Receptionist | Callisto Demo</title>
        <meta
          name="description"
          content="Generate a personalized AI receptionist demo in 30 seconds. Hear how your business will sound with an AI answering calls."
        />
      </Helmet>

      <div className="min-h-screen bg-[hsl(222,47%,6%)] overflow-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(166,76%,36%,0.15) 0%, transparent 70%)",
              top: "-20%",
              right: "-10%",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(222,47%,40%,0.1) 0%, transparent 70%)",
              bottom: "-10%",
              left: "-10%",
            }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating Navigation */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 md:top-6 left-0 right-0 mx-auto z-50 w-[90%] max-w-xl"
        >
          <div
            className="relative rounded-2xl bg-[hsl(222,47%,8%)]/90"
            style={{
              backdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <span className="font-serif text-lg text-white">callisto</span>
              <Link 
                to="/signup"
                className="flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-light transition-colors"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
          <div className="w-full max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {!demoResult ? (
                <motion.div
                  key="interactive"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
                >
                  {/* Left - Context & Progress */}
                  <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                      style={{
                        background: "linear-gradient(135deg, hsla(166,76%,36%,0.2) 0%, hsla(166,76%,36%,0.05) 100%)",
                        border: "1px solid hsla(166,76%,36%,0.3)",
                      }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                      </span>
                      <span className="text-sm text-teal font-medium">Interactive Demo</span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] mb-4 text-white"
                    >
                      Set up your AI
                      <br />
                      <span className="text-gradient italic">right on the phone</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/60 mb-8 max-w-sm mx-auto lg:mx-0"
                    >
                      Tap through the phone screen to configure your AI receptionist and hear it in action.
                    </motion.p>

                    {/* Step Progress */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center lg:justify-start gap-3"
                    >
                      {steps.map((s, i) => (
                        <motion.div
                          key={i}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                            i === step
                              ? "bg-teal/20 border border-teal/40"
                              : i < step
                              ? "bg-teal/10 border border-teal/20"
                              : "bg-white/5 border border-white/10"
                          }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <s.icon className={`w-4 h-4 ${i <= step ? "text-teal" : "text-white/40"}`} />
                          <span className={`text-xs font-medium hidden sm:inline ${i <= step ? "text-teal" : "text-white/40"}`}>
                            {s.label}
                          </span>
                          {i < step && <Check className="w-3 h-3 text-teal" />}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Right - Interactive Phone */}
                  <div className="order-1 lg:order-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="relative"
                    >
                      {/* Phone Frame */}
                      <div
                        className="relative w-[320px] md:w-[360px] rounded-[50px] p-3"
                        style={{
                          background: "linear-gradient(145deg, #2a2a2e 0%, #1a1a1e 100%)",
                          boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      >
                        {/* Dynamic Island */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-20 flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#1a1a1e]" />
                        </div>

                        {/* Screen */}
                        <div
                          className="relative rounded-[38px] overflow-hidden"
                          style={{
                            background: "linear-gradient(180deg, hsl(222,47%,12%) 0%, hsl(222,47%,8%) 100%)",
                            minHeight: "580px",
                          }}
                        >
                          {/* Status Bar */}
                          <div className="flex items-center justify-between px-8 pt-14 pb-4">
                            <span className="text-xs text-white/60 font-medium">9:41</span>
                            <div className="flex items-center gap-1">
                              <div className="flex gap-0.5">
                                {[1,2,3,4].map(i => (
                                  <div key={i} className="w-1 rounded-full bg-white/60" style={{ height: 4 + i * 2 }} />
                                ))}
                              </div>
                              <div className="w-6 h-3 rounded-sm border border-white/60 ml-1 relative">
                                <div className="absolute inset-0.5 bg-teal rounded-sm" style={{ width: '80%' }} />
                              </div>
                            </div>
                          </div>

                          {/* Screen Content */}
                          <div className="px-6 pb-8">
                            {/* App Header */}
                            <div className="text-center mb-6">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                                <Phone className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-lg font-medium text-white">AI Receptionist</h3>
                              <p className="text-xs text-white/50">Step {step + 1} of 5</p>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step + 1) / 5) * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>

                            <AnimatePresence mode="wait">
                              {/* Step 0: Business Name */}
                              {step === 0 && (
                                <motion.div
                                  key="step0"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-4"
                                >
                                  <div className="text-center mb-6">
                                    <h4 className="text-white font-medium mb-1">What's your business called?</h4>
                                    <p className="text-xs text-white/50">This is how the AI will greet callers</p>
                                  </div>
                                  <Input
                                    placeholder="e.g., Bright Smile Dental"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="h-14 text-center text-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal/50 rounded-2xl"
                                  />
                                </motion.div>
                              )}

                              {/* Step 1: Business Type */}
                              {step === 1 && (
                                <motion.div
                                  key="step1"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-3"
                                >
                                  <div className="text-center mb-4">
                                    <h4 className="text-white font-medium mb-1">What type of business?</h4>
                                    <p className="text-xs text-white/50">We'll customize the AI for your industry</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {businessTypes.map((type) => (
                                      <motion.button
                                        key={type.value}
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, businessType: type.value })}
                                        className={`relative p-3 rounded-2xl border text-center transition-all ${
                                          formData.businessType === type.value
                                            ? "border-teal bg-teal/10"
                                            : "border-white/10 bg-white/5"
                                        }`}
                                      >
                                        <div className="text-2xl mb-1">{type.icon}</div>
                                        <div className="text-xs font-medium text-white/80">{type.label}</div>
                                        {formData.businessType === type.value && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-teal rounded-full flex items-center justify-center"
                                          >
                                            <Check className="w-3 h-3 text-white" />
                                          </motion.div>
                                        )}
                                      </motion.button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 2: Language */}
                              {step === 2 && (
                                <motion.div
                                  key="step2"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-3"
                                >
                                  <div className="text-center mb-4">
                                    <h4 className="text-white font-medium mb-1">Choose your language</h4>
                                    <p className="text-xs text-white/50">The AI will speak in this language</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                                    {popularLanguages.map((lang) => (
                                      <motion.button
                                        key={lang.code}
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, language: lang.code })}
                                        className={`relative p-3 rounded-2xl border text-left transition-all ${
                                          formData.language === lang.code
                                            ? "border-teal bg-teal/10"
                                            : "border-white/10 bg-white/5"
                                        }`}
                                      >
                                        <div className="text-sm font-medium text-white/90">{lang.nativeName}</div>
                                        <div className="text-xs text-white/50">{lang.name}</div>
                                        {formData.language === lang.code && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-teal rounded-full flex items-center justify-center"
                                          >
                                            <Check className="w-3 h-3 text-white" />
                                          </motion.div>
                                        )}
                                      </motion.button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 3: Tone */}
                              {step === 3 && (
                                <motion.div
                                  key="step3"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-4"
                                >
                                  <div className="text-center mb-4">
                                    <h4 className="text-white font-medium mb-1">Pick your AI's personality</h4>
                                    <p className="text-xs text-white/50">How should it sound to callers?</p>
                                  </div>
                                  <div className="space-y-3">
                                    {toneOptions.map((tone) => (
                                      <motion.button
                                        key={tone.value}
                                        type="button"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => setFormData({ ...formData, tone: tone.value })}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                          formData.tone === tone.value
                                            ? "border-teal bg-teal/10"
                                            : "border-white/10 bg-white/5"
                                        }`}
                                      >
                                        <span className="text-3xl">{tone.emoji}</span>
                                        <div className="text-left flex-1">
                                          <div className="font-medium text-white">{tone.label}</div>
                                          <div className="text-xs text-white/50">
                                            {tone.value === "professional" && "Formal and business-like"}
                                            {tone.value === "friendly" && "Warm and welcoming"}
                                            {tone.value === "casual" && "Relaxed and approachable"}
                                          </div>
                                        </div>
                                        {formData.tone === tone.value && (
                                          <div className="w-6 h-6 bg-teal rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                          </div>
                                        )}
                                      </motion.button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 4: Voice */}
                              {step === 4 && (
                                <motion.div
                                  key="step4"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-4"
                                >
                                  <div className="text-center mb-4">
                                    <h4 className="text-white font-medium mb-1">Choose a voice</h4>
                                    <p className="text-xs text-white/50">All voices speak your selected language fluently</p>
                                  </div>
                                  
                                  {/* Gender Toggle */}
                                  <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                                    {["female", "male"].map((g) => (
                                      <button
                                        key={g}
                                        type="button"
                                        onClick={() => {
                                          setSelectedGender(g as "female" | "male");
                                          const voices = g === "female" ? femaleVoices : maleVoices;
                                          setFormData({ ...formData, voiceId: voices[0].id });
                                        }}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                          selectedGender === g
                                            ? "bg-teal text-white"
                                            : "text-white/50 hover:text-white/80"
                                        }`}
                                      >
                                        {g === "female" ? "Female" : "Male"}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Voice Grid */}
                                  <div className="grid grid-cols-2 gap-2">
                                    {displayedVoices.map((voice) => (
                                      <motion.button
                                        key={voice.id}
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, voiceId: voice.id })}
                                        className={`relative p-4 rounded-2xl border text-center transition-all ${
                                          formData.voiceId === voice.id
                                            ? "border-teal bg-teal/10"
                                            : "border-white/10 bg-white/5"
                                        }`}
                                      >
                                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                                          <Volume2 className="w-5 h-5 text-white/70" />
                                        </div>
                                        <div className="text-sm font-medium text-white/90">{voice.name}</div>
                                        {voice.recommended && (
                                          <span className="text-[10px] bg-teal/20 text-teal px-2 py-0.5 rounded-full mt-1 inline-block">★ Best</span>
                                        )}
                                        {formData.voiceId === voice.id && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-teal rounded-full flex items-center justify-center"
                                          >
                                            <Check className="w-3 h-3 text-white" />
                                          </motion.div>
                                        )}
                                      </motion.button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Navigation Button */}
                            <motion.div className="mt-6" whileTap={{ scale: 0.98 }}>
                              <Button
                                onClick={nextStep}
                                disabled={!canProceed() || isLoading}
                                className="w-full h-14 text-base font-medium rounded-2xl relative overflow-hidden group"
                                style={{
                                  background: canProceed()
                                    ? "linear-gradient(135deg, hsl(166 76% 36%) 0%, hsl(166 76% 28%) 100%)"
                                    : "rgba(255,255,255,0.1)",
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                
                                {isLoading ? (
                                  <span className="flex items-center gap-2">
                                    <motion.div
                                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Generating...
                                  </span>
                              ) : step === 4 ? (
                                  <span className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Hear Your AI
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    Continue
                                    <ChevronRight className="w-5 h-5" />
                                  </span>
                                )}
                              </Button>
                            </motion.div>

                            {/* Back Button */}
                            {step > 0 && (
                              <button
                                onClick={() => setStep(step - 1)}
                                className="w-full mt-3 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                              >
                                Go back
                              </button>
                            )}
                          </div>

                          {/* Home Indicator */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
                        </div>
                      </div>

                      {/* Decorative Ring */}
                      <motion.div
                        className="absolute -inset-8 border border-teal/20 rounded-[70px] pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="player"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center"
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="font-serif text-3xl md:text-4xl text-white mb-2">
                      Your AI is Ready
                    </h2>
                    <p className="text-white/60">
                      Listen to how your receptionist will sound
                    </p>
                  </div>

                  <div 
                    className="relative rounded-3xl p-1"
                    style={{
                      background: "linear-gradient(135deg, hsla(166,76%,36%,0.3) 0%, transparent 50%, hsla(222,47%,50%,0.2) 100%)",
                    }}
                  >
                    <div 
                      className="rounded-[22px] p-6 md:p-8"
                      style={{
                        background: "linear-gradient(180deg, hsl(222,47%,11%) 0%, hsl(222,47%,8%) 100%)",
                      }}
                    >
                      <DemoAudioPlayer
                        audioContent={demoResult.audioContent}
                        transcript={demoResult.transcript}
                        businessName={demoResult.businessName}
                        onReset={handleReset}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
};

export default Demo;