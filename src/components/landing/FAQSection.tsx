import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
    <section id="faq" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-muted/50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Frequently asked{" "}
            <span className="italic text-gradient">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Callisto. Can't find an answer?
            Contact our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-card rounded-2xl px-6 border border-border/50 shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/20 transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-6 text-base md:text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-medium text-foreground">Still have questions?</p>
              <p className="text-sm text-muted-foreground">Our team is here to help.</p>
            </div>
            <Button variant="outline" size="lg" className="ml-0 sm:ml-4">
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;