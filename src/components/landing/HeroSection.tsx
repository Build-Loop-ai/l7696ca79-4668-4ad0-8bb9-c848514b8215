import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: 'hsl(220 60% 10%)' }}>

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
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

          {/* Right Column - Premium iPhone Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* iPhone 15 Pro style mockup */}
              <motion.div 
                className="relative"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Phone outer frame - titanium style */}
                <div 
                  className="relative w-[280px] md:w-[320px] rounded-[3.5rem] p-[3px]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(120,120,130,0.8) 0%, rgba(60,60,70,0.9) 50%, rgba(40,40,50,1) 100%)',
                    boxShadow: `
                      0 50px 100px -20px rgba(0,0,0,0.5),
                      0 30px 60px -15px rgba(0,0,0,0.4),
                      inset 0 1px 0 rgba(255,255,255,0.1),
                      inset 0 -1px 0 rgba(0,0,0,0.3)
                    `,
                  }}
                >
                  {/* Inner bezel */}
                  <div 
                    className="w-full rounded-[3.3rem] p-[2px]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(30,30,35,1) 0%, rgba(15,15,20,1) 100%)',
                    }}
                  >
                    {/* Screen */}
                    <div className="relative w-full aspect-[9/19.5] rounded-[3.1rem] overflow-hidden bg-black">
                      {/* Dynamic Island */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                        <div 
                          className="w-[100px] h-[32px] rounded-full bg-black flex items-center justify-center gap-3"
                          style={{
                            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                          }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gray-600 to-gray-800" />
                        </div>
                      </div>
                      
                      {/* Screen content */}
                      <div 
                        className="absolute inset-0 pt-14 pb-6 px-5"
                        style={{
                          background: 'linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 25% 6%) 100%)',
                        }}
                      >
                        {/* Status bar */}
                        <div className="flex justify-between items-center text-white/60 text-xs mb-6 px-1">
                          <span className="font-medium">9:41</span>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 3c-4.5 0-8 1.5-8 3v3l8 5 8-5V6c0-1.5-3.5-3-8-3z"/>
                            </svg>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M2 17h20v4H2zm0-7h20v4H2zm0-7h20v4H2z"/>
                            </svg>
                            <div className="w-6 h-3 rounded-sm border border-current flex items-center justify-end pr-0.5">
                              <div className="w-4 h-2 rounded-sm bg-teal" />
                            </div>
                          </div>
                        </div>

                        {/* Active call UI */}
                        <div className="flex flex-col items-center text-center">
                          {/* Caller avatar with ring animation */}
                          <div className="relative mb-4">
                            <motion.div
                              className="absolute inset-0 rounded-full bg-teal/10"
                              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0, 0.15] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-full bg-teal/5"
                              animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0, 0.1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                            />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                            </div>
                          </div>

                          <p className="text-white/50 text-sm mb-1">Incoming Call</p>
                          <h3 className="text-white text-xl font-medium mb-1">Dr. Smith's Office</h3>
                          <p className="text-white/40 text-sm mb-6">+31 6 12345678</p>

                          {/* AI status indicator */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="px-4 py-2 rounded-full bg-teal/10 border border-teal/20 mb-6"
                          >
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                              </span>
                              <span className="text-teal text-sm font-medium">AI Answering</span>
                            </div>
                          </motion.div>

                          {/* Audio waveform */}
                          <div className="flex items-center justify-center gap-1 h-12 mb-8">
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 rounded-full bg-gradient-to-t from-teal/50 to-teal"
                                animate={{
                                  height: [12, 24 + Math.random() * 20, 12],
                                }}
                                transition={{
                                  duration: 0.8 + Math.random() * 0.4,
                                  repeat: Infinity,
                                  delay: i * 0.05,
                                }}
                              />
                            ))}
                          </div>

                          {/* Call controls */}
                          <div className="flex items-center gap-4">
                            <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            </button>
                            <button className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/30">
                              <svg className="w-7 h-7 text-white rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </button>
                            <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Home indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                          <div className="w-32 h-1 bg-white/20 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side buttons */}
                <div className="absolute left-0 top-24 w-[3px] h-8 bg-gradient-to-b from-gray-600 to-gray-700 rounded-l-sm" />
                <div className="absolute left-0 top-40 w-[3px] h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-l-sm" />
                <div className="absolute left-0 top-56 w-[3px] h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-l-sm" />
                <div className="absolute right-0 top-36 w-[3px] h-16 bg-gradient-to-b from-gray-600 to-gray-700 rounded-r-sm" />
              </motion.div>

              {/* Floating notification cards */}
              <motion.div 
                initial={{ opacity: 0, x: -40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -left-8 md:-left-24 top-1/4 hidden sm:block"
              >
                <div 
                  className="rounded-2xl p-4 max-w-[180px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">Booked</p>
                      <p className="text-xs text-white/50 truncate">Thu, 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 40, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="absolute -right-8 md:-right-20 bottom-1/3 hidden sm:block"
              >
                <div 
                  className="rounded-2xl p-4 max-w-[180px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">Call Handled</p>
                      <p className="text-xs text-white/50 truncate">1m 42s</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave transition to next section */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;