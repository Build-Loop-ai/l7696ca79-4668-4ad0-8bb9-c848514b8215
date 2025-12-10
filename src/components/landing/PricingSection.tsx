import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly_cents: number;
  price_annual_cents: number | null;
  minutes_included: number | null;
  phone_numbers_limit: number | null;
  features: string[];
  is_popular: boolean | null;
}

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        // Transform the data to ensure features is an array
        const transformedPlans = (data || []).map((plan) => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features as string[]
            : typeof plan.features === 'string' 
              ? JSON.parse(plan.features) 
              : [],
        }));

        setPlans(transformedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (cents: number) => {
    return Math.round(cents / 100);
  };

  const getAnnualMonthlyPrice = (plan: Plan) => {
    if (plan.price_annual_cents) {
      // Show monthly equivalent of annual price
      return Math.round(plan.price_annual_cents / 100 / 12);
    }
    // Calculate with discount if no annual price set
    return Math.round(formatPrice(plan.price_monthly_cents) * (1 - siteConfig.annualDiscount / 100));
  };

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
              -{siteConfig.annualDiscount}%
            </span>
          </span>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Pricing cards */}
        {!loading && plans.length > 0 && (
          <div className="relative flex justify-center">
            <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x-mandatory scrollbar-hide px-4 md:px-0">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                  className={`flex-shrink-0 w-[85%] md:w-auto snap-center ${
                    plan.is_popular ? 'md:-my-4' : ''
                  }`}
                >
                  <div
                    className={`relative h-full rounded-3xl p-8 transition-all duration-500 ${
                      plan.is_popular
                        ? "bg-gradient-to-b from-navy via-navy to-navy-light text-white shadow-2xl"
                        : "bg-card border border-border hover:border-primary/20"
                    }`}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1 bg-teal text-white text-xs font-medium rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className={`text-xl font-medium mb-1 ${plan.is_popular ? "text-white" : "text-foreground"}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm ${plan.is_popular ? "text-white/60" : "text-muted-foreground"}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">{siteConfig.currencySymbol}</span>
                        <motion.span
                          key={isAnnual ? "annual" : "monthly"}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-5xl font-serif ${plan.is_popular ? "text-white" : "text-foreground"}`}
                        >
                          {isAnnual ? getAnnualMonthlyPrice(plan) : formatPrice(plan.price_monthly_cents)}
                        </motion.span>
                        <span className={`text-sm ${plan.is_popular ? "text-white/60" : "text-muted-foreground"}`}>
                          /mo
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {/* Show minutes and phone numbers from plan data */}
                      {plan.minutes_included && (
                        <li className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.is_popular ? "bg-teal/20" : "bg-primary/10"
                          }`}>
                            <Check className={`w-3 h-3 ${plan.is_popular ? "text-teal" : "text-primary"}`} />
                          </div>
                          <span className={`text-sm ${plan.is_popular ? "text-white/80" : "text-muted-foreground"}`}>
                            {plan.minutes_included} minutes/month
                          </span>
                        </li>
                      )}
                      {plan.phone_numbers_limit && (
                        <li className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.is_popular ? "bg-teal/20" : "bg-primary/10"
                          }`}>
                            <Check className={`w-3 h-3 ${plan.is_popular ? "text-teal" : "text-primary"}`} />
                          </div>
                          <span className={`text-sm ${plan.is_popular ? "text-white/80" : "text-muted-foreground"}`}>
                            {plan.phone_numbers_limit} phone number{plan.phone_numbers_limit > 1 ? 's' : ''}
                          </span>
                        </li>
                      )}
                      {/* Show additional features */}
                      {plan.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.is_popular ? "bg-teal/20" : "bg-primary/10"
                          }`}>
                            <Check className={`w-3 h-3 ${plan.is_popular ? "text-teal" : "text-primary"}`} />
                          </div>
                          <span className={`text-sm ${plan.is_popular ? "text-white/80" : "text-muted-foreground"}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link to="/signup" className="block">
                      <Button
                        variant={plan.is_popular ? "secondary" : "outline"}
                        size="lg"
                        className={`w-full group ${
                          plan.is_popular 
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
        )}

        {/* Empty state */}
        {!loading && plans.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Pricing plans coming soon.</p>
          </div>
        )}

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include a {siteConfig.trialDays}-day free trial • No credit card required
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
