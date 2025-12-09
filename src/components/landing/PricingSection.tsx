import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Starter",
      description: "For small clinics getting started",
      monthlyPrice: 97,
      annualPrice: 77,
      features: [
        "100 minutes/month",
        "1 phone number",
        "Basic AI voice",
        "Email support",
        "Call transcripts",
      ],
    },
    {
      name: "Growth",
      description: "For growing practices",
      monthlyPrice: 197,
      annualPrice: 157,
      features: [
        "500 minutes/month",
        "3 phone numbers",
        "Premium AI voices",
        "Priority support",
        "Custom greeting",
        "Calendar integration",
        "Multi-language",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 497,
      annualPrice: 397,
      features: [
        "2000 minutes/month",
        "10 phone numbers",
        "Custom AI personality",
        "Dedicated support",
        "White-label option",
        "API access",
        "Team management",
      ],
    },
  ];

  return (
    <section id="pricing" ref={ref} className="relative py-32 md:py-48 bg-muted/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-[0.3em] text-primary mb-6"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif leading-[1.1] text-foreground mb-6"
          >
            Simple, honest{" "}
            <span className="italic text-gradient">pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            No hidden fees. No contracts. Cancel anytime.
          </motion.p>
        </div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-16"
        >
          <span
            className={`text-sm font-medium transition-colors ${
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-12 h-7 rounded-full bg-primary/20 p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <motion.span
              className="block w-6 h-6 rounded-full bg-primary shadow-md"
              animate={{ x: isAnnual ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors flex items-center gap-2 ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual
            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              -20%
            </span>
          </span>
        </motion.div>

        {/* Pricing cards - Horizontal scroll on mobile, grid on desktop */}
        <div className="relative">
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                className={`flex-shrink-0 w-[85%] md:w-auto snap-center ${
                  plan.highlighted ? 'md:-my-4' : ''
                }`}
              >
                <div
                  className={`relative h-full rounded-3xl p-8 transition-all duration-500 ${
                    plan.highlighted
                      ? "bg-gradient-to-b from-navy via-navy to-navy-light text-white shadow-2xl"
                      : "bg-card border border-border hover:border-primary/20"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-teal text-white text-xs font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-xl font-medium mb-1 ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground">€</span>
                      <motion.span
                        key={isAnnual ? "annual" : "monthly"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-5xl font-serif ${plan.highlighted ? "text-white" : "text-foreground"}`}
                      >
                        {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </motion.span>
                      <span className={`text-sm ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                        /mo
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.highlighted ? "bg-teal/20" : "bg-primary/10"
                        }`}>
                          <Check className={`w-3 h-3 ${plan.highlighted ? "text-teal" : "text-primary"}`} />
                        </div>
                        <span className={`text-sm ${plan.highlighted ? "text-white/80" : "text-muted-foreground"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/signup" className="block">
                    <Button
                      variant={plan.highlighted ? "secondary" : "outline"}
                      size="lg"
                      className={`w-full group ${
                        plan.highlighted 
                          ? "bg-white text-navy hover:bg-white/90" 
                          : ""
                      }`}
                    >
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include a 14-day free trial • No credit card required
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;