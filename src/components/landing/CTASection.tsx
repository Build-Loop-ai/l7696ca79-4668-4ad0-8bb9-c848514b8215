import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary relative overflow-hidden grain-overlay">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-sm text-secondary-foreground/90">
              Join 500+ clinics already using Callisto
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-6xl font-serif text-secondary-foreground mb-6">
            Ready to transform your{" "}
            <span className="italic text-primary">front desk?</span>
          </h2>

          <p className="text-lg md:text-xl text-secondary-foreground/70 max-w-2xl mx-auto mb-10">
            Start your 14-day free trial today. No credit card required, no
            commitment. See the difference AI can make.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="glass" size="xl">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
