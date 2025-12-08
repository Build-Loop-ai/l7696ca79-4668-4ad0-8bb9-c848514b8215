import {
  Clock,
  Calendar,
  PhoneForwarded,
  Languages,
  Mic,
  BarChart3,
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Never miss a call again. Your AI receptionist answers every call, day or night, weekends and holidays.",
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description:
        "Seamlessly integrates with your calendar. Patients can book, reschedule, or cancel appointments.",
    },
    {
      icon: PhoneForwarded,
      title: "Smart Call Routing",
      description:
        "Urgent cases get transferred immediately. Routine calls are handled automatically.",
    },
    {
      icon: Languages,
      title: "Multi-language Support",
      description:
        "Communicate with patients in their preferred language. Support for 20+ languages.",
    },
    {
      icon: Mic,
      title: "Custom Voice & Personality",
      description:
        "Choose from natural-sounding voices. Customize the tone from professional to friendly.",
    },
    {
      icon: BarChart3,
      title: "Real-time Dashboard",
      description:
        "Monitor calls, view transcripts, and track performance metrics from one central dashboard.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Everything you need to{" "}
            <span className="italic text-primary">transform</span> your front
            desk
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed specifically for healthcare providers and
            local businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-card rounded-3xl p-8 shadow-sm hover-lift border border-border/50 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-serif text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
