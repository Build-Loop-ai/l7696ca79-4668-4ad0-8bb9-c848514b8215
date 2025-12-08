import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    {
      number: "01",
      title: "Connect",
      headline: "Forward your calls in 5 minutes",
      description: "Get a dedicated AI phone number or forward your existing line. Our wizard guides you through every step—no technical knowledge required.",
      visual: "connect",
    },
    {
      number: "02",
      title: "Customize",
      headline: "Make it sound like you",
      description: "Choose the voice, personality, and language. Add your business hours, services, and special instructions. Your AI learns everything about your practice.",
      visual: "customize",
    },
    {
      number: "03",
      title: "Launch",
      headline: "Go live, stress-free",
      description: "Your AI receptionist starts handling calls immediately. Monitor conversations, track bookings, and watch your productivity soar—all from one dashboard.",
      visual: "launch",
    },
  ];

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 bg-muted/20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="max-w-4xl mx-auto text-center mb-24 md:mb-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-[0.3em] text-primary mb-6"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] text-foreground"
          >
            Three steps to{" "}
            <span className="italic text-gradient">freedom</span>
          </motion.h2>
        </div>

        {/* Steps - Staggered layout */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical progress line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-teal to-primary"
              style={{ height: lineHeight }}
            />
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`relative grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 md:mb-32 last:mb-0 ${
                idx % 2 === 1 ? 'md:direction-rtl' : ''
              }`}
            >
              {/* Number indicator */}
              <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 z-20 ${
                idx % 2 === 1 ? 'md:order-none' : ''
              }`}>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-14 h-14 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-lg"
                >
                  <span className="text-lg font-serif text-primary">{step.number}</span>
                </motion.div>
              </div>

              {/* Content */}
              <div className={`pl-20 md:pl-0 ${idx % 2 === 1 ? 'md:text-right md:pr-16 md:order-2' : 'md:pr-16'}`}>
                <span className="text-xs uppercase tracking-[0.25em] text-primary font-medium">
                  {step.title}
                </span>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground mt-3 mb-4 leading-tight">
                  {step.headline}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual */}
              <div className={`pl-20 md:pl-0 ${idx % 2 === 1 ? 'md:pl-16 md:order-1' : 'md:pl-16'}`}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-card to-muted border border-border/50">
                  {step.visual === "connect" && <ConnectVisual />}
                  {step.visual === "customize" && <CustomizeVisual />}
                  {step.visual === "launch" && <LaunchVisual />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground/50"
          >
            <ArrowDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Custom visual components for each step
const ConnectVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-8">
    <div className="relative">
      {/* Phone icon */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center shadow-xl"
      >
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </motion.div>
      
      {/* Connection arrow */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="absolute left-full top-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-primary to-teal origin-left"
      />
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
        className="absolute left-[calc(100%+4rem)] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-teal"
      />
      
      {/* AI icon */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="absolute left-[calc(100%+5rem)] top-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-xl"
      >
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </motion.div>
    </div>
  </div>
);

const CustomizeVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <div className="w-full max-w-[240px] space-y-3">
      {/* Voice selector */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-background rounded-xl p-3 border border-border shadow-sm"
      >
        <div className="text-xs text-muted-foreground mb-1">Voice</div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal" />
          <span className="text-sm font-medium text-foreground">Sophie (Dutch)</span>
        </div>
      </motion.div>
      
      {/* Language selector */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="bg-background rounded-xl p-3 border border-border shadow-sm"
      >
        <div className="text-xs text-muted-foreground mb-1">Language</div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🇳🇱</span>
          <span className="text-sm font-medium text-foreground">Nederlands</span>
        </div>
      </motion.div>
      
      {/* Personality slider */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="bg-background rounded-xl p-3 border border-border shadow-sm"
      >
        <div className="text-xs text-muted-foreground mb-2">Personality</div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "70%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="h-full bg-gradient-to-r from-primary to-teal rounded-full"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Professional</span>
          <span className="text-xs text-muted-foreground">Friendly</span>
        </div>
      </motion.div>
    </div>
  </div>
);

const LaunchVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="relative"
    >
      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-full"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
        <span className="text-xs font-medium">LIVE</span>
      </motion.div>
      
      {/* Dashboard preview */}
      <div className="w-56 bg-background rounded-2xl border border-border shadow-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Today</span>
          <span className="text-xs text-muted-foreground">12 calls</span>
        </div>
        
        {/* Mini chart */}
        <div className="flex items-end gap-1 h-16">
          {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="flex-1 bg-gradient-to-t from-primary to-teal rounded-sm"
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8am</span>
          <span>2pm</span>
        </div>
      </div>
    </motion.div>
  </div>
);

export default HowItWorks;