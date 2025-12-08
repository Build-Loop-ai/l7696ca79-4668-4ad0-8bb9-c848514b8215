import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    { question: "How does the AI receptionist work?", answer: "Our AI uses advanced natural language processing to understand callers and respond naturally. It can answer questions, book appointments, and transfer urgent calls." },
    { question: "Can the AI actually book appointments?", answer: "Yes! The AI integrates with Google Calendar, checks real-time availability, and sends confirmation notifications." },
    { question: "What languages does Callisto support?", answer: "Callisto supports 20+ languages including English, Dutch, German, French, Spanish, and more." },
    { question: "How long does setup take?", answer: "Most clinics are up and running in under 15 minutes with our guided onboarding wizard." },
    { question: "Can I keep my existing phone number?", answer: "Absolutely! Forward your existing number to Callisto or port it directly." },
    { question: "Is my patient data secure?", answer: "Yes, all data is encrypted and we're GDPR compliant. We never share or sell your data." },
  ];

  return (
    <section id="faq" className="py-24 md:py-32 landing-theme relative overflow-hidden">
      <div className="absolute inset-0 bg-[hsl(240_10%_4%)]" />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm text-white/60">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Frequently asked <span className="bg-gradient-to-r from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] bg-clip-text text-transparent">questions</span>
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="glass-card rounded-2xl px-6 border-0">
                <AccordionTrigger className="text-left font-medium text-white hover:text-[hsl(265_97%_64%)] py-6 text-base md:text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-white/50 pb-6 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
