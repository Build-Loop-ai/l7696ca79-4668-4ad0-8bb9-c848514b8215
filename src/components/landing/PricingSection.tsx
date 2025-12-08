import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small clinics getting started",
      monthlyPrice: 97,
      annualPrice: 77,
      features: [
        "100 minutes/month",
        "1 phone number",
        "Basic AI voice",
        "Email support",
        "Call transcripts",
        "Basic analytics",
      ],
      highlighted: false,
    },
    {
      name: "Growth",
      description: "For growing practices with higher volume",
      monthlyPrice: 197,
      annualPrice: 157,
      features: [
        "500 minutes/month",
        "3 phone numbers",
        "Premium AI voices",
        "Priority support",
        "Custom greeting",
        "Advanced analytics",
        "Calendar integration",
        "Multi-language support",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "Full-featured solution for large organizations",
      monthlyPrice: 497,
      annualPrice: 397,
      features: [
        "2000 minutes/month",
        "10 phone numbers",
        "Custom AI personality",
        "Dedicated support",
        "White-label option",
        "API access",
        "Custom integrations",
        "Team management",
        "SLA guarantee",
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Simple, transparent{" "}
            <span className="italic text-gradient">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more. All plans include a 14-day
            trial.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-16"
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
            className={`relative w-16 h-9 rounded-full transition-colors duration-300 ${
              isAnnual ? "bg-primary" : "bg-muted"
            }`}
          >
            <motion.span
              className="absolute top-1.5 w-6 h-6 rounded-full bg-white shadow-lg"
              animate={{ x: isAnnual ? 32 : 6 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors flex items-center gap-2 ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual
            <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
              Save 20%
            </span>
          </span>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
              className={`relative rounded-3xl p-8 transition-all duration-500 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-navy via-navy to-navy-light text-white scale-105 z-10 glow-soft"
                  : "bg-card border border-border/50 hover-lift"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-teal to-teal-dark rounded-full text-white text-sm font-medium shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-2xl font-serif mb-2 ${
                    plan.highlighted ? "text-white" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.highlighted
                      ? "text-white/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-medium text-muted-foreground">€</span>
                  <motion.span
                    key={isAnnual ? "annual" : "monthly"}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-5xl font-serif tabular-nums ${
                      plan.highlighted ? "text-white" : "text-foreground"
                    }`}
                  >
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </motion.span>
                  <span
                    className={`text-sm ${
                      plan.highlighted
                        ? "text-white/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    /month
                  </span>
                </div>
                {isAnnual && (
                  <p className={`text-xs mt-2 ${plan.highlighted ? "text-teal-light" : "text-success"}`}>
                    Billed annually (€{(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12}/year)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlighted ? "bg-teal/20" : "bg-primary/10"
                    }`}>
                      <Check
                        className={`w-3 h-3 ${
                          plan.highlighted ? "text-teal-light" : "text-primary"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        plan.highlighted
                          ? "text-white/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/signup">
                <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                  size="lg"
                  className={`w-full ${plan.highlighted ? "bg-white text-navy hover:bg-white/90" : ""}`}
                >
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;