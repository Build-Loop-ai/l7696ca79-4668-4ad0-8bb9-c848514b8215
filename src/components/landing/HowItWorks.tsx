import { Phone, Brain, CheckCircle, ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: Phone,
      number: "01",
      title: "Connect Your Number",
      description:
        "Forward your existing line or get a new one. Setup takes less than 5 minutes with our guided wizard.",
      color: "from-teal to-teal-dark",
    },
    {
      icon: Brain,
      number: "02",
      title: "Train Your AI",
      description:
        "Customize the voice, personality, and responses. Your AI learns your business inside and out.",
      color: "from-teal-dark to-navy-light",
    },
    {
      icon: CheckCircle,
      number: "03",
      title: "Never Miss a Call",
      description:
        "Your AI handles calls 24/7, books appointments, answers questions, and transfers urgent cases.",
      color: "from-navy-light to-navy",
    },
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Get started in{" "}
            <span className="italic text-gradient">three simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No technical knowledge required. Our intelligent onboarding guides you
            through everything.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
              className="relative group"
            >
              {/* Connection arrow (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-16 left-full w-full items-center justify-center -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 + idx * 0.2 }}
                    className="w-3/4 h-px bg-gradient-to-r from-border via-primary/30 to-border origin-left"
                  />
                  <ArrowRight className="w-4 h-4 text-primary/50 -ml-2" />
                </div>
              )}

              <div className="relative h-full bg-card rounded-3xl p-8 border border-border/50 hover-lift overflow-hidden group-hover:border-primary/20 transition-colors duration-500">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Step number */}
                <div className={`absolute -top-3 left-8 px-4 py-1.5 rounded-full bg-gradient-to-r ${step.color} text-white text-sm font-medium shadow-lg`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform duration-500">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <step.icon className="w-8 h-8 text-primary relative z-10" />
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-serif text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="relative text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;