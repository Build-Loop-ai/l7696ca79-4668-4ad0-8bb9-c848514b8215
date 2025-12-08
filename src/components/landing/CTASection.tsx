import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 landing-theme relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(240_10%_4%)] to-[hsl(240_10%_8%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[hsl(265_97%_64%/0.1)] blur-[150px] rounded-full" />
      
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium mb-8">
            <Sparkles className="w-4 h-4 text-[hsl(265_97%_64%)]" />
            <span className="text-sm text-white/80">Join 500+ clinics using Callisto</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-6">
            Ready to transform your{" "}
            <span className="bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] bg-clip-text text-transparent">front desk?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-glow-violet hover:shadow-[0_0_80px_-15px_hsl(265_97%_64%)] hover:-translate-y-1 transition-all group">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="glass-premium text-white border-white/20 px-8 py-6 text-lg rounded-2xl hover:bg-white/10 transition-all">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
