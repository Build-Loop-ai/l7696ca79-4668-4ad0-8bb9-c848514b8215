import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    { quote: "Callisto has been a game-changer for our practice. We never miss a call anymore.", author: "Dr. Sarah van den Berg", role: "Dentist", clinic: "Amsterdam Dental Care", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
    { quote: "The AI handles appointment bookings perfectly. My receptionist can focus on patients.", author: "Michael de Vries", role: "Practice Manager", clinic: "Rotterdam Family Dentistry", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    { quote: "Setup was incredibly easy. ROI was positive within the first month.", author: "Dr. Emma Jansen", role: "Owner", clinic: "SmileBright Utrecht", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  ];

  return (
    <section id="testimonials" className="py-24 md:py-32 landing-theme relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(240_10%_4%)] to-[hsl(240_10%_6%)]" />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm text-white/60">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Loved by <span className="bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] bg-clip-text text-transparent">professionals</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-card rounded-3xl p-8 transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2">
              <div className="flex gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[hsl(265_97%_64%)] text-[hsl(265_97%_64%)]" />)}</div>
              <blockquote className="text-white text-lg leading-relaxed mb-8">"{t.quote}"</blockquote>
              <div className="flex items-center gap-4">
                <img src={t.image} alt={t.author} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-white">{t.author}</div>
                  <div className="text-sm text-white/40">{t.role} at {t.clinic}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
