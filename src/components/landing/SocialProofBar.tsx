import { Phone, Star, Clock } from "lucide-react";

const SocialProofBar = () => {
  const stats = [
    { icon: Phone, value: "50,000+", label: "Calls Handled" },
    { icon: Star, value: "4.9★", label: "Satisfaction Rate" },
    { icon: Clock, value: "< 2 min", label: "Avg Response" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Partner logos */}
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">
            Trusted by leading healthcare providers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {["Dental Care Plus", "SmileBright Clinics", "HealthFirst", "MediCare Pro", "DentaLink"].map(
              (partner, idx) => (
                <div
                  key={idx}
                  className="text-lg md:text-xl font-serif text-muted-foreground/70"
                >
                  {partner}
                </div>
              )
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-6 rounded-2xl bg-muted/50 hover-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-serif text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
