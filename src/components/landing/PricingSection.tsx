import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small clinics",
      monthlyPrice: 97,
      annualPrice: 77,
      features: ["100 minutes/month", "1 phone number", "Basic AI voice", "Email support", "Call transcripts", "Basic analytics"],
      highlighted: false,
    },
    {
      name: "Growth",
      description: "For growing practices",
      monthlyPrice: 197,
      annualPrice: 157,
      features: ["500 minutes/month", "3 phone numbers", "Premium AI voices", "Priority support", "Custom greeting", "Advanced analytics", "Calendar integration", "Multi-language"],
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "Full-featured solution",
      monthlyPrice: 497,
      annualPrice: 397,
      features: ["2000 minutes/month", "10 phone numbers", "Custom AI personality", "Dedicated support", "White-label option", "API access", "Team management", "SLA guarantee"],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 landing-theme relative overflow-hidden">
      <div className="absolute inset-0 bg-[hsl(240_10%_4%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(265_97%_64%/0.05)] blur-[120px] rounded-full" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm text-white/60">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Simple, transparent{" "}
            <span className="bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] bg-clip-text text-transparent">pricing</span>
          </h2>
          <p className="text-lg text-white/50">All plans include a 14-day free trial.</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isAnnual ? "text-white" : "text-white/40"}`}>Monthly</span>
          <button onClick={() => setIsAnnual(!isAnnual)} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isAnnual ? "bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)]" : "bg-white/20"}`}>
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? "translate-x-7" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? "text-white" : "text-white/40"}`}>
            Annual <span className="ml-2 px-2 py-0.5 rounded-full bg-[hsl(265_97%_64%/0.2)] text-[hsl(265_97%_64%)] text-xs">Save 20%</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${plan.highlighted ? "glass-card border-gradient-animated scale-105 shadow-[0_0_60px_-20px_hsl(265_97%_64%/0.4)]" : "glass-card"}`}>
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] rounded-full text-white text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-display font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-white/50">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-display font-bold text-white">€{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                <span className="text-white/40">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[hsl(265_97%_64%)]" />
                    <span className="text-sm text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className={`w-full py-6 rounded-xl font-semibold ${plan.highlighted ? "bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] text-white hover:opacity-90" : "bg-white/10 text-white hover:bg-white/20"}`}>
                  Start Free Trial
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
