import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

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
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Simple, transparent{" "}
            <span className="italic text-primary">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more. All plans include a 14-day
            trial.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium ${
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              isAnnual ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-secondary text-secondary-foreground shadow-2xl scale-105 border-2 border-primary"
                  : "bg-card shadow-lg border border-border/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-primary-foreground text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-2xl font-serif mb-2 ${
                    plan.highlighted ? "text-secondary-foreground" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.highlighted
                      ? "text-secondary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span
                  className={`text-5xl font-serif ${
                    plan.highlighted ? "text-secondary-foreground" : "text-foreground"
                  }`}
                >
                  €{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span
                  className={`text-sm ${
                    plan.highlighted
                      ? "text-secondary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  /month
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? "text-primary" : "text-primary"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlighted
                          ? "text-secondary-foreground/80"
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
                  className="w-full"
                >
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
