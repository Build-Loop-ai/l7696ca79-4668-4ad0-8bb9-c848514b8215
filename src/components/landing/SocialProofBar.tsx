import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Star, Clock, TrendingUp } from "lucide-react";

const SocialProofBar = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { icon: Phone, value: "50,000+", label: "Calls Handled", suffix: "" },
    { icon: Star, value: "4.9", label: "Customer Rating", suffix: "★" },
    { icon: Clock, value: "<2", label: "Avg Response", suffix: "min" },
    { icon: TrendingUp, value: "98", label: "Success Rate", suffix: "%" },
  ];

  const logos = [
    "Dental Care Plus",
    "SmileBright Clinics",
    "HealthFirst",
    "MediCare Pro",
    "DentaLink",
    "Oral Excellence",
    "PrimeCare",
    "VitalHealth",
  ];

  return (
    <section ref={ref} className="py-20 bg-background relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Infinite scrolling logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Trusted by leading healthcare providers
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex animate-marquee">
              {[...logos, ...logos].map((logo, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 px-8 md:px-12"
                >
                  <span className="text-lg md:text-xl font-serif text-muted-foreground/40 whitespace-nowrap">
                    {logo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col items-center p-6 md:p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover-lift">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-serif text-foreground mb-1 tabular-nums">
                  {stat.value}<span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;