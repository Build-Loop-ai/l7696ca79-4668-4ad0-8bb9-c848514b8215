import { useEffect, useRef, useState } from "react";
import { Phone, Star, Clock, Users } from "lucide-react";

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
};

const SocialProofBar = () => {
  const stats = [
    { icon: Users, value: 500, suffix: "+", label: "Clinics Trust Us" },
    { icon: Phone, value: 50000, suffix: "+", label: "Calls Handled" },
    { icon: Star, value: 4.9, suffix: "★", label: "Average Rating" },
    { icon: Clock, value: 2, suffix: "min", label: "Avg Response" },
  ];

  const logos = [
    "Dental Care Plus",
    "SmileBright Clinics", 
    "HealthFirst",
    "MediCare Pro",
    "DentaLink",
    "OralHealth",
    "DentistPro",
    "SmileCenter",
  ];

  return (
    <section className="py-20 landing-theme relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(240_10%_6%)] to-[hsl(240_10%_4%)]" />
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Marquee logos */}
        <div className="relative mb-16 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[hsl(240_10%_5%)] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[hsl(240_10%_5%)] to-transparent z-10" />
          
          <div className="flex animate-marquee">
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 mx-12 text-xl font-display text-white/20 hover:text-white/40 transition-colors whitespace-nowrap"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="relative group"
            >
              <div className="glass-card rounded-2xl p-6 text-center transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1">
                {/* Icon */}
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[hsl(265_97%_64%/0.2)] to-[hsl(220_95%_65%/0.2)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-[hsl(265_97%_64%)]" />
                </div>
                
                {/* Value */}
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                  {typeof stat.value === 'number' && stat.value > 100 ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  ) : (
                    `${stat.value}${stat.suffix}`
                  )}
                </div>
                
                {/* Label */}
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
