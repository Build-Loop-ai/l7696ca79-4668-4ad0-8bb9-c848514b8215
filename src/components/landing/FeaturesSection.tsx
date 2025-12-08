import {
  Clock,
  Calendar,
  PhoneForwarded,
  Languages,
  Mic,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FeaturesSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  const features = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Never miss a call again. Your AI receptionist answers every call, day or night, weekends and holidays.",
      gradient: "from-teal/20 to-teal/5",
    },
    {
      icon: Calendar,
      title: "Smart Booking",
      description:
        "Seamlessly integrates with your calendar. Patients can book, reschedule, or cancel appointments automatically.",
      gradient: "from-info/20 to-info/5",
    },
    {
      icon: PhoneForwarded,
      title: "Intelligent Routing",
      description:
        "Urgent cases get transferred immediately. Routine calls are handled automatically with precision.",
      gradient: "from-warning/20 to-warning/5",
    },
    {
      icon: Languages,
      title: "20+ Languages",
      description:
        "Communicate with patients in their preferred language. Native-quality support for global reach.",
      gradient: "from-success/20 to-success/5",
    },
    {
      icon: Mic,
      title: "Custom Voice",
      description:
        "Choose from natural-sounding voices. Customize the tone from professional to friendly.",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      description:
        "Monitor calls, view transcripts, and track performance metrics from one beautiful dashboard.",
      gradient: "from-teal/20 to-teal/5",
    },
  ];

  return (
    <section id="features" ref={containerRef} className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Everything you need to{" "}
            <span className="italic text-gradient">transform</span> your front
            desk
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed specifically for healthcare providers and
            local businesses.
          </p>
        </motion.div>

        {/* Horizontal scrolling feature cards on mobile */}
        <div ref={horizontalScrollRef} className="md:hidden overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 snap-x-mandatory">
          <motion.div 
            style={{ x }}
            className="flex gap-4 w-max"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="w-[280px] flex-shrink-0 snap-center"
              >
                <FeatureCard feature={feature} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Grid layout for desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature }: { feature: { icon: any; title: string; description: string; gradient: string } }) => (
  <div className="group h-full bg-card rounded-3xl p-8 border border-border/50 hover-lift relative overflow-hidden">
    {/* Gradient background on hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-dark flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
        <feature.icon className="w-7 h-7 text-primary-foreground" />
      </div>
      
      <h3 className="text-xl font-serif text-foreground mb-3 flex items-center gap-2">
        {feature.title}
        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300" />
      </h3>
      
      <p className="text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  </div>
);

export default FeaturesSection;