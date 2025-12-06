import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DemoForm from "@/components/demo/DemoForm";
import DemoAudioPlayer from "@/components/demo/DemoAudioPlayer";
import { Helmet } from "react-helmet";

interface DemoResult {
  audioContent: string;
  transcript: string;
  businessName: string;
}

const Demo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);

  const handleSubmit = async (data: {
    businessName: string;
    businessType: string;
    services: string;
    tone: string;
    voiceId: string;
    email: string;
  }) => {
    setIsLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke(
        "generate-demo-audio",
        {
          body: {
            businessName: data.businessName,
            businessType: data.businessType,
            services: data.services,
            tone: data.tone,
            voiceId: data.voiceId,
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
        businessName: data.businessName,
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
  };

  const benefits = [
    "Never miss a call again",
    "24/7 appointment booking",
    "Sounds natural, not robotic",
    "Works in 29 languages",
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

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-medium">Callisto</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Form or Player */}
              <div className="order-2 lg:order-1">
                <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-xl">
                  {!demoResult ? (
                    <>
                      <div className="mb-6">
                        <h2 className="font-serif text-2xl font-medium mb-2">
                          Create Your Demo
                        </h2>
                        <p className="text-muted-foreground">
                          Fill in the details below and hear your personalized AI
                          receptionist in seconds.
                        </p>
                      </div>
                      <DemoForm onSubmit={handleSubmit} isLoading={isLoading} />
                    </>
                  ) : (
                    <DemoAudioPlayer
                      audioContent={demoResult.audioContent}
                      transcript={demoResult.transcript}
                      businessName={demoResult.businessName}
                      onReset={handleReset}
                    />
                  )}
                </div>
              </div>

              {/* Right Column - Info */}
              <div className="order-1 lg:order-2 lg:sticky lg:top-24">
                <div className="space-y-8">
                  {/* Hero Text */}
                  <div>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                      Free Demo • No Sign Up Required
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-4">
                      Hear Your AI Receptionist in{" "}
                      <span className="gradient-text">30 Seconds</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Enter your business name and preferences to generate a
                      personalized demo. Hear exactly how your AI will greet
                      callers and handle appointments.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Testimonial */}
                  <div className="bg-muted/30 rounded-xl p-5 border border-border">
                    <p className="text-sm italic mb-3">
                      "I was skeptical until I heard the demo with my clinic's
                      name. It sounded so natural! We signed up the same day."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                        DR
                      </div>
                      <div>
                        <div className="text-sm font-medium">Dr. Rachel Kim</div>
                        <div className="text-xs text-muted-foreground">
                          Bright Smile Dental
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Demo;
