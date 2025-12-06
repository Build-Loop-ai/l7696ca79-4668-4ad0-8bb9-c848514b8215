import { Phone, Brain, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Phone,
      number: "01",
      title: "Connect Your Number",
      description:
        "Forward your existing line or get a new one. Setup takes less than 5 minutes.",
    },
    {
      icon: Brain,
      number: "02",
      title: "Train Your AI",
      description:
        "Customize the voice, personality, and responses. Your AI learns your business.",
    },
    {
      icon: CheckCircle,
      number: "03",
      title: "Never Miss a Call",
      description:
        "Your AI handles calls 24/7, books appointments, and transfers urgent cases.",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Get started in{" "}
            <span className="italic text-primary">three simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No technical knowledge required. Our onboarding wizard guides you
            through everything.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Connection line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative bg-card rounded-3xl p-8 shadow-lg hover-lift border border-border/50">
                {/* Step number */}
                <div className="absolute -top-4 left-8 px-3 py-1 bg-primary rounded-full text-primary-foreground text-sm font-medium">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-serif text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
