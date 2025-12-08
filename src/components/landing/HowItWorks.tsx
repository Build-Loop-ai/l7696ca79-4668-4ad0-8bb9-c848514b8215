import { useRef, useEffect, useState } from "react";
import { Phone, Brain, CheckCircle, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: Phone,
      number: "01",
      title: "Connect Your Number",
      description: "Forward your existing line or get a new one. Setup takes less than 5 minutes with our guided wizard.",
      color: "hsl(265 97% 64%)",
    },
    {
      icon: Brain,
      number: "02", 
      title: "Train Your AI",
      description: "Customize the voice, personality, and responses. Your AI learns your business's unique needs.",
      color: "hsl(220 95% 65%)",
    },
    {
      icon: CheckCircle,
      number: "03",
      title: "Never Miss a Call",
      description: "Your AI handles calls 24/7, books appointments, and transfers urgent cases to your team.",
      color: "hsl(265 97% 64%)",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepCards = entry.target.querySelectorAll('.step-card');
            stepCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('active');
                setActiveStep(index);
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-24 md:py-32 landing-theme relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(240_10%_4%)]" />
      
      {/* Gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[hsl(265_97%_64%/0.05)] blur-[100px] rounded-full" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm text-white/60">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Get started in{" "}
            <span className="bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] bg-clip-text text-transparent">
              three steps
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            No technical knowledge required. Our onboarding wizard guides you through everything.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="step-card relative group opacity-0 translate-y-8 transition-all duration-700"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-[2px]">
                  <div 
                    className="h-full bg-gradient-to-r from-white/20 to-transparent transition-all duration-1000"
                    style={{ 
                      transform: activeStep > idx ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left'
                    }}
                  />
                </div>
              )}

              {/* Card */}
              <div className="relative glass-card rounded-3xl p-8 transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2 group-hover:shadow-[0_0_60px_-20px_hsl(265_97%_64%/0.3)]">
                {/* Step number */}
                <div 
                  className="absolute -top-4 left-8 px-4 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${step.color}, hsl(220 95% 65%))` }}
                >
                  {step.number}
                </div>

                {/* Icon container */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${step.color}20, hsl(220 95% 65% / 0.1))` }}
                >
                  <step.icon className="w-8 h-8" style={{ color: step.color }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: step.color }}>
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .step-card.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
