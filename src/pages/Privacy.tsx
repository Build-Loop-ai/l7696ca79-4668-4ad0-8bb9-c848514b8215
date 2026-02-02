import { Link } from "react-router-dom";
import { Phone, ArrowLeft } from "lucide-react";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const Privacy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Business information (company name, address, phone number)</li>
              <li>Call data (recordings, transcripts, caller information)</li>
              <li>Payment information (processed securely by Stripe)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Process your calls through our AI receptionist</li>
              <li>Send you important updates about the Service</li>
              <li>Process payments and prevent fraud</li>
              <li>Improve our AI models and service quality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">3. Call Recordings and Transcripts</h2>
            <p className="text-muted-foreground mb-4">
              Call recordings and transcripts are stored securely and are only accessible to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>You and your authorized team members</li>
              <li>Our support team when you request assistance</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We do not sell or share your call data with third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">4. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Encryption in transit and at rest</li>
              <li>Secure data centers</li>
              <li>Regular security audits</li>
              <li>Role-based access controls</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              We use trusted third-party services to provide the Service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li><strong>Vapi.ai</strong> - Voice AI processing</li>
              <li><strong>Twilio</strong> - Phone number provisioning</li>
              <li><strong>ElevenLabs</strong> - Voice synthesis</li>
              <li><strong>Stripe</strong> - Payment processing</li>
              <li><strong>Google</strong> - Calendar integration (optional)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Each service has its own privacy policy governing their use of your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your data for as long as your account is active. You can request deletion of 
              your data at any time by contacting support. Some data may be retained for legal or 
              regulatory compliance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">8. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use essential cookies to maintain your session and preferences. We do not use 
              third-party tracking cookies for advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by email or through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us at{" "}
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

export default Privacy;
