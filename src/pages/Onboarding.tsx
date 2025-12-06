import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Phone,
  Building,
  Clock,
  Stethoscope,
  Mic,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoicePreview } from "@/components/VoicePreview";
import { TestCallButton } from "@/components/TestCallButton";

const STEPS = [
  { id: 1, title: "Business Basics", icon: Building },
  { id: 2, title: "Opening Hours", icon: Clock },
  { id: 3, title: "Services", icon: Stethoscope },
  { id: 4, title: "AI Personality", icon: Mic },
  { id: 5, title: "Phone Setup", icon: Phone },
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DENTAL_SERVICES = [
  "Checkup",
  "Cleaning",
  "Filling",
  "Root Canal",
  "Whitening",
  "Emergency",
  "Implants",
  "Orthodontics",
  "Crown",
  "Extraction",
];

type BusinessType = 'dental_clinic' | 'medical_practice' | 'salon' | 'restaurant' | 'other';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [businessData, setBusinessData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    website: "",
    type: "dental_clinic" as BusinessType,
  });

  const [hours, setHours] = useState<
    Record<string, { isOpen: boolean; open: string; close: string }>
  >(
    DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { isOpen: day !== "Sunday", open: "09:00", close: "17:00" },
      }),
      {}
    )
  );

  const [services, setServices] = useState<string[]>([
    "Checkup",
    "Cleaning",
    "Filling",
  ]);

  const [aiConfig, setAiConfig] = useState({
    voice: "en-US-AriaNeural",
    voiceProvider: "azure" as "azure" | "11labs" | "playht",
    language: "en-US",
    greeting: "Hello! Thank you for calling. How can I help you today?",
  });

  const [phoneSetup, setPhoneSetup] = useState({
    option: "new",
    areaCode: "+31",
  });

  const [assistantId, setAssistantId] = useState<string | null>(null);

  // Load saved clinic name from signup
  useEffect(() => {
    const savedClinicName = sessionStorage.getItem('pendingClinicName');
    if (savedClinicName) {
      setBusinessData(prev => ({ ...prev, name: savedClinicName }));
      sessionStorage.removeItem('pendingClinicName');
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signup");
    }
  }, [user, authLoading, navigate]);

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, organization_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.onboarding_completed && profile?.organization_id) {
        navigate('/dashboard');
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // 1. Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: businessData.name,
          business_type: businessData.type,
          address: {
            street: businessData.address,
            city: businessData.city,
            postal_code: businessData.postalCode,
          },
          phone: businessData.phone,
          website: businessData.website || null,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Create organization settings with language/voice config
      const { error: settingsError } = await supabase
        .from('organization_settings')
        .insert({
          organization_id: org.id,
          business_hours: hours,
          services: services.map(name => ({ name, duration: 30 })),
          language: aiConfig.language,
          voice_provider: aiConfig.voiceProvider,
          voice_id: aiConfig.voice,
          custom_greeting: aiConfig.greeting,
          transcriber_language: aiConfig.language.split('-')[0] || 'en',
          ai_config: {
            voice_id: aiConfig.voice,
            personality: 'professional',
            greeting: aiConfig.greeting,
            language: aiConfig.language,
            additional_languages: [],
          },
        });

      if (settingsError) throw settingsError;

      // 3. Create user role (owner)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          organization_id: org.id,
          role: 'owner',
        });

      if (roleError) throw roleError;

      // 4. Update profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 5. Create subscription (trial)
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          organization_id: org.id,
          plan: 'starter',
          status: 'trialing',
          minutes_included: 100,
          minutes_used: 0,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (subError) throw subError;

      // 6. Create Vapi assistant
      try {
        const { data: vapiData, error: vapiError } = await supabase.functions.invoke(
          'create-vapi-assistant',
          { body: { organizationId: org.id } }
        );
        
        if (vapiError) {
          console.error('Vapi assistant error:', vapiError);
        } else if (vapiData?.assistantId) {
          setAssistantId(vapiData.assistantId);
        }
      } catch (vapiErr) {
        console.error('Failed to create Vapi assistant:', vapiErr);
      }

      toast({
        title: "Setup complete!",
        description: "Your AI receptionist is ready to go.",
      });
      
      setIsCompleted(true);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLaunch = () => {
    navigate("/dashboard");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg text-center animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-serif text-foreground mb-4">
            You're all set!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your AI receptionist is ready to start taking calls. Let's go to
            your dashboard and see it in action.
          </p>
          <Button variant="hero" size="xl" onClick={handleLaunch}>
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-medium text-foreground">
              Callisto
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    step.id < currentStep
                      ? "text-primary"
                      : step.id === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step.id < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id === currentStep
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-12 md:w-20 h-0.5 mx-2 ${
                      step.id < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Business Basics */}
          {currentStep === 1 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                Tell us about your business
              </h2>
              <p className="text-muted-foreground mb-8">
                This information helps your AI greet callers appropriately.
              </p>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Amsterdam Dental Care"
                      value={businessData.name}
                      onChange={(e) =>
                        setBusinessData({ ...businessData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={businessData.type}
                      onValueChange={(value: BusinessType) =>
                        setBusinessData({ ...businessData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dental_clinic">Dental Clinic</SelectItem>
                        <SelectItem value="medical_practice">Medical Practice</SelectItem>
                        <SelectItem value="salon">Salon</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="Keizersgracht 123"
                    value={businessData.address}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, address: e.target.value })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Amsterdam"
                      value={businessData.city}
                      onChange={(e) =>
                        setBusinessData({ ...businessData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="1015 CD"
                      value={businessData.postalCode}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          postalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Current Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+31 20 123 4567"
                      value={businessData.phone}
                      onChange={(e) =>
                        setBusinessData({ ...businessData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={businessData.website}
                      onChange={(e) =>
                        setBusinessData({ ...businessData, website: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Opening Hours */}
          {currentStep === 2 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                Set your opening hours
              </h2>
              <p className="text-muted-foreground mb-8">
                Your AI will know when to offer appointments and when to take
                messages.
              </p>

              <div className="space-y-4">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <Switch
                      checked={hours[day].isOpen}
                      onCheckedChange={(checked) =>
                        setHours({
                          ...hours,
                          [day]: { ...hours[day], isOpen: checked },
                        })
                      }
                    />
                    <span className="w-24 font-medium text-foreground">
                      {day}
                    </span>
                    {hours[day].isOpen ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Select
                          value={hours[day].open}
                          onValueChange={(value) =>
                            setHours({
                              ...hours,
                              [day]: { ...hours[day], open: value },
                            })
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem
                                key={i}
                                value={`${i.toString().padStart(2, "0")}:00`}
                              >
                                {`${i.toString().padStart(2, "0")}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">to</span>
                        <Select
                          value={hours[day].close}
                          onValueChange={(value) =>
                            setHours({
                              ...hours,
                              [day]: { ...hours[day], close: value },
                            })
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem
                                key={i}
                                value={`${i.toString().padStart(2, "0")}:00`}
                              >
                                {`${i.toString().padStart(2, "0")}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                What services do you offer?
              </h2>
              <p className="text-muted-foreground mb-8">
                Select the services callers can book or ask about.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {DENTAL_SERVICES.map((service) => (
                  <label
                    key={service}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      services.includes(service)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={services.includes(service)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setServices([...services, service]);
                        } else {
                          setServices(services.filter((s) => s !== service));
                        }
                      }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {service}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <Input placeholder="Add custom service..." />
                <Button variant="outline">Add</Button>
              </div>
            </div>
          )}

          {/* Step 4: AI Personality */}
          {currentStep === 4 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                Customize your AI personality
              </h2>
              <p className="text-muted-foreground mb-8">
                Choose the language and voice for your AI receptionist.
              </p>

              <div className="space-y-8">
                {/* Language & Voice selection */}
                <VoicePreview
                  selectedVoice={aiConfig.voice}
                  onSelectVoice={(voiceId) => setAiConfig({ ...aiConfig, voice: voiceId })}
                  selectedLanguage={aiConfig.language}
                  onSelectLanguage={(lang) => setAiConfig({ ...aiConfig, language: lang })}
                  greeting={aiConfig.greeting}
                  onGreetingChange={(greeting) => setAiConfig({ ...aiConfig, greeting })}
                  businessName={businessData.name || "your business"}
                  showLanguageSelector={true}
                />

                {/* Greeting */}
                <div className="space-y-2">
                  <Label>Custom Greeting</Label>
                  <Textarea
                    placeholder="Hello! Thank you for calling..."
                    value={aiConfig.greeting}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, greeting: e.target.value })
                    }
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the first message your AI will say when answering a call.
                  </p>
                </div>

                <TestCallButton
                  assistantId={assistantId || undefined}
                  disabled={!assistantId}
                />
              </div>
            </div>
          )}

          {/* Step 5: Phone Setup */}
          {currentStep === 5 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                Set up your phone number
              </h2>
              <p className="text-muted-foreground mb-8">
                Choose how you want to connect your AI receptionist.
              </p>

              <div className="space-y-4">
                <label
                  className={`block p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    phoneSetup.option === "new"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="phoneOption"
                      value="new"
                      checked={phoneSetup.option === "new"}
                      onChange={() =>
                        setPhoneSetup({ ...phoneSetup, option: "new" })
                      }
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        Get a new number
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We'll provide you with a new local number that's
                        dedicated to your AI receptionist.
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`block p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    phoneSetup.option === "forward"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="phoneOption"
                      value="forward"
                      checked={phoneSetup.option === "forward"}
                      onChange={() =>
                        setPhoneSetup({ ...phoneSetup, option: "forward" })
                      }
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        Forward my existing number
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Keep your current number and forward calls to your AI
                        receptionist.
                      </p>
                    </div>
                  </div>
                </label>

                {phoneSetup.option === "new" && (
                  <div className="mt-6 p-6 rounded-xl bg-muted/50">
                    <Label className="mb-3 block">Select Area Code</Label>
                    <Select
                      value={phoneSetup.areaCode}
                      onValueChange={(value) =>
                        setPhoneSetup({ ...phoneSetup, areaCode: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+31">
                          Netherlands (+31)
                        </SelectItem>
                        <SelectItem value="+49">Germany (+49)</SelectItem>
                        <SelectItem value="+32">Belgium (+32)</SelectItem>
                        <SelectItem value="+44">UK (+44)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Your new number: <strong>+31 20 XXX XXXX</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentStep === 1 || isSaving}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleNext} 
              className="gap-2"
              disabled={isSaving || (currentStep === 1 && !businessData.name.trim())}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : currentStep === 5 ? (
                "Launch Your AI"
              ) : (
                "Continue"
              )}
              {!isSaving && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
