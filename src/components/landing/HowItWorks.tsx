import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { ConnectVisual, CustomizeVisual, LaunchVisual } from "./HowItWorksVisuals";

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
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-card via-background to-muted border border-border/30 shadow-2xl shadow-primary/5">
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

export default HowItWorks;