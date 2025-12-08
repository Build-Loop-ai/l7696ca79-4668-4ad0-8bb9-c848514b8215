import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Phone, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen hero-gradient grain-overlay overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(166 76% 36% / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(166 76% 40% / 0.1) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(220 60% 20% / 0.3) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              <span className="text-sm text-white/80 font-medium">Trusted by 500+ clinics worldwide</span>
              <Sparkles className="w-3.5 h-3.5 text-teal" />
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[1.1] mb-6"
            >
              <span className="text-gradient-white">Your AI Receptionist</span>
              <br />
              <span className="italic text-teal-light">Never Sleeps</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-white/60 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Answer every call. Book every appointment. 24/7. Let AI handle your
              front desk while you focus on what matters most.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  <span>Start Free Trial</span>
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
              <Link to="/demo">
                <Button
                  variant="glass"
                  size="xl"
                  className="w-full sm:w-auto gap-2 group"
                >
                  <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                  Hear Demo
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
            >
              {[
                "No credit card required",
                "Setup in 5 minutes",
                "Cancel anytime"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/50 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal/80" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Phone Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 blur-3xl opacity-40">
                <div className="absolute inset-10 bg-teal/30 rounded-full" />
              </div>

              {/* Phone mockup */}
              <motion.div 
                className="relative w-72 md:w-80 h-[580px] md:h-[620px] rounded-[3rem] p-1 glow-soft"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-[2.5rem] overflow-hidden relative border border-white/10">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl" />
                  
                  {/* Phone screen content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/50 p-6 pt-12 flex flex-col">
                    {/* Time */}
                    <div className="text-center mb-8">
                      <div className="text-4xl font-light text-foreground tracking-tight">9:41</div>
                      <div className="text-sm text-muted-foreground">Monday, March 15</div>
                    </div>

                    {/* Incoming call card */}
                    <div className="flex-1 flex items-center justify-center px-2">
                      <motion.div 
                        className="w-full glass-premium rounded-3xl p-6 text-center border-glow"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        <motion.div 
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center glow-teal"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Phone className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Incoming Call
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          +31 6 12345678
                        </p>
                        
                        {/* Sound wave */}
                        <div className="flex justify-center mb-4">
                          <div className="sound-wave text-teal">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-teal font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                          </span>
                          AI Answering...
                        </div>
                      </motion.div>
                    </div>

                    {/* Bottom indicator */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-32 h-1 bg-foreground/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating notification cards */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -left-4 md:-left-20 top-1/4 glass-premium rounded-2xl p-4 hidden sm:block border-glow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Appointment Booked</p>
                    <p className="text-xs text-muted-foreground">Dr. Smith - 2:00 PM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -right-4 md:-right-16 bottom-1/3 glass-premium rounded-2xl p-4 hidden sm:block border-glow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Call Handled</p>
                    <p className="text-xs text-muted-foreground">Duration: 1:42</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Smooth gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;