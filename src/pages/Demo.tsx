import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DemoForm from "@/components/demo/DemoForm";
import DemoAudioPlayer from "@/components/demo/DemoAudioPlayer";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";

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
          {/* Gradient Orbs */}
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(166,76%,36%,0.15) 0%, transparent 70%)",
              top: "-20%",
              right: "-10%",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(222,47%,40%,0.1) 0%, transparent 70%)",
              bottom: "-10%",
              left: "-10%",
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-teal/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Grid overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
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
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
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
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                >
                  {/* Left - Hero Content */}
                  <div className="text-center lg:text-left order-1">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                      style={{
                        background: "linear-gradient(135deg, hsla(166,76%,36%,0.2) 0%, hsla(166,76%,36%,0.05) 100%)",
                        border: "1px solid hsla(166,76%,36%,0.3)",
                      }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                      </span>
                      <span className="text-sm text-teal font-medium">Free Demo • No Sign Up Required</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] mb-6"
                    >
                      <span className="text-white">Hear Your AI</span>
                      <br />
                      <span className="text-white">Receptionist in </span>
                      <span className="relative">
                        <span 
                          className="bg-gradient-to-r from-teal via-teal-light to-teal bg-clip-text text-transparent"
                          style={{ fontStyle: "italic" }}
                        >
                          30 Seconds
                        </span>
                        <motion.span
                          className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-teal to-transparent"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.8, duration: 0.6 }}
                        />
                      </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg text-white/60 mb-10 max-w-md mx-auto lg:mx-0"
                    >
                      Enter your business details and instantly hear how your AI receptionist will greet callers.
                    </motion.p>

                    {/* Features */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap gap-4 justify-center lg:justify-start"
                    >
                      {["Sounds natural", "29 languages", "Instant preview"].map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                          <span className="text-sm text-white/70">{feature}</span>
                        </div>
                      ))}
                    </motion.div>

                    {/* Floating Visual Elements */}
                    <motion.div
                      className="hidden lg:block absolute -left-20 top-1/4 w-64 h-64"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute inset-0 border border-white/5 rounded-full" />
                      <div className="absolute inset-8 border border-white/5 rounded-full" />
                      <div className="absolute inset-16 border border-teal/10 rounded-full" />
                    </motion.div>
                  </div>

                  {/* Right - Form */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="order-2"
                  >
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
                        {/* Form Header */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-lg font-medium text-white">Create Your Demo</h2>
                            <p className="text-sm text-white/50">Takes less than 30 seconds</p>
                          </div>
                        </div>
                        
                        <DemoForm onSubmit={handleSubmit} isLoading={isLoading} />
                      </div>
                    </div>
                  </motion.div>
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
                  {/* Success State */}
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

                  {/* Player Card */}
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

        {/* Bottom gradient fade */}
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(222,47%,6%)] to-transparent pointer-events-none" />
      </div>
    </>
  );
};

export default Demo;