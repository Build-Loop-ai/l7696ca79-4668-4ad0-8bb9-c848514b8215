import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How does the AI receptionist work?",
      answer:
        "Our AI uses advanced natural language processing to understand callers and respond naturally. It can answer common questions, book appointments by checking your calendar availability, and transfer urgent calls to your team. The AI learns your business's specific needs during onboarding.",
    },
    {
      question: "Can the AI actually book appointments?",
      answer:
        "Yes! The AI integrates with popular calendar systems like Google Calendar. It checks real-time availability, asks for patient information, confirms the booking, and sends confirmation notifications. You can set buffer times, appointment types, and duration rules.",
    },
    {
      question: "What languages does Callisto support?",
      answer:
        "Callisto supports 20+ languages including English, Dutch, German, French, Spanish, Portuguese, Italian, and more. The AI can automatically detect the caller's language and respond accordingly, or you can set a primary language for your clinic.",
    },
    {
      question: "How long does setup take?",
      answer:
        "Most clinics are up and running in under 15 minutes. Our onboarding wizard guides you through setting up your business hours, services, AI personality, and phone number. No technical knowledge is required.",
    },
    {
      question: "Can I keep my existing phone number?",
      answer:
        "Absolutely! You have two options: forward your existing number to your Callisto AI number, or port your number directly to Callisto. We provide step-by-step instructions for both options, and our support team can help with the process.",
    },
    {
      question: "What happens if the AI can't handle a call?",
      answer:
        "You can set up fallback rules for any scenario. The AI can transfer calls to your team, take a message, or schedule a callback. For medical emergencies, you can configure immediate transfer to specific numbers.",
    },
    {
      question: "Is my patient data secure?",
      answer:
        "Yes, we take data security very seriously. All data is encrypted in transit and at rest. We're GDPR compliant, and we never share or sell your data. Call recordings are securely stored and can be automatically deleted based on your retention policy.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time with no cancellation fees. If you cancel, you'll retain access until the end of your billing period. We also offer a 14-day free trial so you can test everything before committing.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Frequently asked{" "}
            <span className="italic text-primary">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Callisto. Can't find an answer?
            Contact our support team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-card rounded-2xl px-6 border border-border/50 shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-6 text-base md:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
