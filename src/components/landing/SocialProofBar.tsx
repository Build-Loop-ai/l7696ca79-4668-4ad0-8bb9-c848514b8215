import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const SocialProofBar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  const words = [
    "Appointments Booked",
    "•",
    "Calls Answered",
    "•",
    "Hours Saved",
    "•",
    "Happy Patients",
    "•",
    "Zero Missed Calls",
    "•",
    "24/7 Coverage",
    "•",
  ];

  return (
    <section ref={containerRef} className="relative py-16 md:py-24 overflow-hidden bg-background">
      {/* First row - moving right */}
      <motion.div 
        style={{ x: x1 }}
        className="flex whitespace-nowrap mb-4"
      >
        {[...words, ...words, ...words].map((word, idx) => (
          <span 
            key={idx} 
            className={`text-4xl md:text-6xl lg:text-7xl font-serif mx-4 ${
              word === "•" 
                ? "text-primary" 
                : idx % 4 === 0 
                  ? "text-foreground" 
                  : "text-muted-foreground/30"
            }`}
          >
            {word}
          </span>
        ))}
      </motion.div>

      {/* Second row - moving left */}
      <motion.div 
        style={{ x: x2 }}
        className="flex whitespace-nowrap"
      >
        {[...words.slice(3), ...words, ...words.slice(0, 3)].map((word, idx) => (
          <span 
            key={idx} 
            className={`text-4xl md:text-6xl lg:text-7xl font-serif mx-4 ${
              word === "•" 
                ? "text-teal" 
                : idx % 3 === 0 
                  ? "text-foreground" 
                  : "text-muted-foreground/30"
            }`}
          >
            {word}
          </span>
        ))}
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-background to-transparent z-10" />
    </section>
  );
};

export default SocialProofBar;