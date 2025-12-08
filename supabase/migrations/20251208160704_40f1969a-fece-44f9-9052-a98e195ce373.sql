-- Create plans table for admin-configurable pricing
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price_monthly_cents integer NOT NULL,
  price_annual_cents integer,
  stripe_product_id text,
  stripe_price_id_monthly text,
  stripe_price_id_annual text,
  minutes_included integer DEFAULT 100,
  phone_numbers_limit integer DEFAULT 1,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  is_popular boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Public can read active plans (for pricing page)
CREATE POLICY "Anyone can view active plans"
ON public.plans
FOR SELECT
USING (is_active = true);

-- Super admins can manage all plans
CREATE POLICY "Super admins can manage plans"
ON public.plans
FOR ALL
USING (is_system_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default plans
INSERT INTO public.plans (name, slug, description, price_monthly_cents, price_annual_cents, minutes_included, phone_numbers_limit, features, is_popular, sort_order)
VALUES 
  ('Starter', 'starter', 'Perfect for small businesses getting started', 9700, 93120, 100, 1, '["100 AI call minutes", "1 phone number", "Email support", "Basic analytics"]'::jsonb, false, 1),
  ('Growth', 'growth', 'For growing businesses with higher call volume', 19700, 189120, 500, 3, '["500 AI call minutes", "3 phone numbers", "Priority support", "Advanced analytics", "Custom greeting"]'::jsonb, true, 2),
  ('Enterprise', 'enterprise', 'For large organizations with advanced needs', 49700, 477120, 2000, 10, '["2000 AI call minutes", "10 phone numbers", "Dedicated support", "White-label options", "API access", "Custom integrations"]'::jsonb, false, 3);