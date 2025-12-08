import { useRef, useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  PhoneForwarded,
  Languages,
  Mic,
  BarChart3,
} from "lucide-react";

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const features = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Never miss a call again. Your AI receptionist answers every call, day or night.",
      gradient: "from-[hsl(265_97%_64%)] to-[hsl(280_90%_55%)]",
    },
    {
      icon: Calendar,
      title: "Smart Booking",
      description: "Seamlessly integrates with your calendar for real-time appointment scheduling.",
      gradient: "from-[hsl(220_95%_65%)] to-[hsl(200_90%_55%)]",
    },
    {
      icon: PhoneForwarded,
      title: "Call Routing",
      description: "Urgent cases get transferred immediately. Routine calls handled automatically.",
      gradient: "from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)]",
    },
    {
      icon: Languages,
      title: "Multi-language",
      description: "Communicate with patients in their preferred language. 20+ languages supported.",
      gradient: "from-[hsl(280_90%_55%)] to-[hsl(265_97%_64%)]",
    },
    {
      icon: Mic,
      title: "Custom Voice",
      description: "Choose from natural-sounding voices. Customize tone and personality.",
      gradient: "from-[hsl(200_90%_55%)] to-[hsl(220_95%_65%)]",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Monitor calls, view transcripts, and track performance from one dashboard.",
      gradient: "from-[hsl(220_95%_65%)] to-[hsl(265_97%_64%)]",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate how far we've scrolled through the section
      const scrolled = -rect.top;
      const scrollableDistance = sectionHeight - viewportHeight;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="features" 
      className="min-h-[300vh] landing-theme relative"
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(240_10%_4%)] via-[hsl(240_10%_6%)] to-[hsl(240_10%_4%)]" />
        
        {/* Gradient orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 transition-all duration-300"
          style={{ 
            background: 'linear-gradient(135deg, hsl(265 97% 64%), hsl(220 95% 65%))',
            left: `${20 + scrollProgress * 60}%`,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-sm text-white/60">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Powerful features designed specifically for healthcare providers.
            </p>
          </div>

          {/* Horizontal scroll container */}
          <div 
            ref={scrollContainerRef}
            className="relative"
          >
            <div 
              className="flex gap-6 transition-transform duration-100 ease-out"
              style={{ 
                transform: `translateX(${-scrollProgress * (features.length - 2) * 360}px)`,
              }}
            >
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[340px]"
                >
                  <div className="glass-card rounded-3xl p-8 h-full transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-[0_0_60px_-20px_hsl(265_97%_64%/0.3)] group">
                    {/* Icon */}
                    <div 
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-display font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {features.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    Math.floor(scrollProgress * features.length) >= idx 
                      ? 'w-8 bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)]' 
                      : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
