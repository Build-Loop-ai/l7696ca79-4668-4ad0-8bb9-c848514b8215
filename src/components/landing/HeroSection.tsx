import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles, ChevronDown } from "lucide-react";
import { useMousePosition } from "@/hooks/useMousePosition";

const HeroSection = () => {
  const heroRef = useRef<HTMLElement>(null);
  const mousePosition = useMousePosition(heroRef);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden landing-theme"
      style={{
        background: `
          radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(265 97% 64% / 0.08), transparent 40%),
          radial-gradient(ellipse 80% 50% at 50% -20%, hsl(265 97% 64% / 0.15), transparent),
          radial-gradient(ellipse 60% 40% at 100% 0%, hsl(220 95% 65% / 0.1), transparent),
          radial-gradient(ellipse 50% 30% at 0% 100%, hsl(265 97% 64% / 0.08), transparent),
          linear-gradient(to bottom, hsl(240 10% 4%), hsl(240 10% 6%))
        `,
      }}
    >
      {/* Grain overlay */}
      <div className="grain-overlay absolute inset-0 pointer-events-none" />

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="orb w-[600px] h-[600px] -top-40 -left-40 opacity-30"
          style={{ background: 'hsl(265 97% 64% / 0.3)' }}
        />
        <div 
          className="orb w-[500px] h-[500px] top-1/2 -right-40 opacity-20"
          style={{ background: 'hsl(220 95% 65% / 0.3)', animationDelay: '-5s' }}
        />
        <div 
          className="orb w-[400px] h-[400px] -bottom-20 left-1/3 opacity-20"
          style={{ background: 'hsl(265 97% 64% / 0.2)', animationDelay: '-10s' }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center min-h-[calc(100vh-8rem)] justify-center">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium mb-8 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[hsl(265_97%_64%)]" />
            <span className="text-sm text-white/90 font-medium">Powered by Advanced AI</span>
            <span className="px-2 py-0.5 rounded-full bg-[hsl(265_97%_64%)] text-white text-xs font-semibold">
              NEW
            </span>
          </div>

          {/* Headline */}
          <h1 
            className={`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-white leading-[1.1] mb-6 tracking-tight transition-all duration-1000 delay-100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Your AI Receptionist
            <br />
            <span className="bg-gradient-to-r from-[hsl(265_97%_64%)] via-[hsl(220_95%_65%)] to-[hsl(265_97%_64%)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
              Never Sleeps
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Answer every call. Book every appointment. 24/7. Let AI handle your
            front desk while you focus on what matters most.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] hover:opacity-90 text-white border-0 px-8 py-6 text-lg font-semibold rounded-2xl shadow-glow-violet transition-all duration-300 hover:shadow-[0_0_80px_-15px_hsl(265_97%_64%)] hover:-translate-y-1 group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button 
                size="lg" 
                variant="outline"
                className="glass-premium text-white border-white/20 px-8 py-6 text-lg font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                See Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div 
            className={`mt-16 grid grid-cols-3 gap-8 md:gap-16 transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              { value: "500+", label: "Clinics" },
              { value: "50K+", label: "Calls Handled" },
              { value: "4.9★", label: "Rating" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div 
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-2 text-white/40">
              <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
              <ChevronDown className="w-5 h-5 scroll-indicator" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
