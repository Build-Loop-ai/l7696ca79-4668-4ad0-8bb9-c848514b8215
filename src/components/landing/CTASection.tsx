import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, Sparkles } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { config } = useSiteConfigTransformed();

  return (
    <section ref={ref} className="py-24 md:py-40 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(166 76% 36% / 0.2) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(166 76% 40% / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium mb-8"
          >
            <Phone className="w-4 h-4 text-teal-light" />
            <span className="text-sm text-white/80">
              Join {config.socialProof.customerCount} {config.socialProof.customerLabel} already using {config.name}
            </span>
            <Sparkles className="w-4 h-4 text-teal-light" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif mb-6"
          >
            <span className="text-gradient-white">Ready to transform your</span>
            <br />
            <span className="italic text-teal-light">front desk?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12"
          >
            Start your {config.trialDays}-day free trial today. No credit card required, no
            commitment. See the difference AI can make.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2 group">
                Start Free Trial
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="glass" size="xl">
                Hear Demo First
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
          >
            {[
              { label: "GDPR Compliant", icon: "🔒" },
              { label: "99.9% Uptime", icon: "⚡" },
              { label: "24/7 Support", icon: "💬" },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-white/50 text-sm"
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;