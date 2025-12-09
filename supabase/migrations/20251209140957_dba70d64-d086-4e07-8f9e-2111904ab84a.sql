-- Create site_config table for admin-editable branding
CREATE TABLE public.site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Branding
  site_name text NOT NULL DEFAULT 'AI Receptionist',
  tagline text NOT NULL DEFAULT 'Your AI receptionist, always ready',
  description text NOT NULL DEFAULT 'Never miss a call again. AI that answers, books, and delights your customers 24/7.',
  -- Contact
  support_email text NOT NULL DEFAULT 'support@example.com',
  sales_email text NOT NULL DEFAULT 'sales@example.com',
  -- Social links (empty string = hidden)
  social_twitter text DEFAULT '',
  social_linkedin text DEFAULT '',
  social_instagram text DEFAULT '',
  -- Legal URLs
  privacy_url text DEFAULT '/privacy',
  terms_url text DEFAULT '/terms',
  -- Features
  trial_days integer NOT NULL DEFAULT 14,
  annual_discount integer NOT NULL DEFAULT 20,
  -- Currency
  currency text NOT NULL DEFAULT 'EUR',
  currency_symbol text NOT NULL DEFAULT '€',
  -- Social proof
  social_proof_count text DEFAULT '500+',
  social_proof_label text DEFAULT 'businesses worldwide',
  -- Demo page
  demo_enabled boolean DEFAULT true,
  demo_title text DEFAULT 'Hear Your AI Receptionist',
  demo_subtitle text DEFAULT 'Experience the future of customer service in 30 seconds',
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read site config (needed for landing page)
CREATE POLICY "Anyone can view site config"
  ON public.site_config FOR SELECT
  USING (true);

-- Only super admins can update
CREATE POLICY "Super admins can update site config"
  ON public.site_config FOR UPDATE
  USING (is_system_admin(auth.uid()));

-- Only super admins can insert (for initial setup)
CREATE POLICY "Super admins can insert site config"
  ON public.site_config FOR INSERT
  WITH CHECK (is_system_admin(auth.uid()));

-- Insert default row
INSERT INTO public.site_config (
  site_name, tagline, description,
  support_email, sales_email,
  social_twitter, social_linkedin,
  trial_days, annual_discount,
  currency, currency_symbol,
  social_proof_count, social_proof_label
) VALUES (
  'Callisto', 'Your AI receptionist, always ready',
  'Never miss a call again. AI that answers, books, and delights your customers 24/7.',
  'support@callisto.ai', 'sales@callisto.ai',
  'https://twitter.com/callisto', 'https://linkedin.com/company/callisto',
  14, 20,
  'EUR', '€',
  '500+', 'clinics worldwide'
);

-- Add trigger for updated_at
CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();