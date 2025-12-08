import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Phone, CheckCircle2 } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen hero-gradient grain-overlay overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-down">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-sm text-white/90">Trusted by 500+ clinics</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-white leading-tight mb-6 animate-fade-in-up">
              Your AI Receptionist{" "}
              <span className="italic text-teal-light">Never Sleeps</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/70 max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-in-up stagger-1">
              Answer every call. Book every appointment. 24/7. Let AI handle your
              front desk while you focus on what matters most.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-2">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Button
                variant="glass"
                size="xl"
                className="w-full sm:w-auto gap-2"
              >
                <Play className="w-5 h-5" />
                See Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start animate-fade-in-up stagger-3">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                Setup in 5 minutes
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Right Column - Phone Visualization */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in stagger-2">
            <div className="relative">
              {/* Phone mockup */}
              <div className="w-72 md:w-80 h-[580px] md:h-[620px] bg-gradient-to-b from-navy-light to-navy rounded-[3rem] p-3 shadow-2xl animate-float">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone screen content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-background to-muted p-6 flex flex-col">
                    {/* Time */}
                    <div className="text-center mb-8">
                      <div className="text-4xl font-light text-foreground">9:41</div>
                      <div className="text-sm text-muted-foreground">Monday, March 15</div>
                    </div>

                    {/* Incoming call card */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full bg-white rounded-3xl shadow-xl p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
                          <Phone className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Incoming Call
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          +31 6 12345678
                        </p>
                        
                        {/* Sound wave */}
                        <div className="flex justify-center mb-4">
                          <div className="sound-wave text-teal">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-teal font-medium">
                          <span className="w-2 h-2 rounded-full bg-teal pulse-indicator" />
                          AI Answering...
                        </div>
                      </div>
                    </div>

                    {/* Bottom indicator */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-32 h-1 bg-foreground/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <div className="absolute -left-4 md:-left-16 top-1/4 bg-white rounded-2xl shadow-xl p-4 animate-fade-in-up stagger-3 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Appointment Booked</p>
                    <p className="text-xs text-muted-foreground">Dr. Smith - 2:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 md:-right-12 bottom-1/3 bg-white rounded-2xl shadow-xl p-4 animate-fade-in-up stagger-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Call Handled</p>
                    <p className="text-xs text-muted-foreground">Duration: 1:42</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
