import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const testimonials = [
    {
      quote: "Callisto has completely transformed how we handle patient calls. We went from missing 30% of calls to zero. The ROI was positive within two weeks.",
      author: "Dr. Sarah van den Berg",
      role: "Owner & Lead Dentist",
      clinic: "Amsterdam Dental Care",
      metric: "30%",
      metricLabel: "fewer missed calls",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    },
    {
      quote: "My staff used to spend 4 hours a day on the phone. Now they focus on patients in the clinic. The AI handles scheduling better than we ever did.",
      author: "Michael de Vries",
      role: "Practice Manager",
      clinic: "Rotterdam Family Dentistry",
      metric: "4hrs",
      metricLabel: "saved daily",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    },
    {
      quote: "I was skeptical about AI, but the natural conversations surprised me. Patients often don't realize they're talking to an AI. That's exactly what we wanted.",
      author: "Dr. Emma Jansen",
      role: "Founder",
      clinic: "SmileBright Utrecht",
      metric: "92%",
      metricLabel: "patient satisfaction",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 bg-background overflow-hidden">
      {/* Large quote decoration */}
      <motion.div 
        style={{ opacity }}
        className="absolute top-20 left-10 text-[20rem] font-serif text-muted/20 leading-none pointer-events-none select-none hidden lg:block"
      >
        "
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-[0.3em] text-primary mb-6"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif leading-[1.1] text-foreground"
          >
            Loved by{" "}
            <span className="italic text-gradient">500+ clinics</span>
          </motion.h2>
        </div>

        {/* Main testimonial display */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Navigation buttons */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10">
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Testimonial card */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
                {/* Metric highlight */}
                <div className="md:col-span-2">
                  <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-navy via-navy to-navy-light text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-6xl md:text-7xl font-serif text-teal mb-2">
                        {testimonials[activeIndex].metric}
                      </div>
                      <div className="text-white/60 text-sm uppercase tracking-wider">
                        {testimonials[activeIndex].metricLabel}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Quote and author */}
                <div className="md:col-span-3 space-y-8">
                  <div className="relative">
                    <Quote className="absolute -top-4 -left-4 w-8 h-8 text-primary/20" />
                    <blockquote className="text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed font-serif">
                      {testimonials[activeIndex].quote}
                    </blockquote>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={testimonials[activeIndex].image}
                      alt={testimonials[activeIndex].author}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-background shadow-lg"
                    />
                    <div>
                      <div className="font-medium text-foreground text-lg">
                        {testimonials[activeIndex].author}
                      </div>
                      <div className="text-muted-foreground">
                        {testimonials[activeIndex].role}
                      </div>
                      <div className="text-primary text-sm">
                        {testimonials[activeIndex].clinic}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-12">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex 
                      ? "w-8 bg-primary" 
                      : "bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Trust logos */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 md:mt-32"
        >
          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Trusted by leading dental practices
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40">
            {["Dental Care Plus", "SmileBright Clinics", "HealthFirst", "MediCare Pro", "VitalHealth"].map((name, idx) => (
              <span key={idx} className="text-lg md:text-xl font-serif text-muted-foreground whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;