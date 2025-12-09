import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const features = [
    {
      title: "24/7",
      subtitle: "Always On",
      description: "Your AI never sleeps, never takes breaks, never calls in sick. Every call answered, every time.",
      visual: "availability",
    },
    {
      title: "< 2s",
      subtitle: "Response Time",
      description: "Instant pickup. No hold music. No 'please wait'. Your callers get immediate attention.",
      visual: "speed",
    },
    {
      title: "22+",
      subtitle: "Languages",
      description: "Native-quality conversations in Dutch, German, Spanish, French, and more. Truly global reach.",
      visual: "languages",
    },
  ];

  return (
    <section id="features" ref={containerRef} className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden bg-background">
      {/* Floating gradient orbs */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal/10 to-transparent blur-3xl"
      />
      <motion.div 
        style={{ y: y2, opacity }}
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-primary/8 to-transparent blur-3xl"
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header - Editorial style */}
        <div className="max-w-5xl mx-auto mb-24 md:mb-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-[0.3em] text-primary mb-6"
          >
            Why Callisto
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] text-foreground"
          >
            The reception desk,{" "}
            <span className="italic text-gradient">reimagined</span>
          </motion.h2>
        </div>

        {/* Bento-style feature blocks */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Large feature - 24/7 */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-7 group"
          >
            <div className="relative h-full min-h-[400px] md:min-h-[500px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-light p-8 md:p-12">
              {/* Animated clock visualization */}
              <div className="absolute right-8 bottom-8 w-48 h-48 md:w-64 md:h-64 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal/50" />
                  <motion.circle 
                    cx="100" cy="100" r="90" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    strokeDasharray="565"
                    className="text-teal"
                    initial={{ strokeDashoffset: 565 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 3, ease: "easeOut" }}
                  />
                </svg>
              </div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex-1">
                  <span className="text-8xl md:text-[10rem] font-serif font-light text-teal leading-none">
                    24/7
                  </span>
                  <p className="text-xl md:text-2xl text-white/60 mt-4 font-light">
                    Always On
                  </p>
                </div>
                <p className="text-white/50 text-lg leading-relaxed max-w-md">
                  Your AI never sleeps, never takes breaks, never calls in sick. Every call answered, every time.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stacked features */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Response time */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="group flex-1"
            >
              <div className="relative h-full min-h-[220px] rounded-[2rem] overflow-hidden bg-card border border-border/50 p-8 group-hover:border-primary/20 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl md:text-6xl font-serif text-foreground">&lt;2</span>
                    <span className="text-2xl text-primary font-medium">sec</span>
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    Response Time
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Instant pickup. No hold music. No waiting.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group flex-1"
            >
              <div className="relative h-full min-h-[220px] rounded-[2rem] overflow-hidden bg-card border border-border/50 p-8 group-hover:border-primary/20 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Language flags visualization */}
                <div className="absolute right-6 top-6 flex flex-wrap gap-2 max-w-[120px] opacity-30 group-hover:opacity-50 transition-opacity">
                  {['🇳🇱', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹', '🇵🇹', '🇯🇵', '🇰🇷'].map((flag, i) => (
                    <motion.span 
                      key={i} 
                      className="text-xl"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      {flag}
                    </motion.span>
                  ))}
                </div>

                <div className="relative z-10">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl md:text-6xl font-serif text-foreground">22</span>
                    <span className="text-2xl text-primary font-medium">+</span>
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    Languages
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Native-quality conversations worldwide.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Full-width capability showcase */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 max-w-6xl mx-auto"
        >
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border/30 p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                { metric: "50,000+", label: "Calls handled this month" },
                { metric: "98%", label: "Caller satisfaction rate" },
                { metric: "4.9★", label: "Average customer rating" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-serif text-foreground mb-2">
                    {stat.metric}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;