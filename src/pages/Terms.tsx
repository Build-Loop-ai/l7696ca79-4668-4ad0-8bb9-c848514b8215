import { Link } from "react-router-dom";
import { Phone, ArrowLeft } from "lucide-react";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const Terms = () => {
  const { config } = useSiteConfigTransformed();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-medium text-foreground">
              {config.name}
            </span>
          </div>

          <h1 className="text-4xl font-serif text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using {config.name} ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              {config.name} provides an AI-powered virtual receptionist service that answers phone calls, 
              schedules appointments, and provides information to callers on behalf of your business.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground mb-4">
              You must register for an account to use the Service. You agree to provide accurate, current, 
              and complete information during registration and to update such information to keep it accurate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">4. Subscription and Payment</h2>
            <p className="text-muted-foreground mb-4">
              Access to certain features requires a paid subscription. You agree to pay all fees associated 
              with your subscription plan. Subscriptions are billed in advance on a monthly or annual basis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">5. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use the Service for any unlawful purpose or in any way that could damage, 
              disable, or impair the Service. You are responsible for all activity that occurs under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">6. Data and Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Your use of the Service is also governed by our Privacy Policy. Call recordings and transcripts 
              are stored securely and are accessible only to you and your authorized team members.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">7. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to suspend or terminate your account at any time for violation of these 
              terms. You may cancel your subscription at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              The Service is provided "as is" without warranties of any kind. We shall not be liable for 
              any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">9. Contact</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms, please contact us at{" "}
              <a href={`mailto:${config.supportEmail}`} className="text-primary hover:underline">
                {config.supportEmail}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
